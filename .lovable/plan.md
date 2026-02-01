

# Adicionar Envio de SMS na Indicação de Síndico

## Objetivo

Quando um morador indicar um síndico, além de WhatsApp e Email, o sistema também enviará um SMS para o telefone informado.

---

## Mudanças Necessárias

### 1. Banco de Dados

Adicionar coluna `sms_sent` na tabela `syndic_referrals` para rastrear o status do envio de SMS.

```sql
ALTER TABLE syndic_referrals 
ADD COLUMN sms_sent boolean DEFAULT false;
```

---

### 2. Edge Function: `send-referral`

**Arquivo:** `supabase/functions/send-referral/index.ts`

Adicionar:
- Função `formatPhoneForSMSFire()` para formatar telefone
- Função `sendSMS()` para chamar a API SMSFire v3
- Função `getSMSMessage()` com template de mensagem curta (max 160 chars)
- Incluir envio de SMS na função `sendNotificationsInBackground()`
- Atualizar `updateReferralStatus()` para incluir `sms_sent`

**Template SMS (máx 160 caracteres):**
```
AVISO PRO: [Referrer] do [Condo] indicou voce! 3 meses GRATIS. Acesse clear-comms-hub.lovable.app
```

---

### 3. Edge Function: `resend-referral`

**Arquivo:** `supabase/functions/resend-referral/index.ts`

Atualizar:
- Interface `ResendRequest` para aceitar canal "sms"
- Adicionar função `sendSMS()` (mesma lógica do send-referral)
- Adicionar função `getSMSMessage()`
- Incluir lógica de reenvio de SMS na função `resendNotificationsInBackground()`
- Validar canal aceitar "whatsapp", "email", "sms" ou "both"

---

### 4. Hook: `useSyndicReferrals`

**Arquivo:** `src/hooks/useSyndicReferrals.ts`

Atualizar:
- Interface `SyndicReferral` para incluir `sms_sent`
- Estatísticas para incluir `failedSMS`
- Função `resendNotification` aceitar canal "sms"

---

## Fluxo Atualizado

```text
Morador submete indicação
         |
         v
+------------------+
| Salvar no banco  |
| sms_sent: false  |
+------------------+
         |
         v
EdgeRuntime.waitUntil()
         |
         v
+--------------------------------+
|    Background Processing       |
|  1. sendWhatsApp() → update    |
|  2. sendEmail() → update       |
|  3. sendSMS() → update         |  ← NOVO
+--------------------------------+
```

---

## API SMSFire (já configurada)

Usa a mesma integração já existente em `send-sms`:
- URL: `https://api-v3.smsfire.com.br/sms/send/individual`
- Headers: `Username` e `Api_Token`
- Secrets já configurados: `SMSFIRE_USERNAME`, `SMSFIRE_API_TOKEN`

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| Tabela `syndic_referrals` | Adicionar coluna `sms_sent` |
| `supabase/functions/send-referral/index.ts` | Adicionar envio SMS |
| `supabase/functions/resend-referral/index.ts` | Adicionar reenvio SMS |
| `src/hooks/useSyndicReferrals.ts` | Incluir stats e tipo SMS |

---

## Resultado Esperado

Após implementação:
- Ao indicar um síndico, ele receberá: WhatsApp + Email + **SMS**
- No painel de indicações, aparecerá o status de envio do SMS
- Será possível reenviar SMS individualmente se falhar

