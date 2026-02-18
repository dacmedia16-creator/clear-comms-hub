

## Corrigir Envio de WhatsApp que Trava por Timeout do EdgeRuntime

### Problema
O `EdgeRuntime.waitUntil()` tem um limite de execucao (~150s). Com delays de 15-30s entre mensagens, a funcao so consegue enviar ~18 mensagens antes de ser encerrada pela plataforma (evento `shutdown`).

### Solucao: Envio em Lotes com Auto-Invocacao

Em vez de processar todos os 539 membros em uma unica execucao background, a Edge Function processara um lote de membros (ex: 10) e depois se auto-invocara para processar o proximo lote.

### Detalhes Tecnicos

**Arquivo: `supabase/functions/send-whatsapp/index.ts`**

1. **Adicionar parametros de lote ao request body**:
   - `batchOffset` (default 0): indice de inicio no array de membros
   - `batchSize` (default 10): quantos membros processar por invocacao
   - `membersPayload`: array serializado de membros ja filtrados (passado nas invocacoes subsequentes para evitar reprocessamento)

2. **Logica de processamento por lote**:
   - Na primeira invocacao (offset=0): buscar e filtrar membros normalmente, retornar resposta imediata ao frontend
   - Processar apenas `batchSize` membros por vez (com os delays de 15-30s)
   - Apos processar o lote, verificar se ha mais membros
   - Se houver, fazer `fetch()` para si mesma com o proximo `batchOffset`

3. **Auto-invocacao segura**:
   - Usar `SUPABASE_URL` + `/functions/v1/send-whatsapp` para chamar a si mesma
   - Autenticar com `SUPABASE_SERVICE_ROLE_KEY` no header Authorization
   - Passar o array de membros restantes para evitar re-query ao banco
   - Cada invocacao leva ~3-5 minutos (10 membros x 15-30s), bem dentro do limite

4. **Manter compatibilidade com o frontend**:
   - A primeira resposta continua retornando `{ total, status: 'processing' }` imediatamente
   - O `WhatsAppMonitor` continua funcionando normalmente via polling + realtime
   - Nenhuma mudanca necessaria no frontend

### Fluxo

```text
Invocacao 1 (usuario clica enviar):
  -> Busca membros (539 encontrados)
  -> Retorna resposta ao frontend: { total: 539, status: 'processing' }
  -> waitUntil: envia membros 1-10 (~3min)
  -> Ao terminar, chama si mesma com offset=10

Invocacao 2 (auto):
  -> Recebe membros + offset=10
  -> waitUntil: envia membros 11-20 (~3min)
  -> Chama si mesma com offset=20

... repete ate offset >= total ...

Invocacao 54 (auto):
  -> Envia membros 531-539
  -> Nao ha mais membros, encerra
```

### Estimativa de tempo
- 539 membros / 10 por lote = 54 invocacoes
- Cada lote: ~3.5 min (media 22.5s x 10)
- Total: ~190 minutos (~3h10)
- Sem risco de shutdown em nenhuma invocacao

### Arquivos modificados
- `supabase/functions/send-whatsapp/index.ts` - logica de lotes e auto-invocacao

### Nenhuma mudanca no frontend
O `WhatsAppMonitor` ja usa polling a cada 5s + Realtime, entao vai mostrar o progresso normalmente conforme os logs sao inseridos no banco.
