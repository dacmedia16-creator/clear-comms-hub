-- =============================================
-- SUPER ADMIN SYSTEM
-- =============================================

-- 1. Create super_admins table
CREATE TABLE public.super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- 2. Create is_super_admin() function
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.super_admins sa
    JOIN public.profiles p ON sa.user_id = p.id
    WHERE p.user_id = auth.uid()
  );
END;
$$;

-- 3. RLS Policies for super_admins table
CREATE POLICY "Super admins can view all super admins"
ON public.super_admins FOR SELECT
USING (is_super_admin());

CREATE POLICY "Super admins can manage super admins"
ON public.super_admins FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- 4. Update profiles RLS - Super admin can view all profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view profiles"
ON public.profiles FOR SELECT
USING (user_id = auth.uid() OR is_super_admin());

-- 5. Update condominiums RLS - Super admin can CRUD all
DROP POLICY IF EXISTS "Anyone can view condominiums by slug" ON public.condominiums;
CREATE POLICY "Anyone can view condominiums"
ON public.condominiums FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create condominiums" ON public.condominiums;
CREATE POLICY "Users can create condominiums"
ON public.condominiums FOR INSERT
WITH CHECK (
  owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR is_super_admin()
);

DROP POLICY IF EXISTS "Owners can update their condominiums" ON public.condominiums;
CREATE POLICY "Owners and super admins can update condominiums"
ON public.condominiums FOR UPDATE
USING (can_manage_condominium(id) OR is_super_admin())
WITH CHECK (can_manage_condominium(id) OR is_super_admin());

DROP POLICY IF EXISTS "Owners can delete their condominiums" ON public.condominiums;
CREATE POLICY "Owners and super admins can delete condominiums"
ON public.condominiums FOR DELETE
USING (is_condominium_owner(id) OR is_super_admin());

-- 6. Update user_roles RLS - Super admin can manage all
DROP POLICY IF EXISTS "Managers can view roles for their condominiums" ON public.user_roles;
CREATE POLICY "View roles"
ON public.user_roles FOR SELECT
USING (can_manage_condominium(condominium_id) OR is_super_admin());

DROP POLICY IF EXISTS "Managers can insert roles" ON public.user_roles;
CREATE POLICY "Insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (can_manage_condominium(condominium_id) OR is_super_admin());

DROP POLICY IF EXISTS "Managers can delete roles" ON public.user_roles;
CREATE POLICY "Delete roles"
ON public.user_roles FOR DELETE
USING (can_manage_condominium(condominium_id) OR is_super_admin());

-- 7. Update announcements RLS - Super admin can manage all
DROP POLICY IF EXISTS "Managers can create announcements" ON public.announcements;
CREATE POLICY "Create announcements"
ON public.announcements FOR INSERT
WITH CHECK (
  (can_manage_condominium(condominium_id) AND created_by = (SELECT id FROM profiles WHERE user_id = auth.uid()))
  OR is_super_admin()
);

DROP POLICY IF EXISTS "Managers can update announcements" ON public.announcements;
CREATE POLICY "Update announcements"
ON public.announcements FOR UPDATE
USING (can_manage_condominium(condominium_id) OR is_super_admin())
WITH CHECK (can_manage_condominium(condominium_id) OR is_super_admin());

DROP POLICY IF EXISTS "Managers can delete announcements" ON public.announcements;
CREATE POLICY "Delete announcements"
ON public.announcements FOR DELETE
USING (can_manage_condominium(condominium_id) OR is_super_admin());