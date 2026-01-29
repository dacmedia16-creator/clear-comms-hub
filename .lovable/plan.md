

# Adicionar Notificacao por SMS com SMSFire API v3

## Visao Geral

Adicionar opcao de envio de notificacoes via SMS usando a API SMSFire v3. A autenticacao sera feita via headers `Username` e `Api_Token` conforme documentacao oficial.

---

## Secrets Necessarios

| Secret | Descricao |
|--------|-----------|
| `SMSFIRE_USERNAME` | Nome de usuario da plataforma SMSFire |
| `SMSFIRE_API_TOKEN` | Token de API obtido no menu Configuracoes da plataforma |

---

## Mudancas no Banco de Dados

### 1. Adicionar coluna `notification_sms` na tabela `condominiums`

```sql
ALTER TABLE public.condominiums 
ADD COLUMN notification_sms boolean DEFAULT false;
```

### 2. Criar tabela `sms_logs`

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| announcement_id | uuid | FK para announcements |
| condominium_id | uuid | FK para condominiums |
| recipient_phone | text | Numero do destinatario |
| recipient_name | text | Nome do destinatario |
| status | text | 'sent' ou 'failed' |
| error_message | text | Mensagem de erro |
| sent_at | timestamp | Data/hora do envio |
| created_by | uuid | FK para profiles |

### 3. Politicas RLS para `sms_logs`

- Super admins podem visualizar todos os logs
- Gestores do condominio podem visualizar logs do seu condominio

---

## Arquivos a Criar/Modificar

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `supabase/functions/send-sms/index.ts` | Novo | Edge function para envio de SMS |
| `src/hooks/useSendSMS.ts` | Novo | Hook para chamar a edge function |
| `src/pages/AdminCondominiumPage.tsx` | Editar | Adicionar checkbox SMS no formulario |
| `src/pages/CondominiumSettingsPage.tsx` | Editar | Adicionar toggle SMS nas configuracoes |
| `supabase/config.toml` | Editar | Registrar nova edge function |

---

## Edge Function: send-sms

### Autenticacao SMSFire v3

```typescript
// Headers de autenticacao
const headers = {
  'Username': Deno.env.get('SMSFIRE_USERNAME'),
  'Api_Token': Deno.env.get('SMSFIRE_API_TOKEN'),
};

// Endpoint GET com query params
const url = new URL('https://api-v3.smsfire.com.br/sms/send/individual');
url.searchParams.set('to', phoneNumber); // Formato E.164: 5511999999999
url.searchParams.set('text', message);

const response = await fetch(url.toString(), {
  method: 'GET',
  headers: headers,
});
```

### Template SMS (maximo 160 caracteres para 1 SMS)

```text
[{CONDO}] {TITULO} - Veja: {LINK}
```

Exemplo: `[Vitrine Esplanada] Manutencao elevadores - Veja: https://app.com/c/vitrine`

---

## Layout do Formulario de Avisos

```text
────────────────────────────────────────
Notificar moradores
────────────────────────────────────────

[✓] Enviar via WhatsApp
    Notificar moradores com telefone cadastrado

[ ] Enviar via SMS
    Habilite nas configuracoes do condominio

[ ] Enviar via Email
    Habilite nas configuracoes do condominio
```

---

## Layout das Configuracoes

```text
┌─────────────────────────────────────────────────────────────┐
│  Notificacoes                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Notificacao por Email                              [    ]  │
│  Enviar avisos por email para os moradores                  │
│                                                             │
│  Notificacao por WhatsApp                           [====]  │
│  Enviar avisos por WhatsApp para os moradores               │
│                                                             │
│  Notificacao por SMS                                [    ]  │
│  Enviar avisos por SMS para os moradores                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Detalhes Tecnicos

### Interface Condominium atualizada

```typescript
interface Condominium {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  notification_whatsapp: boolean;
  notification_email: boolean;
  notification_sms: boolean;  // Novo
}
```

### Novo estado no formulario

```typescript
const [sendSMS, setSendSMS] = useState(false);
```

### Checkbox SMS (usando icone Smartphone roxo)

```tsx
{/* SMS */}
<div className="flex items-start gap-3">
  <Checkbox 
    id="send-sms" 
    checked={sendSMS}
    onCheckedChange={(checked) => setSendSMS(!!checked)}
    disabled={!condominium?.notification_sms}
  />
  <div className="flex-1">
    <Label htmlFor="send-sms" className="cursor-pointer flex items-center gap-2">
      <Smartphone className="w-4 h-4 text-purple-600" />
      Enviar via SMS
    </Label>
    <p className="text-xs text-muted-foreground">
      {condominium?.notification_sms 
        ? "Notificar moradores com telefone cadastrado"
        : "Habilite nas configuracoes do condominio"}
    </p>
  </div>
</div>
```

### Logica de envio atualizada

```typescript
// Apos criacao do aviso
if (sendSMS && condominium.notification_sms) {
  try {
    const result = await sendSMSToMembers(data, condominium, baseUrl);
    if (result.sent > 0) {
      toast({
        title: "SMS enviado",
        description: `${result.sent} mensagens enviadas com sucesso.`,
      });
    }
  } catch (smsError) {
    console.error("Error sending SMS:", smsError);
  }
}
```

### Hook useSendSMS

Similar ao `useSendWhatsApp`, invocando a edge function `send-sms`.

---

## Fluxo de Implementacao

1. Solicitar ao usuario os secrets `SMSFIRE_USERNAME` e `SMSFIRE_API_TOKEN`
2. Executar migration para adicionar coluna e tabela
3. Criar edge function `send-sms`
4. Criar hook `useSendSMS`
5. Atualizar formulario de avisos com checkbox SMS
6. Atualizar pagina de configuracoes com toggle SMS

---

## Icones Utilizados

| Canal | Icone | Cor |
|-------|-------|-----|
| WhatsApp | MessageCircle | Verde (text-green-600) |
| SMS | Smartphone | Roxo (text-purple-600) |
| Email | Mail | Azul (text-blue-600) |

