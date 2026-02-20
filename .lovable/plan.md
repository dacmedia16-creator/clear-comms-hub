
## Problema identificado

O `test-whatsapp` tem o template `aviso_pro_confirma_3` **hardcoded** nas linhas 10 e 100 do arquivo `supabase/functions/test-whatsapp/index.ts`. Mesmo que o sender "Visita Prova" esteja ativo, o teste sempre envia com o template errado.

A função `send-whatsapp` (disparos reais) já foi corrigida corretamente. O problema é apenas na função de teste.

## Correção necessária

### Arquivo: `supabase/functions/test-whatsapp/index.ts`

**1. Adicionar a constante do template Visita Prova**

```typescript
const TEMPLATE_IDENTIFIER = 'aviso_pro_confirma_3';
const VISITA_TEMPLATE_IDENTIFIER = 'visita_prova_envio';
```

**2. Capturar o nome do sender ao buscar no banco**

Atualmente o código captura `apiKey` e `apiSource`, mas não captura o `name` do sender para decisão de template. Adicionar:

```typescript
let senderName = 'ENV_DEFAULT';
// ...dentro do if (senders && senders.length > 0):
senderName = sender.name;
```

**3. Determinar o template pelo nome do sender**

Logo após definir o `authHeader`, adicionar:

```typescript
const templateToUse = senderName.toLowerCase().includes('visita')
  ? VISITA_TEMPLATE_IDENTIFIER
  : TEMPLATE_IDENTIFIER;
```

**4. Usar `templateToUse` no FormData**

Substituir linha 100:
```typescript
formData.append('template_identifier', templateToUse);
```

**5. Logar o template usado**

```typescript
console.log(`Using template: ${templateToUse} (sender: ${senderName})`);
```

## Resultado esperado

Após a correção, ao clicar em "Testar WhatsApp" com o sender "Visita Prova" ativo:
- O log mostrará: `Using template: visita_prova_envio (sender: Visita Prova)`
- A mensagem enviada usará o template correto
- O teste refletirá exatamente o mesmo comportamento do disparo real

## Arquivo modificado

- `supabase/functions/test-whatsapp/index.ts` — única alteração necessária
