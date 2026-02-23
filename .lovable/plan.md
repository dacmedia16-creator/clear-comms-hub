

## Corrigir importacao de membros para lista selecionada

O problema e que a funcao de importacao em lote (`create-members-batch`) nao recebe nem utiliza o `list_id` ao inserir os registros na tabela `user_roles`. Por isso, todos os membros importados ficam sem lista (aparecem no "geral" em vez da lista selecionada).

### Alteracoes

**1. `src/hooks/useCondoMembers.ts` - funcao `importMembers`**
- Passar o `listId` atual (recebido pelo hook via parametro) no body da chamada para a edge function `create-members-batch`

**2. `supabase/functions/create-members-batch/index.ts`**
- Aceitar o campo opcional `listId` no `BatchRequest`
- Ao inserir os registros em `user_roles`, incluir `list_id: listId || null` em cada registro

### Detalhes tecnicos

No hook `useCondoMembers`, o segundo parametro ja e o `listId` da lista selecionada. A funcao `importMembers` precisa apenas adicionar esse valor ao body enviado para a edge function.

Na edge function, a unica mudanca e:
- Adicionar `listId?: string` na interface `BatchRequest`
- Adicionar `list_id: body.listId || null` no objeto de cada `user_roles` inserido

### Arquivos modificados

- `src/hooks/useCondoMembers.ts` (passar listId no body)
- `supabase/functions/create-members-batch/index.ts` (aceitar e usar listId)
