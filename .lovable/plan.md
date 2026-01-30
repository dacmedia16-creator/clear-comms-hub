

# Reverter URLs do Zoho para Domínio Global

## Problema Identificado

A screenshot confirma que o painel Zoho Mail está em `mailadmin.zoho.com` (domínio global), não `zoho.com.br`. A alteração anterior para `.com.br` causou erro de DNS porque esse endpoint não existe ou não é válido para sua conta.

## Alterações Necessárias

### Arquivo: `supabase/functions/send-email/index.ts`

**Alteração 1 - Função renewZohoAccessToken**
Reverter a URL de renovação de token:
- De: `https://accounts.zoho.com.br/oauth/v2/token`
- Para: `https://accounts.zoho.com/oauth/v2/token`

**Alteração 2 - Função sendZohoEmail**
Reverter a URL da API de email:
- De: `https://mail.zoho.com.br/api/accounts/...`
- Para: `https://mail.zoho.com/api/accounts/...`

## Resultado Esperado

Após reverter para o domínio global `.com`, a Edge Function poderá:
1. Resolver corretamente o DNS dos servidores Zoho
2. Renovar o access_token via OAuth
3. Enviar emails pela API do Zoho Mail

## Seção Técnica

### Diagnóstico do Erro

O erro nos logs era:
```
dns error: failed to lookup address information: Name or service not known
```

Isso ocorreu porque `accounts.zoho.com.br` não é um endpoint válido. A interface pode mostrar `.com.br` para usuários brasileiros, mas a API usa o domínio global `.com`.

### Código a ser Revertido

**Função `renewZohoAccessToken`:**
```typescript
const tokenUrl = `https://accounts.zoho.com/oauth/v2/token?` +
  `refresh_token=${ZOHO_REFRESH_TOKEN}&` +
  `grant_type=refresh_token&` +
  `client_id=${ZOHO_CLIENT_ID}&` +
  `client_secret=${ZOHO_CLIENT_SECRET}`;
```

**Função `sendZohoEmail`:**
```typescript
const response = await fetch(
  `https://mail.zoho.com/api/accounts/${ZOHO_ACCOUNT_ID}/messages`,
  ...
);
```

