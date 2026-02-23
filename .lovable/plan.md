

## Remocao em massa otimizada

Atualmente a remocao em massa chama `removeMember` para cada ID individualmente, resultando em N deletes sequenciais + N refetchs. Vamos criar uma funcao `removeMembersBulk` no hook que faz tudo em 2 queries apenas.

### Alteracoes

**`src/hooks/useCondoMembers.ts`**

Nova funcao `removeMembersBulk(memberIds: string[])`:
1. Identifica quais dos IDs selecionados tem `member_id` (sao `condo_members`) usando o array `members` em memoria
2. Executa um unico DELETE em `user_roles` usando `.in('id', memberIds)` em vez de um por um
3. Se houver `condo_member` IDs associados, executa um unico DELETE em `condo_members` usando `.in('id', condoMemberIds)`
4. Faz um unico `fetchMembers()` no final
5. Retorna `{ success: true, count: number }`

Resultado: de N*2 queries para apenas 2-3 queries independente do numero de membros.

**`src/pages/CondoMembersPage.tsx`**

- Trocar a chamada no `handleBulkRemove` de loop com `removeMember` para uma unica chamada a `removeMembersBulk(Array.from(selectedMemberIds))`
- Simplificar a logica removendo o contador manual de sucesso

### Detalhes tecnicos

```text
Antes (N membros selecionados):
  N x DELETE user_roles WHERE id = ?
  N x DELETE condo_members WHERE id = ?
  N x SELECT (refetch)
  = 3N queries

Depois:
  1 x DELETE user_roles WHERE id IN (...)
  1 x DELETE condo_members WHERE id IN (...)
  1 x SELECT (refetch)
  = 3 queries total
```

### Arquivos modificados

- `src/hooks/useCondoMembers.ts` (nova funcao `removeMembersBulk`)
- `src/pages/CondoMembersPage.tsx` (usar nova funcao no `handleBulkRemove`)
