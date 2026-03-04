

## Retomar envio de WhatsApp interrompido

O sistema já possui um mecanismo de retomada embutido: a Edge Function `send-whatsapp` verifica a tabela `whatsapp_logs` antes de cada envio e pula contatos que já receberam a mensagem com sucesso. O problema é que quando o envio falha por timeout (e não por pausa manual), o broadcast fica com status `processing` mas sem nenhum processo ativo, e não há botão de "Retomar" visível nesse estado.

### Problema identificado

O botão de Pause/Resume só aparece quando `broadcastId` existe e o envio não está concluído. Porém, quando o envio é interrompido por timeout da Edge Function, o status do broadcast permanece `processing` (nunca muda para `paused` ou `completed`), e o botão exibido é de "Pausar" -- não de "Retomar". O usuário precisaria pausar e depois retomar, o que não é intuitivo.

### Solução

Adicionar um botão **"Retomar envio"** que aparece quando o broadcast está em status `processing` mas não há progresso recente (stale). Isso detecta automaticamente envios travados.

**`src/components/WhatsAppMonitor.tsx`:**

1. Rastrear o timestamp do último log recebido e detectar "stalled" (sem novos logs há mais de 60 segundos enquanto `processing` e `processed < total`)
2. Quando detectado como stalled, exibir um badge "Envio travado" e um botão "Retomar envio" que re-invoca a Edge Function com `existingBroadcastId`
3. A lógica de retomada é idêntica à já existente no `handleTogglePause` (resume branch), reutilizando o mesmo código

### Detalhes técnicos

- Novo estado `isStalled`: `true` quando `broadcastStatus === 'processing'` e o último log tem mais de 60s e `processed < total`
- O botão de retomar chama a mesma lógica do resume: busca announcement + condominium, invoca `send-whatsapp` com `existingBroadcastId`
- A Edge Function já faz deduplicação via `whatsapp_logs`, então contatos já enviados são automaticamente ignorados
- Nenhuma alteração no backend necessária

