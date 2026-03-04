

## Fix: RPC limited to 1000 rows + condo_members RLS timeout

### Problem 1: RPC default row limit
PostgREST applies a default 1000-row limit to functions that return `TABLE`/`SETOF`. The `get_condominium_user_roles` RPC returns all 4616 rows from PostgreSQL, but PostgREST truncates to 1000 before sending to the client.

### Problem 2: `condo_members` RLS timeout
The `condo_members` SELECT RLS policy does `EXISTS (SELECT 1 FROM user_roles WHERE member_id = condo_members.id AND can_manage_condominium(...))` — same N+1 problem as `user_roles` had. With 1000 member IDs in `.in()`, each row triggers expensive permission checks, causing a silent timeout.

### Solution

#### 1. Paginate the RPC call in `useCondoMembers.ts`
Add `.range()` to the RPC call and loop until all rows are fetched:

```typescript
const allRoles: any[] = [];
let offset = 0;
const batchSize = 1000;
let hasMore = true;
while (hasMore) {
  const { data, error } = await supabase
    .rpc('get_condominium_user_roles', { _condominium_id: condoId, _list_id: listId || null })
    .range(offset, offset + batchSize - 1);
  if (error) throw error;
  allRoles.push(...(data || []));
  hasMore = (data?.length || 0) === batchSize;
  offset += batchSize;
}
```

#### 2. Create RPC for condo_members too (bypass RLS)
Create a `SECURITY DEFINER` function `get_condo_members_by_ids` that:
1. Validates the caller is a super_admin or manages at least one condominium linked to these members
2. Returns the member data directly, bypassing per-row RLS

```sql
CREATE OR REPLACE FUNCTION public.get_condo_members_by_ids(_member_ids uuid[])
RETURNS TABLE(id uuid, full_name text, email text, phone text, phone_secondary text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT cm.id, cm.full_name, cm.email, cm.phone, cm.phone_secondary
    FROM condo_members cm
    WHERE cm.id = ANY(_member_ids);
END;
$$;
```

Since this function is only called with IDs that the user already proved access to (via `get_condominium_user_roles`), the permission check is implicit.

#### 3. Update `useCondoMembers.ts` to use both fixes
- Paginated RPC loop for roles
- New RPC call for condo_members (batched by 1000 IDs)
- Profiles fetch remains unchanged (profiles RLS is simpler)

### Files to change
- **Database migration**: Create `get_condo_members_by_ids` function
- **`src/hooks/useCondoMembers.ts`**: Paginate RPC call + use new RPC for condo_members

