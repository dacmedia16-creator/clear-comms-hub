

## Painel de Monitoramento de Envios WhatsApp em Tempo Real

### O que sera feito
Criar um componente de monitoramento que aparece apos o disparo de WhatsApp, mostrando em tempo real o progresso dos envios (enviados, falhados, pendentes) com atualizacao automatica via Supabase Realtime.

### Como vai funcionar
1. Apos clicar em "Enviar WhatsApp", um painel aparece dentro da pagina de admin mostrando:
   - Barra de progresso com total esperado vs enviados
   - Contadores: Enviados / Falhados / Total
   - Lista dos destinatarios com status (enviado, falhado, aguardando)
   - Atualizacao automatica a cada novo log inserido no banco
2. O painel pode ser fechado a qualquer momento
3. O painel tambem pode ser aberto para ver o historico de envios de um aviso especifico

### Detalhes Tecnicos

**1. Migracao SQL - Habilitar Realtime na tabela `whatsapp_logs`**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_logs;
```

**2. Novo componente `src/components/WhatsAppMonitor.tsx`**
- Recebe `announcementId` e `condominiumId` como props
- Query inicial: busca todos os `whatsapp_logs` do announcement
- Subscription Realtime: escuta INSERTs na tabela `whatsapp_logs` filtrado por `announcement_id`
- Exibe:
  - Progress bar (enviados / total esperado)
  - Badge com contagem de `sent`, `failed`, `pending`
  - Tabela com nome, telefone, status e horario
  - Icone de status (check verde, X vermelho, relogio amarelo)

**3. Alteracao em `src/pages/AdminCondominiumPage.tsx`**
- Adicionar estado `monitorAnnouncementId` para controlar qual aviso esta sendo monitorado
- Apos envio com sucesso do WhatsApp, abrir automaticamente o monitor para aquele aviso
- Adicionar botao "Ver envios" em cada card de aviso (ao lado dos botoes existentes) que abre o monitor

**4. Alteracao em `src/components/SendWhatsAppButton.tsx`**
- Adicionar callback `onSendStarted(announcementId, totalExpected)` para notificar o componente pai quando o envio iniciou e quantos destinatarios sao esperados

### Resultado
O admin vera em tempo real cada mensagem sendo enviada (a cada 15-30s), com feedback visual claro do progresso, sem precisar recarregar a pagina.
