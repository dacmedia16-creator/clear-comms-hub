

## Problema

Existe outro broadcast em andamento (não o que já cancelamos). O Monitor de Envios sumiu da tela e não há como reabrir → sem UI para pausar/finalizar o broadcast atual.

## Causa

O `WhatsAppMonitor` só aparece logo após disparar o envio (estado local na página de anúncios). Se o usuário fecha (X) ou recarrega, perde a referência do `broadcastId` e o painel some, mesmo com o broadcast ainda rodando no backend.

## Solução em 2 partes

### 1. Ação imediata (agora)

Identificar o broadcast ativo (`status='processing'`) e finalizá-lo via DB:

```sql
-- Listar broadcasts ativos
SELECT id, announcement_id, condominium_id, total_members, status, updated_at
FROM whatsapp_broadcasts
WHERE status IN ('processing', 'paused')
ORDER BY updated_at DESC;

-- Pausar todos os ativos (a função para em ~30s)
UPDATE whatsapp_broadcasts 
SET status = 'paused', updated_at = now()
WHERE status = 'processing';

-- Após confirmar que parou, marcar como completed
UPDATE whatsapp_broadcasts 
SET status = 'completed', updated_at = now()
WHERE status = 'paused';
```

### 2. Correção da UI (definitiva)

Adicionar uma **lista persistente de broadcasts ativos** na página do anúncio / dashboard, para que o usuário sempre consiga reabrir o Monitor mesmo após fechar ou recarregar.

**Mudanças:**

- **Novo hook `useActiveBroadcasts(condominiumId)`** em `src/hooks/`
  - Query: `whatsapp_broadcasts` com `status IN ('processing','paused')` do condomínio
  - Realtime subscription para atualizar quando status mudar
  - Retorna lista com `id`, `announcement_id`, `total_members`, `status`

- **Novo componente `ActiveBroadcastsBanner.tsx`** em `src/components/`
  - Mostra cartão fixo no topo quando há broadcasts ativos
  - Botão "Abrir Monitor" → reabre `WhatsAppMonitor` com o `broadcastId`+`announcementId` corretos
  - Botão "Finalizar" → marca como `completed` direto

- **Integração**: renderizar o banner em `CondoMembersPage` / página do anúncio, acima do conteúdo

- **Pequeno ajuste em `WhatsAppMonitor`**: aceitar ser aberto a partir de um broadcast existente (já tem `existingBroadcastId` no resume — só expor caminho de "reabrir" sem reinvocar a função)

## Resultado

- Agora: o broadcast atual é finalizado pelo SQL
- Daqui pra frente: sempre que houver envio em andamento, aparece um banner com botões "Abrir Monitor" e "Finalizar" → impossível "perder" o painel

## Plano de execução

1. Rodar SELECT para ver quantos broadcasts estão ativos e qual finalizar
2. UPDATE → `paused` → aguardar ~30s → `completed`
3. Criar `useActiveBroadcasts` + `ActiveBroadcastsBanner`
4. Integrar banner na página de anúncios/dashboard
5. Você testa: dispara um envio, fecha o monitor, confirma que o banner aparece e permite reabrir/finalizar

