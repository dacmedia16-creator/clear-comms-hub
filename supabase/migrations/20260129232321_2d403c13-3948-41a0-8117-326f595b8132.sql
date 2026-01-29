-- =====================================================
-- FIX: Infinite Recursion in RLS Policies
-- =====================================================
-- Problem: is_condominium_owner() joins profiles table,
-- causing infinite recursion when used in profiles RLS policy.
-- Solution: Add auth_owner_id to condominiums for direct auth.uid() comparison.

-- 1. Add auth_owner_id column to condominiums
ALTER TABLE public.condominiums 
ADD COLUMN IF NOT EXISTS auth_owner_id UUID REFERENCES auth.users(id);

-- 2. Populate auth_owner_id from existing data
UPDATE public.condominiums c
SET auth_owner_id = p.user_id
FROM public.profiles p
WHERE c.owner_id = p.id
  AND c.auth_owner_id IS NULL;

-- 3. Update is_condominium_owner() to avoid profiles JOIN
CREATE OR REPLACE FUNCTION public.is_condominium_owner(cond_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.condominiums c
    WHERE c.id = cond_id 
      AND c.auth_owner_id = auth.uid()
  );
$$;

-- 4. Fix "Users can view own roles" policy to use auth_user_id directly
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth_user_id = auth.uid());