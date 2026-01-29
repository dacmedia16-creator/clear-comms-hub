

# Plano: Sistema de Envio de WhatsApp via ZionTalk API

## Resumo

Implementar envio automatico de avisos via WhatsApp para os membros do condominio usando a API do ZionTalk. Cada membro com telefone cadastrado recebera a mensagem diretamente no seu WhatsApp pessoal.

---

## O Que Sera Removido/Modificado

| Item | Acao |
|------|------|
| `WhatsAppShareButton.tsx` | Converter para botao de envio em massa |
| Dialog de compartilhamento | Substituir por envio automatico |
| `whatsapp-templates.ts` | Manter templates, remover funcao de compartilhamento |

---

## Alteracoes no Banco de Dados

### 1. Adicionar Campo de Telefone na Tabela Profiles

```sql
ALTER TABLE public.profiles
ADD COLUMN phone text;

COMMENT ON COLUMN public.profiles.phone IS 
  'Telefone no formato internacional E.164 (ex: +5511999999999)';
```

### 2. Criar Tabela de Logs de Envio

```sql
CREATE TABLE public.whatsapp_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE,
  condominium_id uuid REFERENCES condominiums(id) ON DELETE CASCADE,
  recipient_phone text NOT NULL,
  recipient_name text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  sent_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View logs" ON public.whatsapp_logs
FOR SELECT USING (
  can_manage_condominium(condominium_id) OR is_super_admin()
);

CREATE POLICY "Insert logs" ON public.whatsapp_logs
FOR INSERT WITH CHECK (
  can_manage_condominium(condominium_id) OR is_super_admin()
);
```

---

## Secret Necessario

Para configurar a integracao com ZionTalk voce precisara adicionar:

| Secret | Descricao |
|--------|-----------|
| `ZIONTALK_API_KEY` | Sua API Key gerada no painel ZionTalk |

---

## Detalhes da API ZionTalk

Baseado na documentacao oficial:

| Configuracao | Valor |
|--------------|-------|
| Endpoint | `POST https://app.ziontalk.com/api/send_message/` |
| Autenticacao | Basic Auth (API Key como username, senha vazia) |
| Content-Type | `multipart/form-data` ou `application/x-www-form-urlencoded` |
| Resposta Sucesso | Status HTTP 201 (sem corpo) |

### Parametros da API

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| msg | string | SIM | Mensagem de texto |
| mobile_phone | string | SIM | Numero no formato E.164 (ex: +5511999999999) |
| cd | string | NAO | Codigo do pais (opcional se numero ja tem DDI) |

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `supabase/functions/send-whatsapp/index.ts` | Edge function para envio via ZionTalk |
| `src/hooks/useSendWhatsApp.ts` | Hook para chamar a edge function |

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/lib/whatsapp-templates.ts` | Simplificar para apenas gerar texto da mensagem |
| `src/pages/AdminCondominiumPage.tsx` | Adicionar botao de envio em massa e feedback |
| `src/components/WhatsAppShareButton.tsx` | Converter para `SendWhatsAppButton` |
| `src/pages/super-admin/SuperAdminCondoMembers.tsx` | Adicionar campo telefone na interface |

---

## Fluxo de Envio

```text
1. Admin cria/seleciona aviso
          |
          v
2. Clica em "Enviar via WhatsApp"
          |
          v
3. Frontend chama edge function send-whatsapp
          |
          v
4. Edge function:
   a. Busca membros com telefone cadastrado
   b. Gera mensagem baseada no template
   c. Para cada membro, envia via ZionTalk API
   d. Registra log de cada envio
          |
          v
5. Retorna resultado (X enviados, Y falhas)
          |
          v
6. Admin ve toast com resultado
```

---

## Secao Tecnica

### Edge Function - Estrutura

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, ...',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const ZIONTALK_API_KEY = Deno.env.get('ZIONTALK_API_KEY');
  
  // Basic Auth: API Key como username, senha vazia
  const authHeader = 'Basic ' + base64Encode(`${ZIONTALK_API_KEY}:`);

  const { announcement, condominium, baseUrl } = await req.json();

  // 1. Criar cliente Supabase com service role
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // 2. Buscar membros com telefone
  const { data: members } = await supabase
    .from('user_roles')
    .select('user_id, profiles!inner(id, phone, full_name)')
    .eq('condominium_id', condominium.id)
    .not('profiles.phone', 'is', null);

  // 3. Gerar mensagem
  const message = generateMessage(announcement, condominium, baseUrl);

  // 4. Enviar para cada membro via ZionTalk
  const results = [];
  for (const member of members) {
    const formData = new FormData();
    formData.append('msg', message);
    formData.append('mobile_phone', member.profiles.phone);

    const response = await fetch(
      'https://app.ziontalk.com/api/send_message/',
      {
        method: 'POST',
        headers: { 'Authorization': authHeader },
        body: formData,
      }
    );

    const success = response.status === 201;
    results.push({ 
      phone: member.profiles.phone, 
      name: member.profiles.full_name,
      success 
    });

    // Registrar log
    await supabase.from('whatsapp_logs').insert({
      announcement_id: announcement.id,
      condominium_id: condominium.id,
      recipient_phone: member.profiles.phone,
      recipient_name: member.profiles.full_name,
      status: success ? 'sent' : 'failed',
      error_message: success ? null : await response.text(),
    });
  }

  const sent = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return new Response(
    JSON.stringify({ total: results.length, sent, failed, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
```

### Formato do Telefone

Os telefones devem ser salvos no formato E.164:
- `+5511999999999` (com DDI)
- A API aceita esse formato diretamente

### Interface Atualizada

Apos publicar aviso, dialog mostra:
- Contagem de membros com telefone
- Botao "Enviar para X membros"
- Loading durante envio
- Resultado: "Y mensagens enviadas, Z falhas"

---

## Resultado Final

Apos implementacao:
- Envio automatico de WhatsApp para todos os membros com telefone
- Logs de cada envio para auditoria
- Interface simples para o admin
- Templates formatados por categoria mantidos

