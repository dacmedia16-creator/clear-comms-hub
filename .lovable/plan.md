
# Adicionar Opções de Envio WhatsApp e Email no Formulário de Avisos

## Visao Geral

Adicionar opcoes de notificacao diretamente no formulario de criacao de avisos, permitindo ao usuario escolher se deseja enviar via WhatsApp e/ou Email apos a publicacao.

---

## Problema Identificado: Erro de RLS

O screenshot mostra um erro: "new row violates row-level security policy for table 'announcements'". Isso precisa ser corrigido antes de adicionar as novas funcionalidades.

**Causa provavel:** A funcao `can_create_announcement` verifica se o usuario pode criar avisos, mas pode haver um problema na verificacao de permissoes para o usuario atual.

---

## Layout Proposto

```text
┌─────────────────────────────────────────────────────────────┐
│  Criar novo aviso                                          X │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Titulo do aviso *                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Reforma da Piscina                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Categoria *                                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Informativo                                     [v] │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Resumo curto (opcional)                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Ficara Fechada                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Conteudo completo *                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 10 dias                                             │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [o] Fixar no topo        [o] Marcar como urgente           │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Notificar moradores                                        │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [v] Enviar via WhatsApp                                    │
│      Notificar todos os moradores com telefone cadastrado   │
│                                                             │
│  [ ] Enviar via Email                                       │
│      Notificar todos os moradores com email cadastrado      │
│                                                             │
│                              [ Cancelar ]  [ Publicar aviso]│
└─────────────────────────────────────────────────────────────┘
```

---

## Alteracoes no Formulario

### Estado Adicional
```typescript
// Opcoes de notificacao
const [sendWhatsApp, setSendWhatsApp] = useState(false);
const [sendEmail, setSendEmail] = useState(false);
const [notificationStatus, setNotificationStatus] = useState<{
  whatsapp?: { sent: number; failed: number };
  email?: { sent: number; failed: number };
} | null>(null);
```

### Verificacao de Disponibilidade
- Carregar configuracoes do condominio (`notification_whatsapp`, `notification_email`)
- Desabilitar opcoes que nao estao habilitadas no condominio
- Mostrar tooltip explicando que a opcao precisa ser habilitada nas configuracoes

---

## Fluxo de Publicacao Atualizado

1. Usuario preenche o formulario
2. Marca as opcoes de envio desejadas (WhatsApp/Email)
3. Clica em "Publicar aviso"
4. Sistema:
   - Cria o aviso no banco de dados
   - Se WhatsApp marcado: chama a edge function `send-whatsapp`
   - Se Email marcado: chama a edge function `send-email` (nova)
5. Exibe dialog de sucesso com resumo dos envios

---

## Arquivos a Modificar

### 1. `src/pages/AdminCondominiumPage.tsx`
- Adicionar estados para opcoes de envio
- Carregar configuracoes do condominio (notification_whatsapp, notification_email)
- Adicionar secao de notificacoes no formulario
- Chamar funcoes de envio apos criacao do aviso

### 2. Nova Edge Function: `supabase/functions/send-email/index.ts`
- Buscar membros com email cadastrado
- Gerar template de email baseado na categoria
- Enviar usando Resend API
- Registrar envios em tabela de logs

---

## Nova Tabela: email_logs

Estrutura similar a `whatsapp_logs`:
- id (uuid)
- announcement_id (uuid, FK)
- condominium_id (uuid, FK)
- recipient_email (text)
- recipient_name (text)
- status (text: 'sent' | 'failed')
- error_message (text)
- sent_at (timestamp)
- created_by (uuid, FK)

---

## Detalhes Tecnicos

### Verificacao de Permissoes
```typescript
// Carregar condominio com configuracoes de notificacao
const { data: condoData } = await supabase
  .from("condominiums")
  .select("*, notification_whatsapp, notification_email")
  .eq("id", condoId)
  .single();
```

### Secao de Notificacoes no Formulario
```tsx
{/* Secao de Notificacoes */}
<div className="border-t pt-4 mt-4">
  <Label className="text-sm font-medium mb-3 block">
    Notificar moradores
  </Label>
  
  <div className="space-y-3">
    <div className="flex items-start gap-3">
      <Checkbox 
        id="send-whatsapp" 
        checked={sendWhatsApp}
        onCheckedChange={setSendWhatsApp}
        disabled={!condominium?.notification_whatsapp}
      />
      <div className="flex-1">
        <Label htmlFor="send-whatsapp" className="cursor-pointer flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-green-600" />
          Enviar via WhatsApp
        </Label>
        <p className="text-xs text-muted-foreground">
          {condominium?.notification_whatsapp 
            ? "Notificar moradores com telefone cadastrado"
            : "Habilite nas configuracoes do condominio"}
        </p>
      </div>
    </div>
    
    <div className="flex items-start gap-3">
      <Checkbox 
        id="send-email" 
        checked={sendEmail}
        onCheckedChange={setSendEmail}
        disabled={!condominium?.notification_email}
      />
      <div className="flex-1">
        <Label htmlFor="send-email" className="cursor-pointer flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-600" />
          Enviar via Email
        </Label>
        <p className="text-xs text-muted-foreground">
          {condominium?.notification_email 
            ? "Notificar moradores com email cadastrado"
            : "Habilite nas configuracoes do condominio"}
        </p>
      </div>
    </div>
  </div>
</div>
```

### Logica de Envio Apos Criacao
```typescript
// Apos criar o aviso com sucesso
if (sendWhatsApp && condominium.notification_whatsapp) {
  const whatsappResult = await sendToMembersWhatsApp(data, condominium, baseUrl);
  // Armazenar resultado
}

if (sendEmail && condominium.notification_email) {
  const emailResult = await sendToMembersEmail(data, condominium, baseUrl);
  // Armazenar resultado
}
```

---

## Dependencia: API Key Resend

Para enviar emails, precisamos da chave da API Resend:
- **RESEND_API_KEY** - sera solicitada antes de implementar

---

## Correcao do Erro de RLS

Verificar se o usuario tem o role correto no condominio:
1. Confirmar que o usuario esta autenticado
2. Verificar se tem role de admin, syndic ou collaborator no condominio
3. Garantir que `created_by` esta sendo preenchido corretamente com o profile.id

---

## Resumo das Mudanças

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `src/pages/AdminCondominiumPage.tsx` | Modificar | Adicionar opcoes de envio WhatsApp/Email |
| `supabase/functions/send-email/index.ts` | Criar | Edge function para envio de emails |
| `src/hooks/useSendEmail.ts` | Criar | Hook para envio de emails |
| Migration: email_logs | Criar | Tabela para registrar envios de email |

