

## Corrigir limite de 1000 registros ao expandir listas de membros

### Problema
O Supabase/PostgREST limita queries a **1000 linhas por padrão**. Quando uma lista tem mais de 1000 membros, a query retorna apenas os primeiros 1000 silenciosamente.

### Solução

#### `src/components/MemberListSearchSelect.tsx`
Substituir a query única por uma função de fetch paginado que busca em lotes de 1000 usando `.range()`:

```typescript
const loadMembers = async () => {
  const allData = [];
  let offset = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("user_roles")
      .select("member_id, condo_members:member_id (id, full_name, phone)")
      .eq("condominium_id", condominiumId)
      .eq("list_id", expandedListId)
      .eq("is_approved", true)
      .not("member_id", "is", null)
      .range(offset, offset + batchSize - 1);

    if (error) break;
    allData.push(...(data || []));
    hasMore = (data?.length || 0) === batchSize;
    offset += batchSize;
  }

  // map to MemberOption[]...
};
```

Isso garante que **todos** os membros sejam carregados, independente da quantidade.

