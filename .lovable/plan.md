

User está vendo o sender REMAX (`remax_corretor`) na lista e quer confirmar a configuração: botão 1 estático (sem param), botão 2 dinâmico (com param do token).

Na imagem, o badge mostra `two_buttons` — config errada para esse template. Precisa virar `single_button_idx1`.

Já fiz esse update antes em `whatsapp_sender_templates` (registro do template). Mas a UI mostra `two_buttons` porque o badge está lendo de `whatsapp_senders.button_config` (coluna do sender), não do template.

Vou checar via DB pra confirmar antes de propor.

## Diagnóstico

A imagem é da linha do **sender** REMAX no card "Números de WhatsApp". O badge `two_buttons` vem de `whatsapp_senders.button_config`. Para alinhar:

1. Atualizar `whatsapp_senders` da REMAX → `button_config = 'single_button_idx1'`
2. Garantir que o template `remax_corretor` em `whatsapp_sender_templates` também esteja `single_button_idx1` (já feito antes, vou reconfirmar)

## Mudança proposta

```sql
-- Sender REMAX
UPDATE public.whatsapp_senders 
SET button_config = 'single_button_idx1', updated_at = now() 
WHERE name ILIKE '%remax%';

-- Garantir template (idempotente)
UPDATE public.whatsapp_sender_templates 
SET button_config = 'single_button_idx1', updated_at = now() 
WHERE identifier = 'remax_corretor';
```

### Resultado esperado

Payload enviado pela `send-whatsapp` e `test-whatsapp` para REMAX:

```
template_identifier: remax_corretor
bodyParams[nome]: <nome>
bodyParams[aviso]: <título>
bodyParams[lembrete]: <resumo>
buttonUrlDynamicParams[1]: <token-optout>
```

Sem `buttonUrlDynamicParams[0]` (botão 1 estático). Badge na UI vai passar a mostrar `single_button_idx1`.

## Ações
1. Rodar os 2 UPDATEs
2. Você recarrega a página → badge muda para `single_button_idx1`
3. Testar pelo botão Testar do sender e do template

Sem alteração de código.

