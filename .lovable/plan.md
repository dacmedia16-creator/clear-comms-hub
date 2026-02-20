
## Objetivo

Remover a lógica de seleção de template baseada no nome do sender "Visita Prova" e fazer esse número usar o template padrão `aviso_pro_confirma_3`, igual a todos os outros senders.

## Problema atual

Na Edge Function `send-whatsapp`, existe esta lógica:

```typescript
const templateIdentifier = senderInfo.senderName.toLowerCase().includes('visita')
  ? 'visita_prova_envio'
  : TEMPLATE_IDENTIFIER;
```

Isso faz o sender "Visita Prova (15) 99845-9830" usar o template `visita_prova_envio` automaticamente. O usuário quer que ele volte a usar o template padrão `aviso_pro_confirma_3`.

A mesma lógica existe no `test-whatsapp` para disparos de teste.

## Solução

Remover a detecção por nome e fazer todos os senders usarem `TEMPLATE_IDENTIFIER` (`aviso_pro_confirma_3`) por padrão.

### Arquivo: `supabase/functions/send-whatsapp/index.ts`

Substituir:
```typescript
const templateIdentifier = senderInfo.senderName.toLowerCase().includes('visita')
  ? 'visita_prova_envio'
  : TEMPLATE_IDENTIFIER;
```

Por:
```typescript
const templateIdentifier = TEMPLATE_IDENTIFIER;
```

### Arquivo: `supabase/functions/test-whatsapp/index.ts`

Remover também qualquer lógica similar de detecção de "visita" para uso do `VISITA_TEMPLATE_IDENTIFIER`.

## Arquivos modificados

- `supabase/functions/send-whatsapp/index.ts` — remover inferência de template por nome do sender
- `supabase/functions/test-whatsapp/index.ts` — remover inferência de template por nome do sender (se existir)

Após o deploy, o número Visita Prova voltará a usar o template `aviso_pro_confirma_3` em todos os disparos, reais e de teste.
