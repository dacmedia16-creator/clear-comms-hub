
## Objetivo

Restaurar o template `visita_prova_envio` para o sender "Visita Prova (15) 99845-9830", reintroduzindo a lógica de detecção por nome do sender.

## O que será feito

### Arquivo: `supabase/functions/send-whatsapp/index.ts` (linha 358)

Restaurar de:
```typescript
const templateIdentifier = TEMPLATE_IDENTIFIER;
```

Para:
```typescript
const templateIdentifier = senderInfo.senderName.toLowerCase().includes('visita')
  ? 'visita_prova_envio'
  : TEMPLATE_IDENTIFIER;
```

### Arquivo: `supabase/functions/test-whatsapp/index.ts` (linha 79)

Restaurar de:
```typescript
const templateToUse = TEMPLATE_IDENTIFIER;
```

Para:
```typescript
const templateToUse = senderName.toLowerCase().includes('visita')
  ? VISITA_TEMPLATE_IDENTIFIER
  : TEMPLATE_IDENTIFIER;
```

A constante `VISITA_TEMPLATE_IDENTIFIER = 'visita_prova_envio'` já existe no arquivo `test-whatsapp/index.ts` (linha 14), então não precisa ser redeclarada.

## Observação importante

Na conversa anterior, levantamos a hipótese de que o `visita_prova_envio` pode ter um **botão com URL fixa** configurado na Meta — o que faria o campo `buttonUrlDynamicParams` ser ignorado silenciosamente. A API Zion Talk retornaria `201` mesmo assim, mas o link do aviso no botão seria incorreto ou inexistente.

Se os testes com o template `visita_prova_envio` continuarem sem entrega visível mesmo com `201`, a causa mais provável é essa configuração de URL fixa no template da Meta Business Suite — e a solução seria editar o template na Meta para usar URLs dinâmicas, ou manter o `aviso_pro_confirma_3`.

## Arquivos modificados

- `supabase/functions/send-whatsapp/index.ts` — restaurar detecção por nome do sender
- `supabase/functions/test-whatsapp/index.ts` — restaurar detecção por nome do sender

Após o deploy, o número Visita Prova voltará a usar `visita_prova_envio` e os demais senders continuam com `aviso_pro_confirma_3`.
