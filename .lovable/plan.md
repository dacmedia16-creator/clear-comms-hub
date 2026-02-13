

## Corrigir buttonParams e adicionar logs detalhados

### Problema
As mensagens são aceitas pela API Zion Talk (status 201) mas não chegam ao destinatário. O suporte confirmou que os parâmetros nomeados (`bodyParams[nome]`, `bodyParams[aviso]`, `bodyParams[lembrete]`) estão corretos. Portanto, o problema está em outro lugar.

### Causa provavel identificada
O parâmetro do botão CTA está sendo enviado como `buttonParams[1]` (segundo botão), mas provavelmente deveria ser `buttonParams[0]` (primeiro botão, índice zero). Se o template só tem um botão CTA, enviar no índice errado pode causar falha silenciosa na Meta.

### Correções

**Arquivo 1: `supabase/functions/test-whatsapp/index.ts`**
- Trocar `buttonParams[1]` por `buttonParams[0]`
- Adicionar log detalhado dos response headers da Zion Talk para diagnóstico

**Arquivo 2: `supabase/functions/send-whatsapp/index.ts`**
- Trocar `buttonParams[1]` por `buttonParams[0]`
- Adicionar log detalhado dos response headers para diagnóstico

### O que NAO muda
- `bodyParams[nome]`, `bodyParams[aviso]`, `bodyParams[lembrete]` permanecem com nomes (confirmado pelo suporte)

### Apos a correcao
- Re-deploy automatico das duas edge functions
- Teste de envio para o numero 15981767268 para validar se as mensagens chegam
- Se ainda nao chegar, os logs detalhados nos ajudarao a entender o que a Zion Talk retorna
