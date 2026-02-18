

## Adicionar Deduplicacao ao Envio de WhatsApp

### O que sera feito
Atualizar a Edge Function `send-whatsapp` para verificar os logs existentes antes de enviar, pulando automaticamente membros que ja receberam a mensagem com sucesso para o mesmo aviso.

### Como funciona
Antes de montar a lista final de destinatarios, a funcao consultara a tabela `whatsapp_logs` filtrando por `announcement_id` e `status = 'sent'`. Os telefones ja enviados com sucesso serao removidos da lista de membros, evitando duplicatas.

### Detalhes Tecnicos

**Arquivo: `supabase/functions/send-whatsapp/index.ts`**

Na funcao `fetchAndFilterMembers`, apos os filtros existentes (blocks, units, optouts), adicionar:

1. Consultar `whatsapp_logs` com `announcement_id` e `status = 'sent'`
2. Criar um Set com os `recipient_phone` ja enviados
3. Filtrar o array de membros removendo quem ja tem log de sucesso
4. Logar quantos foram pulados para auditoria

Trecho da logica:
```text
// Apos filtro de optouts
const { data: sentLogs } = await supabase
  .from('whatsapp_logs')
  .select('recipient_phone')
  .eq('announcement_id', announcement.id)
  .eq('status', 'sent');

if (sentLogs && sentLogs.length > 0) {
  const alreadySent = new Set(sentLogs.map(l => l.recipient_phone));
  members = members.filter(m => !alreadySent.has(m.phone));
  console.log(`Skipped ${alreadySent.size} already-sent phones`);
}
```

### Beneficio
- Permite reenviar um aviso com seguranca, sem duplicar mensagens
- Funciona tanto para retomar envios travados quanto para reenvios manuais
- Zero mudanca no frontend

### Apos o deploy
Basta clicar em "Enviar WhatsApp" novamente no aviso "Participante do Congresso de Ozonioterapia". A funcao vai detectar os 18 ja enviados e processar apenas os ~521 restantes.
