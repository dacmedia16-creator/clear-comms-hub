

## Pedido

Pausar/cancelar o envio em andamento do template `remax_corretor` (broadcast `a018f308-3391-409a-ad8a-4935b32d5eb0`, 28 membros, ~8 já enviados pelos logs).

## Como funciona o pause hoje

A `send-whatsapp` checa `whatsapp_broadcasts.status = 'paused'`:
- Antes de cada batch
- Antes de cada mensagem dentro do batch
- Antes de auto-invocar o próximo batch

Basta atualizar o status do broadcast atual para `paused` no DB → a função para sozinha no próximo check (em até ~30s, antes da próxima mensagem).

## Ação

UPDATE no broadcast em execução:

```sql
UPDATE public.whatsapp_broadcasts 
SET status = 'paused', updated_at = now() 
WHERE id = 'a018f308-3391-409a-ad8a-4935b32d5eb0' 
  AND status = 'processing';
```

## Resultado

- Em até ~30s a função para de enviar
- Mensagens já enviadas ficam em `whatsapp_logs` com `status='sent'` (não dá para "des-enviar" no WhatsApp)
- Se quiser retomar depois: o `WhatsAppMonitor` permite resume usando `existingBroadcastId` (a dedup por `whatsapp_logs.sent` evita reenvio para quem já recebeu)
- Se quiser cancelar definitivo: deixar como `paused` e ignorar; nenhum dado novo será criado

## Confirmação rápida

Quer **pausar este broadcast específico** (id acima)? Se sim, aprovo e executo o UPDATE. Se for outro broadcast ativo, me diga qual.

