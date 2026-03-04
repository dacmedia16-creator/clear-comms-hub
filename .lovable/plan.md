

## Adicionar Pause/Resume nos envios de WhatsApp

### Problema
Atualmente nao existe forma de pausar um disparo de WhatsApp em andamento. Uma vez iniciado, o processo roda ate o fim sem controle do usuario.

### Arquitetura da solucao
A Edge Function `send-whatsapp` usa self-invocation em lotes de 10. Para implementar pause/resume, precisamos de um flag no banco que a Edge Function consulta antes de cada lote. Quando pausado, ela para de se auto-invocar. Quando despausado, o frontend dispara a retomada.

### Alteracoes

#### 1. Migracoes de banco de dados

Criar tabela `whatsapp_broadcasts` para rastrear o estado de cada disparo:

```sql
CREATE TABLE public.whatsapp_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES public.announcements(id),
  condominium_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing', -- processing, paused, completed
  total_members INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.whatsapp_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view broadcasts"
  ON public.whatsapp_broadcasts FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can update broadcasts"
  ON public.whatsapp_broadcasts FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Service role can insert broadcasts"
  ON public.whatsapp_broadcasts FOR INSERT
  TO authenticated WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_broadcasts;
```

#### 2. `supabase/functions/send-whatsapp/index.ts`

- No inicio do processamento (primeira invocacao), criar um registro em `whatsapp_broadcasts` com `status = 'processing'` e `total_members = members.length`
- Retornar o `broadcast_id` na resposta inicial ao frontend
- Na funcao `processBatch`, antes de processar cada lote e antes de cada self-invoke:
  - Consultar `whatsapp_broadcasts` pelo `announcement_id`
  - Se `status === 'paused'`, nao processar o lote e nao fazer self-invoke (encerrar silenciosamente)
- Passar o `broadcast_id` no payload de self-invocacao
- Ao terminar todos os lotes, atualizar `status = 'completed'`

#### 3. `src/components/WhatsAppMonitor.tsx`

- Receber prop opcional `broadcastId`
- Adicionar estado `isPaused` sincronizado com `whatsapp_broadcasts.status`
- Usar Realtime subscription na tabela `whatsapp_broadcasts` para atualizar o estado em tempo real
- Adicionar botao Pause/Play ao lado do texto "Enviando..." / "Pausado":
  - Pause: faz `UPDATE whatsapp_broadcasts SET status = 'paused'` e mostra icone Play
  - Play: faz `UPDATE whatsapp_broadcasts SET status = 'processing'` e re-invoca a Edge Function `send-whatsapp` com os mesmos parametros do announcement para retomar (a funcao vai buscar membros novamente, desduplicando os ja enviados)
- Quando pausado, exibir "Pausado" no texto de status e badge amarelo

#### 4. `src/hooks/useSendWhatsApp.ts`

- Extrair `broadcast_id` da resposta da Edge Function e expor via `lastBroadcastId`
- Passar para o `WhatsAppMonitor` ao abri-lo

#### 5. `src/pages/AdminCondominiumPage.tsx`

- Passar `broadcastId` ao `WhatsAppMonitor`

### Fluxo

1. Usuario dispara envio -> Edge Function cria registro em `whatsapp_broadcasts` com `status = 'processing'`
2. Monitor exibe botao de Pause
3. Usuario clica Pause -> frontend atualiza `status = 'paused'`
4. Edge Function, ao tentar processar proximo lote, ve `status = 'paused'` e para
5. Usuario clica Play -> frontend atualiza `status = 'processing'` e re-invoca a Edge Function
6. Edge Function busca membros novamente, deduplica pelos ja enviados, e continua de onde parou

### Detalhes tecnicos

- A deduplicacao ja existente (linhas 186-198 do send-whatsapp) garante que ao retomar, membros ja enviados sao ignorados automaticamente
- Nenhum dado de payload precisa ser persistido; a retomada refaz o fetch de membros com deduplicacao
- O intervalo entre lotes (15-30s) da tempo suficiente para a verificacao de pausa

