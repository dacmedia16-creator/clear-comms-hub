

## Atualizar ZIONTALK_API_KEY e Testar Envio

### Passo 1: Atualizar o secret ZIONTALK_API_KEY
- Substituir o valor atual do secret `ZIONTALK_API_KEY` pelo novo valor: `7d601848-6cb4-4a58-805d-2ba3c5a10140`

### Passo 2: Re-deploy das Edge Functions
- Fazer deploy das funções `test-whatsapp` e `send-whatsapp` para que capturem o novo valor do secret

### Passo 3: Testar envio
- Chamar a edge function `test-whatsapp` via GET para confirmar que a API key está configurada
- Chamar a edge function `test-whatsapp` via POST com um numero de teste para validar o envio real
- Verificar nos logs se o envio foi bem-sucedido (status 201) ou se houve erro

### Detalhes Tecnicoss
- O secret sera atualizado usando a ferramenta de gerenciamento de secrets do projeto
- As edge functions usam `Deno.env.get('ZIONTALK_API_KEY')` como fallback quando nao ha sender ativo na tabela `whatsapp_senders`
- A autenticacao com a Zion Talk usa Basic Auth: `Base64(apiKey + ":")`

