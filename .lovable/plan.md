

# Atualizar Credenciais OAuth do Zoho Mail

## Contexto
A resposta JSON da primeira execucao do `curl` continha o refresh_token permanente. As tentativas seguintes falharam com `invalid_code` porque o Authorization Code so pode ser usado uma vez.

## Dados Extraidos da Imagem

| Credencial | Valor |
|------------|-------|
| Client ID | `1000.DLY9XL72LNIMTTTGF8TJ81X2UCB5JU` |
| Client Secret | `1de2d6b114c44c889ad23d82e8b211f7239ed11f57` |
| Refresh Token | `1000.24832c31d7ab9a7cb2806bb237c6daed.505718df37cb835ae97a8460eb6d50f0` |

## Plano de Implementacao

### Passo 1: Atualizar ZOHO_CLIENT_ID
Substituir o valor atual do segredo `ZOHO_CLIENT_ID` pelo novo Client ID.

### Passo 2: Atualizar ZOHO_CLIENT_SECRET  
Substituir o valor atual do segredo `ZOHO_CLIENT_SECRET` pelo novo Client Secret.

### Passo 3: Atualizar ZOHO_REFRESH_TOKEN
Substituir o valor atual do segredo `ZOHO_REFRESH_TOKEN` pelo refresh_token permanente obtido.

### Passo 4: Testar a Integracao
Disparar um envio de email de teste para confirmar que a Edge Function `send-email` consegue renovar o access_token automaticamente e enviar emails via Zoho Mail API.

## Resultado Esperado
Apos a atualizacao dos tres segredos, o sistema de envio de emails funcionara corretamente, pois:
- O refresh_token permanente permite renovar o access_token sempre que necessario
- As credenciais Client ID e Client Secret correspondem ao mesmo Self Client do Zoho API Console

## Secao Tecnica

A Edge Function `send-email` utiliza o fluxo OAuth 2.0 com refresh token:

```text
+-------------------+     +-------------------+     +-------------------+
|   Edge Function   | --> |    Zoho OAuth     | --> |   Zoho Mail API   |
|   send-email      |     |   /oauth/v2/token |     |   /api/accounts/  |
+-------------------+     +-------------------+     +-------------------+
        |                         |                         |
        | refresh_token           | access_token            | send email
        | client_id               | (valido 1h)             |
        | client_secret           |                         |
```

O refresh_token nao expira enquanto:
- Nao for revogado manualmente
- As credenciais do Self Client nao forem alteradas
- O usuario nao remover a autorizacao

