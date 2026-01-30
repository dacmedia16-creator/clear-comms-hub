
# Migração: Zoho Mail OAuth → SMTP com Nodemailer

## Por que essa mudança é melhor

| Antes (OAuth2 + API REST) | Depois (SMTP + nodemailer) |
|---------------------------|----------------------------|
| Precisa de 5 secrets | Precisa de apenas 3 secrets |
| Access token expira e precisa renovar | App Password nunca expira |
| Erro "Invalid Access" confuso | Erros claros de autenticação |
| ZOHO_ACCOUNT_ID difícil de encontrar | Sem Account ID necessário |
| Complexidade alta | Simples e direto |

---

## Novos Secrets Necessários

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `ZOHO_SMTP_USER` | Email remetente | noreply@seudominio.com.br |
| `ZOHO_SMTP_PASSWORD` | **App Password** (não senha normal!) | xxxx-xxxx-xxxx-xxxx |
| `ZOHO_SMTP_HOST` | Servidor SMTP | smtppro.zoho.com |

**IMPORTANTE**: Para gerar o App Password:
1. Ativar 2FA na conta Zoho
2. Acessar: **Zoho Account > Security > App Passwords**
3. Gerar nova App Password para "SMTP"

---

## Mudanças Técnicas

### 1. Reescrever `send-email` (Edge Function Principal)

```typescript
import nodemailer from "npm:nodemailer@6.9.8";

const transporter = nodemailer.createTransport({
  host: Deno.env.get("ZOHO_SMTP_HOST") || "smtppro.zoho.com",
  port: 465,
  secure: true,  // SSL
  auth: {
    user: Deno.env.get("ZOHO_SMTP_USER"),
    pass: Deno.env.get("ZOHO_SMTP_PASSWORD"),
  },
});
```

A função mantém:
- Geração do HTML bonito para avisos
- Envio em background com delays (15-30s)
- Logs na tabela `email_logs`

### 2. Reescrever `test-email` (Teste de Conexão)

Suportar 3 actions:
- `test-connection`: Verifica se SMTP conecta (sem enviar)
- `send`: Envia email de teste direto
- (GET): Retorna se API está configurada

### 3. Secrets antigos que podem ser removidos

- `ZOHO_CLIENT_ID` ❌
- `ZOHO_CLIENT_SECRET` ❌
- `ZOHO_REFRESH_TOKEN` ❌
- `ZOHO_ACCOUNT_ID` ❌
- `ZOHO_FROM_EMAIL` → Substituído por `ZOHO_SMTP_USER`

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/send-email/index.ts` | Reescrever para usar nodemailer |
| `supabase/functions/test-email/index.ts` | Reescrever para usar nodemailer |

---

## Fluxo de Implementação

1. **Você configura os novos secrets** (ZOHO_SMTP_USER, ZOHO_SMTP_PASSWORD, ZOHO_SMTP_HOST)
2. Eu reescrevo as edge functions para usar nodemailer
3. Testamos a conexão SMTP
4. Se funcionar, os secrets antigos podem ser removidos depois

---

## Exemplo de Uso (Frontend - sem mudanças!)

O hook `useSendEmail` continua funcionando igual:

```typescript
// Já funciona - sem mudanças necessárias
const result = await supabase.functions.invoke('send-email', {
  body: { announcement, condominium, baseUrl }
});
```

---

## Checklist

- [x] Ativar 2FA na conta Zoho
- [x] Gerar App Password em Zoho Account > Security > App Passwords
- [x] Adicionar secret `ZOHO_SMTP_USER`
- [x] Adicionar secret `ZOHO_SMTP_PASSWORD`
- [x] Adicionar secret `ZOHO_SMTP_HOST`
- [x] Reescrever edge functions para usar SMTP nativo
- [x] Testar conexão SMTP ✅ Funcionando!
