-- Super admins podem atualizar qualquer perfil
CREATE POLICY "Super admins can update any profile"
ON public.profiles
FOR UPDATE
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Super admins podem excluir perfis
CREATE POLICY "Super admins can delete profiles"
ON public.profiles
FOR DELETE
USING (is_super_admin());