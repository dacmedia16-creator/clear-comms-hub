-- Permitir que super admins atualizem user_roles
CREATE POLICY "Super admins can update user roles"
ON public.user_roles
FOR UPDATE
USING (is_super_admin())
WITH CHECK (is_super_admin());