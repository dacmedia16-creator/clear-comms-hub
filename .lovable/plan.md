

# Correção do Envio de SMS - SMSFire API

## Problema Identificado

Os logs mostram um erro de DNS:
```
dns error: failed to lookup address information: Name or service not known
```

A causa raiz são **URLs incorretas** e **autenticação no formato errado**.

---

## Problemas no Código Atual

| Problema | Código Atual (Errado) | Correto (Documentação Oficial) |
|----------|----------------------|-------------------------------|
| URL test-sms | `api.smsfire.com.br/v3/sms/send` | `api-v2.smsfire.com.br/sms/send/individual` |
| URL send-sms | `api-v3.smsfire.com.br/sms/send/individual` | `api-v2.smsfire.com.br/sms/send/individual` |
| Autenticação | Headers `Username` e `Api_Token` separados | Header `Authorization: Basic <TOKEN>` |

A documentação oficial mostra que:
- O endpoint correto é: `https://api-v2.smsfire.com.br/sms/send/individual`
- A autenticação usa `Authorization: Basic` com token Base64 de `usuario:senha`

---

## Correções Necessárias

### 1. Atualizar `supabase/functions/test-sms/index.ts`

Mudar de:
```typescript
const response = await fetch('https://api.smsfire.com.br/v3/sms/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Username': SMSFIRE_USERNAME,
    'Api_Token': SMSFIRE_API_TOKEN,
  },
  body: JSON.stringify({
    to: formattedPhone,
    from: 'Condominio',
    text: TEST_MESSAGE,
  }),
});
```

Para:
```typescript
// Gerar token Base64 para autenticação
const token = btoa(`${SMSFIRE_USERNAME}:${SMSFIRE_API_TOKEN}`);

// URL correta com parâmetros na query string (método GET)
const url = new URL('https://api-v2.smsfire.com.br/sms/send/individual');
url.searchParams.set('to', formattedPhone);
url.searchParams.set('text', TEST_MESSAGE);

const response = await fetch(url.toString(), {
  method: 'GET',
  headers: {
    'Authorization': `Basic ${token}`,
  },
});
```

### 2. Atualizar `supabase/functions/send-sms/index.ts`

Mesma correção:
- Trocar `api-v3.smsfire.com.br` por `api-v2.smsfire.com.br`
- Usar `Authorization: Basic` com token Base64
- Manter método GET com parâmetros na query string

---

## Secrets

Os secrets atuais continuam funcionando, mas com interpretação diferente:

| Secret | Uso Atual | Uso Correto |
|--------|----------|-------------|
| `SMSFIRE_USERNAME` | Usuário de login no SMSFire | Usuário de login no SMSFire |
| `SMSFIRE_API_TOKEN` | Token separado | **Senha** do SMSFire (não token API!) |

De acordo com a documentação:
> "Os dados de usuário e senha que formam o seu token, são os mesmos que você utiliza para acessar o portal web."

Pode ser necessário atualizar `SMSFIRE_API_TOKEN` para conter a **senha** do portal SMSFire em vez de um token API.

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/test-sms/index.ts` | Corrigir URL e formato de autenticação |
| `supabase/functions/send-sms/index.ts` | Corrigir URL e formato de autenticação |

---

## Fluxo de Autenticação Correto

```text
┌─────────────────────────────────────────────────────┐
│  1. Obter credenciais do ambiente                   │
│     SMSFIRE_USERNAME = "usuario"                    │
│     SMSFIRE_API_TOKEN = "senha"                     │
├─────────────────────────────────────────────────────┤
│  2. Gerar token Base64                              │
│     token = base64("usuario:senha")                 │
│     → "dXN1YXJpbzpzZW5oYQ=="                        │
├─────────────────────────────────────────────────────┤
│  3. Fazer requisição GET com query params           │
│     GET /sms/send/individual?to=5511...&text=...    │
│     Header: Authorization: Basic dXN1YXJpbzpzZW5oYQ==│
└─────────────────────────────────────────────────────┘
```

---

## Checklist Pós-Implementação

- [ ] Verificar se `SMSFIRE_API_TOKEN` contém a **senha** do portal (não um token API separado)
- [ ] Testar conexão SMS no painel Super Admin > Notificações
- [ ] Enviar SMS de teste para confirmar funcionamento

