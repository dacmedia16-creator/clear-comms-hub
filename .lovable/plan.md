

## Fix: Members showing as 0 for large organizations

### Root Cause

The query joins `user_roles` with `condo_members`, and the RLS policy on `condo_members` runs `can_manage_condominium()` for **every row** in the join. With 4616 members, this creates ~4616 individual RLS checks, likely causing a **PostgREST timeout**. The error is caught silently, leaving `members` as an empty array.

### Solution

**Two-pronged approach:**

#### 1. Optimize the `condo_members` SELECT RLS policy

Replace the current expensive subquery-based policy with a more efficient `SECURITY DEFINER` function that avoids repeated `can_manage_condominium` calls:

```sql
-- Create a helper function
CREATE OR REPLACE FUNCTION public.can_view_condo_member(_member_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.member_id = _member_id
      AND (
        is_condominium_owner(ur.condominium_id)
        OR has_condominium_role(ur.condominium_id, 'admin')
        OR has_condominium_role(ur.condominium_id, 'syndic')
        OR is_super_admin()
      )
  )
$$;
```

Actually, the real fix is simpler: **avoid the join entirely** for the main listing query. Instead of letting PostgREST join through the foreign key (which triggers RLS on `condo_members` for every row), fetch `user_roles` first, then batch-fetch `condo_members` separately using the IDs.

#### 2. Split the query in `useCondoMembers.ts`

Instead of one query with embedded joins:

```typescript
// Step 1: Fetch user_roles (only user_roles RLS applies)
const roles = await supabase
  .from("user_roles")
  .select("id, user_id, member_id, role, block, unit, is_approved, created_at, list_id")
  .eq("condominium_id", condoId)
  .range(offset, offset + batchSize - 1);

// Step 2: Batch-fetch condo_members by IDs (single RLS check)
const memberIds = roles.filter(r => r.member_id).map(r => r.member_id);
const { data: condoMembers } = await supabase
  .from("condo_members")
  .select("id, full_name, email, phone, phone_secondary")
  .in("id", memberIds);

// Step 3: Batch-fetch profiles by IDs
const userIds = roles.filter(r => r.user_id).map(r => r.user_id);
const { data: profiles } = await supabase
  .from("profiles")
  .select("id, full_name, email, phone")
  .in("id", userIds);

// Step 4: Merge in memory
```

This avoids the N+1 RLS problem because:
- `user_roles` SELECT only checks `can_manage_condominium` once per row (already working)
- `condo_members` `.in("id", memberIds)` triggers RLS but with a single batch check
- `profiles` similarly uses a batch check

#### 3. Show error state in UI

Add visible error feedback in `CondoMembersPage.tsx` so timeout errors aren't silently swallowed — show a retry button when `error` is set.

### Files to change
- `src/hooks/useCondoMembers.ts` — Split the joined query into separate batched queries + merge in memory
- `src/pages/CondoMembersPage.tsx` — Display error state with retry button

