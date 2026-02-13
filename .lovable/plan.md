

# Adicionar log detalhado da resposta da Zion Talk

## Problema

A API retorna status 201 mas as mensagens nao chegam. O codigo atual so captura o corpo da resposta quando o status NAO e 201. Precisamos ver o que a Zion Talk responde em TODOS os casos para diagnosticar se ha erro silencioso (template pausado, conta bloqueada, parametros invalidos).

## Alteracoes

### 1. `supabase/functions/test-whatsapp/index.ts`

Capturar e logar o corpo da resposta da Zion Talk independentemente do status:

```typescript
const responseBody = await response.text();
console.log(`Zion Talk response: status=${response.status} body=${responseBody}`);

const success = response.status === 201;
let errorMessage: string | undefined;

if (!success) {
  errorMessage = responseBody;
  console.error(`Failed: ${response.status} - ${responseBody}`);
}
```

### 2. `supabase/functions/send-whatsapp/index.ts`

Mesmo ajuste na funcao `sendMessagesInBackground`:

```typescript
const responseBody = await response.text();
console.log(`[Background] Zion Talk response for ${member.phone}: status=${response.status} body=${responseBody}`);

const success = response.status === 201;
let errorMessage: string | undefined;

if (!success) {
  errorMessage = responseBody;
}
```

## Resultado

Apos o deploy, ao enviar um novo teste, os logs mostrarao exatamente o que a Zion Talk retorna, permitindo identificar se o template esta pausado, se ha erro de parametro, ou se o problema e na entrega pela Meta.

