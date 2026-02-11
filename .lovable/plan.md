

# Reenviar teste de WhatsApp para 15981788214

## O que sera feito

1. Chamar a Edge Function `test-whatsapp` via POST com o payload `{ "phone": "15981788214" }` para reenviar a mensagem de teste usando a `ZIONTALK_API_KEY` de fallback.

2. Verificar os logs da Edge Function para confirmar se o envio foi bem-sucedido ou diagnosticar o erro.

## Contexto

- O erro anterior (`upstream connect error or disconnect/reset before headers`) indica instabilidade temporaria na conexao com a API do Zion Talk, nao um problema de credenciais.
- O sistema ja esta configurado para usar `ENV_FALLBACK` apos a desativacao do "Numero 2".

## Detalhes tecnicos

- Endpoint: `POST /test-whatsapp`
- Body: `{ "phone": "15981788214" }`
- Nenhuma alteracao de codigo ou banco necessaria -- apenas reexecutar a chamada.

