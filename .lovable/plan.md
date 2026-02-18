
## Corrigir Monitor de WhatsApp que Nao Atualiza

### Problema Identificado
O envio foi realizado com sucesso (confirmado nos logs do servidor e no banco de dados), mas o monitor no frontend mostra "0 enviados" porque:

1. **Sem polling**: O fetch inicial roda uma unica vez. Se o INSERT no banco ainda nao aconteceu naquele momento (o envio e assincrono em background), o monitor nunca mais busca os dados.
2. **Realtime pode falhar silenciosamente**: A subscription Realtime com RLS pode nao entregar o evento INSERT para o cliente autenticado dependendo do timing de estabelecimento do canal.

### Solucao
Adicionar um **polling periodico** como fallback alem do Realtime, garantindo que os dados aparecem mesmo se o Realtime falhar.

### Detalhes Tecnicos

**Arquivo: `src/components/WhatsAppMonitor.tsx`**

1. Adicionar um `setInterval` de **5 segundos** que refaz a query ao banco buscando os logs do announcement
2. Manter a subscription Realtime como mecanismo primario (entrega instantanea quando funciona)
3. O polling serve como fallback - se o Realtime entregou o dado, o polling simplesmente confirma o mesmo estado
4. Parar o polling automaticamente quando `processed >= totalExpected` (envio concluido)
5. Limpar o interval no cleanup do useEffect

Logica resumida:
```
useEffect -> setInterval(5000) -> fetchLogs()
  - Se processed >= totalExpected: clearInterval
  - Cleanup: clearInterval
```

Isso resolve o problema sem depender exclusivamente do Realtime, que pode falhar em cenarios de race condition ou problemas de RLS no canal.
