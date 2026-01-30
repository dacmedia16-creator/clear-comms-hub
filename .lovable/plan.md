

# Corrigir Refresh Token do Zoho Mail

## Problema Identificado
O valor configurado como `ZOHO_REFRESH_TOKEN` era na verdade o **Authorization Code** (que expira em 1 minuto), não o Refresh Token permanente.

O log mostra:
```
[Zoho] No access_token in response: { error: "invalid_code" }
```

## Solução

### Passo 1: Gerar Novo Authorization Code
1. Acesse o [Zoho API Console](https://api-console.zoho.com/)
2. Selecione seu Self Client
3. Em "Generate Code", use o scope: `ZohoMail.messages.CREATE,ZohoMail.accounts.READ`
4. Clique em "Create" para gerar um novo código
5. **IMPORTANTE**: O código expira em 1 minuto!

### Passo 2: Trocar Código por Refresh Token (Dentro de 1 minuto!)
Imediatamente após gerar o código, execute este POST:

```
POST https://accounts.zoho.com/oauth/v2/token
Content-Type: application/x-www-form-urlencoded

code={SEU_NOVO_CODIGO}
&grant_type=authorization_code
&client_id={SEU_CLIENT_ID}
&client_secret={SEU_CLIENT_SECRET}
&redirect_uri=https://www.zoho.com
```

A resposta será algo como:
```json
{
  "access_token": "1000.xxxx.yyyy",
  "refresh_token": "1000.abcd.efgh",
  "expires_in": 3600
}
```

### Passo 3: Atualizar o Segredo
O valor de `refresh_token` retornado acima é o que deve ser salvo como `ZOHO_REFRESH_TOKEN`.

---

## Secao Tecnica

### Por que o código expirou?
No fluxo OAuth 2.0 do Zoho Self Client:
- **Authorization Code**: Válido por 60 segundos, usado uma única vez para obter tokens
- **Access Token**: Válido por 1 hora, usado para fazer chamadas à API
- **Refresh Token**: Permanente (até ser revogado), usado para renovar access tokens

### Fluxo Correto
```text
1. Gerar Authorization Code (60s de validade)
2. POST para /oauth/v2/token com grant_type=authorization_code
3. Receber access_token + refresh_token
4. Salvar refresh_token no ZOHO_REFRESH_TOKEN
5. Edge Function usa refresh_token para renovar access_token automaticamente
```

### Comando cURL para trocar o código
```bash
curl -X POST "https://accounts.zoho.com/oauth/v2/token" \
  -d "code=SEU_CODIGO_AQUI" \
  -d "grant_type=authorization_code" \
  -d "client_id=SEU_CLIENT_ID" \
  -d "client_secret=SEU_CLIENT_SECRET" \
  -d "redirect_uri=https://www.zoho.com"
```

---

## Próximo Passo
Me envie o **refresh_token** (não o código/access_token) e atualizarei o segredo para você.

