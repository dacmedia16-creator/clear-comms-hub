-- 1. Create condo_members table for manually added residents (without auth account)
CREATE TABLE public.condo_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.condo_members ENABLE ROW LEVEL SECURITY;

-- 2. Add member_id column to user_roles (nullable, references condo_members)
ALTER TABLE public.user_roles
ADD COLUMN member_id UUID REFERENCES public.condo_members(id) ON DELETE CASCADE;

-- 3. Make user_id nullable (since we can now have member_id instead)
ALTER TABLE public.user_roles
ALTER COLUMN user_id DROP NOT NULL;

-- 4. Add check constraint: must have EITHER user_id OR member_id, not both
ALTER TABLE public.user_roles
ADD CONSTRAINT user_or_member_required
CHECK (
  (user_id IS NOT NULL AND member_id IS NULL) OR
  (user_id IS NULL AND member_id IS NOT NULL)
);

-- 5. RLS Policies for condo_members

-- Managers can view condo members from their condominiums
CREATE POLICY "Managers can view condo members"
ON public.condo_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.member_id = condo_members.id
    AND can_manage_condominium(ur.condominium_id)
  )
);

-- Super admins can view all condo members
CREATE POLICY "Super admins can view all condo members"
ON public.condo_members FOR SELECT
TO authenticated
USING (is_super_admin());

-- Managers can insert condo members (via edge function with service role, but policy needed for completeness)
CREATE POLICY "Managers can insert condo members"
ON public.condo_members FOR INSERT
TO authenticated
WITH CHECK (is_super_admin());

-- Managers can update condo members they manage
CREATE POLICY "Managers can update condo members"
ON public.condo_members FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.member_id = condo_members.id
    AND can_manage_condominium(ur.condominium_id)
  )
  OR is_super_admin()
);

-- Managers can delete condo members they manage
CREATE POLICY "Managers can delete condo members"
ON public.condo_members FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.member_id = condo_members.id
    AND can_manage_condominium(ur.condominium_id)
  )
  OR is_super_admin()
);

-- 6. Update trigger for updated_at
CREATE TRIGGER update_condo_members_updated_at
BEFORE UPDATE ON public.condo_members
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 7. Update user_roles policy: managers can now update roles they manage (for approval)
CREATE POLICY "Managers can update user roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (can_manage_condominium(condominium_id))
WITH CHECK (can_manage_condominium(condominium_id));