

## Problema

O `MemberSearchSelect` busca membros diretamente da tabela `user_roles` com `.range()`, mas a query passa pelo RLS per-row (que chama `can_manage_condominium` para cada linha). Com 4616 membros, as primeiras 3 batches de 1000 funcionam, mas a 4ª batch provavelmente dá timeout no RLS -- resultando em apenas 3000.

Mesmo problema que já corrigimos no `useCondoMembers`: precisa usar os RPCs `get_condominium_user_roles` e `get_condo_members_by_ids` que fazem a verificação de permissão uma única vez.

## Correção

### `src/components/MemberSearchSelect.tsx`

Refatorar o `fetchMembers` para:

1. Buscar roles via RPC `get_condominium_user_roles` com `_limit`/`_offset` (loop paginado)
2. Extrair `member_id`s e `user_id`s dos resultados
3. Buscar dados de `condo_members` via RPC `get_condo_members_by_ids` (em lotes de 1000)
4. Buscar dados de `profiles` via `.from("profiles").select().in("id", batch)` (em lotes de 1000)
5. Fazer merge em memória para montar `MemberOption[]`

Mesma arquitetura que já funciona no `useCondoMembers.ts`, adaptada para este componente.

### Arquivos a alterar
- `src/components/MemberSearchSelect.tsx` -- Trocar query direta por RPCs paginados

