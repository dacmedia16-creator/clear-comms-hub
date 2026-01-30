

# Correção do Envio de SMS - Atualização para API v3

## Análise da Documentação SMSFire

Após estudar a documentação oficial (https://docs.smsfire.com.br), identifiquei que:

1. **A API v2 está obsoleta** e será desativada até o final do primeiro trimestre de 2026
2. **A API v3 é a recomendada** desde dezembro de 2025
3. A autenticação da API v3 é **diferente** da v2

---

## Diferenças entre as versões

| Aspecto | API v2 (Obsoleta/Atual) | API v3 (Recomendada) |
|---------|------------------------|---------------------|
| URL Base | `api-v2.smsfire.com.br` | `api-v3.smsfire.com.br` |
| Autenticação | `Authorization: Basic <base64>` | Headers separados |
| Credenciais | Usuário + Senha do portal | Usuário + TOKEN (gerado no painel) |
| Endpoint SMS | `/sms/send/individual` | `/sms/send/individual` |
| Método | GET com query params | GET com query params |

---

## Formato de Autenticação da API v3

A API v3 usa **headers separados** (não Basic Auth):

```text
Headers:
  Username: seu_usuario
  Api_Token: seu_token
```

O **Api_Token** não é a senha do portal! É um token específico que deve ser obtido em:
**Configurações da conta > Tokens** no portal beta.smsfire.com.br

---

## Exemplo de Requisição (Documentação Oficial)

```javascript
var options = {
  method: 'GET',
  url: 'https://api-v3.smsfire.com.br/sms/send/individual',
  params: {
    to: '5511944556677',
    text: 'hello'
  },
  headers: {
    Username: 'seu_usuario', 
    Api_Token: 'seu_token'
  }
};
```

---

## Correções Necessárias

### 1. Atualizar `supabase/functions/test-sms/index.ts`

Mudar de API v2 (Basic Auth) para API v3 (Headers separados):

```typescript
// ANTES (v2 - obsoleto)
const token = btoa(`${SMSFIRE_USERNAME}:${SMSFIRE_API_TOKEN}`);
const url = new URL('https://api-v2.smsfire.com.br/sms/send/individual');
const response = await fetch(url.toString(), {
  method: 'GET',
  headers: { 'Authorization': `Basic ${token}` },
});

// DEPOIS (v3 - recomendado)
const url = new URL('https://api-v3.smsfire.com.br/sms/send/individual');
url.searchParams.set('to', formattedPhone);
url.searchParams.set('text', TEST_MESSAGE);

const response = await fetch(url.toString(), {
  method: 'GET',
  headers: {
    'Username': SMSFIRE_USERNAME,
    'Api_Token': SMSFIRE_API_TOKEN,
  },
});
```

### 2. Atualizar `supabase/functions/send-sms/index.ts`

Mesma correção - trocar para API v3 com headers separados.

---

## Secrets - Ação Importante

O secret `SMSFIRE_API_TOKEN` precisa conter o **TOKEN da API v3**, não a senha do portal:

| Secret | Valor Atual | Valor Correto |
|--------|-------------|---------------|
| `SMSFIRE_USERNAME` | Usuário do portal | Usuário do portal |
| `SMSFIRE_API_TOKEN` | `5er3asyg` (senha?) | **Token gerado** no painel v3 |

Para obter o token correto:
1. Acesse https://beta.smsfire.com.br
2. Vá em **Configurações** (menu lateral)
3. Localize a seção **Tokens** ou **API Token**
4. Copie o token gerado

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/test-sms/index.ts` | Atualizar para API v3 com headers Username/Api_Token |
| `supabase/functions/send-sms/index.ts` | Atualizar para API v3 com headers Username/Api_Token |

---

## Resumo

A implementação atual está usando API v2 (obsoleta) com Basic Auth. Preciso:

1. Atualizar as edge functions para usar API v3
2. Trocar autenticação Basic Auth para headers `Username` e `Api_Token`
3. Você precisa obter o **Token API v3** no portal beta.smsfire.com.br e atualizar o secret `SMSFIRE_API_TOKEN`

