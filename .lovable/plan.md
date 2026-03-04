

## Fix: Statement timeout on large organizations

### Root Cause (confirmed)

The `View roles` RLS policy on `user_roles` evaluates `can_manage_condominium(condominium_id)` **for every row**. This function internally calls 4 subqueries (is_condominium_owner, has_condominium_role ×2, is_super_admin). With 4616 rows, that's ~18,000 subqueries per page load, causing a PostgreSQL statement timeout.

The split-query approach we already implemented doesn't help because the timeout happens at the database level, before results reach the client.

### Solution: SECURITY DEFINER function to bypass per-row RLS

Create a database function `get_condominium_user_roles` that:
1. Checks permission **once** (is user a manager/owner/super_admin?)
2. If authorized, returns all `user_roles` for that condominium directly (bypassing the per-row RLS check)

#### Migration SQL

```sql
CREATE OR REPLACE FUNCTION public.get_condominium_user_roles(
  _condominium_id uuid,
  _list_id uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  member_id uuid,
  role app_role,
  block text,
  unit text,
  is_approved boolean,
  created_at timestamptz,
  list_id uuid
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check permission ONCE
  IF NOT (
    can_manage_condominium(_condominium_id) 
    OR is_super_admin()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Return rows without per-row RLS
  RETURN QUERY
    SELECT ur.id, ur.user_id, ur.member_id, ur.role, 
           ur.block, ur.unit, ur.is_approved, ur.created_at, ur.list_id
    FROM user_roles ur
    WHERE ur.condominium_id = _condominium_id
      AND (_list_id IS NULL OR ur.list_id = _list_id)
    ORDER BY ur.created_at DESC;
END;
$$;
```

#### Code change: `src/hooks/useCondoMembers.ts`

Replace the paginated `user_roles` SELECT with a single RPC call:

```typescript
// Instead of: supabase.from("user_roles").select(...)
const { data, error } = await supabase.rpc('get_condominium_user_roles', {
  _condominium_id: condoId,
  _list_id: listId || null,
});
```

This checks permission once, then returns all rows in a single efficient query. The existing batch-fetch logic for `condo_members` and `profiles` remains unchanged.

### Files to change
- **Database migration**: Create `get_condominium_user_roles` function
- **`src/hooks/useCondoMembers.ts`**: Replace paginated user_roles query with RPC call

