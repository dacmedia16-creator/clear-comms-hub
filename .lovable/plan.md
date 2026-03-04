

## Corrigir limite de 1000 membros na listagem principal

### Problema
A query em `useCondoMembers.ts` (linha 78) não usa paginação, então o Supabase retorna no maximo 1000 registros. Por isso a organização "Visita Prova" mostra 0 ou menos membros do que realmente existem.

### Solucao

#### `src/hooks/useCondoMembers.ts`
Substituir a query unica por um loop com `.range()` em lotes de 1000, igual ao padrao ja usado no `MemberListSearchSelect`:

```typescript
const fetchMembers = async () => {
  // ... validacoes iniciais ...

  const allData: any[] = [];
  let offset = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from("user_roles")
      .select(`id, user_id, member_id, role, block, unit, is_approved, created_at, list_id,
        profiles:user_id (...), condo_members:member_id (...)`)
      .eq("condominium_id", condoId);

    if (listId) query = query.eq("list_id", listId);

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + batchSize - 1);

    if (error) throw error;
    allData.push(...(data || []));
    hasMore = (data?.length || 0) === batchSize;
    offset += batchSize;
  }

  // map allData to CondoMember[]...
};
```

Nenhuma outra alteracao necessaria — a paginacao do lado do cliente (20 por pagina) e a busca continuam funcionando normalmente sobre o array completo.

