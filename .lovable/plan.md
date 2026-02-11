

# Desativar número do banco e testar com a nova API Key

## O que sera feito

1. **Desativar o "Numero 2"** na tabela `whatsapp_senders` (setar `is_active = false`), para que as Edge Functions ignorem esse registro e usem exclusivamente a `ZIONTALK_API_KEY` recem-atualizada como fallback.

2. **Enviar mensagem de teste** para o numero `15981788214` usando a Edge Function `test-whatsapp`, que agora usara a fonte `ENV_FALLBACK`.

## Detalhes tecnicos

- Migration SQL: `UPDATE whatsapp_senders SET is_active = false, is_default = false WHERE id = 'de9c5171-42a5-4cd9-8fbf-793a8c0be747';`
- Apos a migracao, chamar `POST /test-whatsapp` com `{ "phone": "15981788214" }` para validar.
- Nenhum codigo frontend ou edge function precisa ser alterado -- a logica de fallback ja existe.

