

# Corrigir URLs do Zoho para Dominio Brasileiro

## Problema Identificado
A Edge Function `send-email` esta usando os endpoints globais do Zoho (`.com`), mas sua conta Zoho e do Brasil (`.com.br`). Isso causa o erro `invalid_client` porque o servidor Zoho brasileiro nao reconhece tokens gerados para o servidor global.

## Alteracoes Necessarias

### Arquivo: `supabase/functions/send-email/index.ts`

**Alteracao 1 - Linha 157**
Trocar a URL de renovacao de token:
- De: `https://accounts.zoho.com/oauth/v2/token`
- Para: `https://accounts.zoho.com.br/oauth/v2/token`

**Alteracao 2 - Linha 199**
Trocar a URL da API de email:
- De: `https://mail.zoho.com/api/accounts/...`
- Para: `https://mail.zoho.com.br/api/accounts/...`

## Resultado Esperado
Apos a correcao, a Edge Function usara os endpoints corretos do Zoho Brasil, permitindo a renovacao do access_token e o envio de emails com sucesso.

## Secao Tecnica

### Fluxo de Autenticacao Corrigido

```text
+-------------------+     +------------------------+     +------------------------+
|   Edge Function   | --> | accounts.zoho.com.br   | --> |  mail.zoho.com.br      |
|   send-email      |     | /oauth/v2/token        |     |  /api/accounts/...     |
+-------------------+     +------------------------+     +------------------------+
        |                           |                            |
        | refresh_token             | access_token               | send email
        | client_id                 | (valido 1h)                |
        | client_secret             |                            |
```

### Codigo Atualizado

**Funcao `renewZohoAccessToken` (linha 157):**
```typescript
const tokenUrl = `https://accounts.zoho.com.br/oauth/v2/token?` +
  `refresh_token=${ZOHO_REFRESH_TOKEN}&` +
  `grant_type=refresh_token&` +
  `client_id=${ZOHO_CLIENT_ID}&` +
  `client_secret=${ZOHO_CLIENT_SECRET}`;
```

**Funcao `sendZohoEmail` (linha 199):**
```typescript
const response = await fetch(
  `https://mail.zoho.com.br/api/accounts/${ZOHO_ACCOUNT_ID}/messages`,
  ...
);
```

