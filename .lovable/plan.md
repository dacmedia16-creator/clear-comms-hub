
## Problema identificado

O número `+5515981788214` possui 3 registros na tabela `whatsapp_optouts`. Um deles ainda tem `opted_out_at` preenchido com a data 18/02/2026, o que faz o sistema bloquear o número em todos os disparos.

O fluxo de filtro na Edge Function funciona assim: se qualquer registro com esse telefone tiver `opted_out_at` não nulo, o número é excluído da lista de destinatários.

## Solução

Limpar o campo `opted_out_at` no registro com opt-out ativo (id `a644df0e-fbb7-44e3-bece-53db7d4c48f8`):

```sql
UPDATE whatsapp_optouts
SET opted_out_at = NULL
WHERE phone = '+5515981788214'
  AND opted_out_at IS NOT NULL;
```

Após isso, todos os 3 registros do número terão `opted_out_at = NULL`, e o número voltará a ser elegível para receber disparos normalmente.

## Verificação após a correção

Após o update, será feito um disparo de teste via Edge Function `test-whatsapp` diretamente via chamada à API para confirmar que:
- O número não é mais bloqueado pelo filtro de opt-out
- O template `visita_prova_envio` é selecionado corretamente

## Arquivos/recursos modificados

- Tabela `whatsapp_optouts` — UPDATE (opted_out_at → NULL) para todos os registros do número `+5515981788214` com opt-out ativo
- Nenhum arquivo de código precisa ser alterado
