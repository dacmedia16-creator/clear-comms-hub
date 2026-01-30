

# Atualizar ZOHO_REFRESH_TOKEN

## Acao
Substituir o valor atual do segredo `ZOHO_REFRESH_TOKEN` pelo novo refresh_token permanente fornecido.

## Valor
```
1000.0bbef0ad646773dc457c34b68107a019.ab4306ef6bcef59e18c0cfa02a765d36
```

## Resultado Esperado
Apos a atualizacao, a Edge Function `send-email` conseguira renovar o access_token automaticamente e enviar emails via Zoho Mail API sem erros de `invalid_code`.

## Proximo Passo
Testar o envio de email novamente para confirmar que a integracao esta funcionando corretamente.

