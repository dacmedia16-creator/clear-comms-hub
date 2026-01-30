

# Corrigir Erro invalid_client na Integracao Zoho Mail

## Diagnostico

O erro `invalid_client` ocorre quando o Zoho nao reconhece as credenciais Client ID e Client Secret. Os logs mostram:

```
[Zoho] No access_token in response: { error: "invalid_client" }
```

Isso significa que os valores salvos nos segredos do backend nao correspondem exatamente aos valores do Zoho API Console.

## Causa Provavel

Quando os segredos foram atualizados, pode ter ocorrido:
1. Espaco em branco extra no inicio ou fim dos valores
2. Caracter invisivel copiado junto com o texto
3. Valores truncados ou incompletos

## Plano de Correcao

### Passo 1: Verificar Dominio Zoho

Confirmar qual dominio Zoho o usuario utiliza:
- Se `zoho.com.br` ou `zoho.eu`, a Edge Function precisa ser atualizada para usar as URLs corretas

### Passo 2: Atualizar Edge Function (se necessario)

Se o dominio nao for `.com`, modificar as URLs na Edge Function:
- Token URL: `accounts.zoho.{dominio}/oauth/v2/token`
- Mail API: `mail.zoho.{dominio}/api/accounts/...`

### Passo 3: Re-inserir Credenciais

Solicitar ao usuario que insira novamente as credenciais, copiando diretamente do Zoho API Console:
- ZOHO_CLIENT_ID
- ZOHO_CLIENT_SECRET
- ZOHO_REFRESH_TOKEN

### Passo 4: Testar Novamente

Executar um teste de envio de email para validar a integracao.

## Secao Tecnica

### Dominios Zoho por Regiao

| Regiao | Dominio OAuth | Dominio Mail API |
|--------|---------------|------------------|
| EUA/Global | accounts.zoho.com | mail.zoho.com |
| Europa | accounts.zoho.eu | mail.zoho.eu |
| Brasil | accounts.zoho.com.br | mail.zoho.com.br |
| India | accounts.zoho.in | mail.zoho.in |

### Modificacao na Edge Function

Se o usuario usar dominio brasileiro, a funcao `renewZohoAccessToken` deve usar:

```typescript
const tokenUrl = `https://accounts.zoho.com.br/oauth/v2/token?...`
```

E a funcao `sendZohoEmail` deve usar:

```typescript
const response = await fetch(
  `https://mail.zoho.com.br/api/accounts/${ZOHO_ACCOUNT_ID}/messages`,
  ...
)
```

### Alternativa: Variavel de Ambiente

Criar um novo segredo `ZOHO_DOMAIN` para configurar o dominio dinamicamente sem alterar o codigo.

