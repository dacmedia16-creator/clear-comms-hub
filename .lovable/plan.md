

## Painel de Monitoramento de Envios WhatsApp em Tempo Real

### O que sera feito
Criar um painel que mostra em tempo real o progresso dos envios de WhatsApp (enviados, falhados, pendentes) com atualizacao automatica.

### Como vai funcionar
1. Apos clicar em "Enviar WhatsApp", um painel aparece mostrando o progresso
2. Contadores ao vivo: Enviados / Falhados / Total
3. Lista de destinatarios com status individual
4. Atualizacao automatica a cada mensagem processada (15-30s)
5. Botao "Ver envios" em cada aviso para abrir o historico

### Detalhes Tecnicos

**1. Migracao SQL**
Habilitar Realtime na tabela `whatsapp_logs` para receber atualizacoes em tempo real:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_logs;
```

**2. Novo componente `src/components/WhatsAppMonitor.tsx`**
- Recebe `announcementId`, `totalExpected` e `onClose` como props
- Busca logs existentes do announcement via query inicial
- Escuta novos INSERTs via Supabase Realtime filtrado por `announcement_id`
- Exibe barra de progresso, contadores com badges coloridos e tabela de destinatarios

**3. Alteracao em `src/components/SendWhatsAppButton.tsx`**
- Adicionar prop `onSendStarted(announcementId, totalExpected)` 
- Chamar o callback apos o envio iniciar com sucesso

**4. Alteracao em `src/pages/AdminCondominiumPage.tsx`**
- Estado `monitorAnnouncementId` e `monitorTotal` para controlar o painel
- Renderizar `WhatsAppMonitor` quando ativo
- Botao "Ver envios" em cada card de aviso
- Abrir monitor automaticamente apos disparo

