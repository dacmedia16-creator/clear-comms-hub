

User quer aplicar a configuração correta no template `remax_corretor`: botão 1 estático (não envia parâmetro), botão 2 dinâmico (envia token).

## Mudança

Update único no DB:

```sql
UPDATE public.whatsapp_sender_templates 
SET button_config = 'single_button_idx1', updated_at = now() 
WHERE identifier = 'remax_corretor';
```

Resultado: a função `send-whatsapp` (e o `test-whatsapp` via botão Testar do template) vai parar de enviar `buttonUrlDynamicParams[0]` e mandar só `buttonUrlDynamicParams[1]: <token>`.

### Payload final esperado para `remax_corretor`

```
mobile_phone: +55XXXXXXXXXXX
template_identifier: remax_corretor
language: pt_BR
bodyParams[nome]: <nome>
bodyParams[aviso]: <título>
bodyParams[lembrete]: <resumo>
buttonUrlDynamicParams[1]: <token-optout>
```

(sem `buttonUrlDynamicParams[0]` — botão 1 é estático)

## Ações
1. Executar UPDATE no `whatsapp_sender_templates` (via insert tool)
2. Você testa pelo botão **Testar** do template `remax_corretor` no Super Admin
3. Conferir se o WhatsApp chega corretamente

Nenhuma mudança de código — infra já suporta `single_button_idx1`.

