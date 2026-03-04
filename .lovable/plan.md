

## Corrigir limite de 1000 registros no MemberSearchSelect.tsx

### Problema
A query em `fetchMembers` (linha 33-41) faz uma única chamada sem `.range()`, limitada a 1000 registros pelo Supabase.

### Solução

#### `src/components/MemberSearchSelect.tsx`
Substituir a query única por loop paginado com `.range()` em lotes de 1000:

```typescript
const allData: any[] = [];
let offset = 0;
const batchSize = 1000;
let hasMore = true;

while (hasMore) {
  const { data, error } = await supabase
    .from("user_roles")
    .select(`user_id, member_id,
      profiles:user_id (id, full_name, phone),
      condo_members:member_id (id, full_name, phone)`)
    .eq("condominium_id", condominiumId)
    .eq("is_approved", true)
    .range(offset, offset + batchSize - 1);

  if (error) { console.error(...); break; }
  allData.push(...(data || []));
  hasMore = (data?.length || 0) === batchSize;
  offset += batchSize;
}

// map allData to MemberOption[]...
```

Mesmo padrão já usado em `useCondoMembers.ts` e `MemberListSearchSelect.tsx`.

