-- Remove a política antiga
DROP POLICY IF EXISTS "Users can create condominiums" ON public.condominiums;

-- Cria nova política restritiva (apenas super admins podem criar)
CREATE POLICY "Only super admins can create condominiums"
ON public.condominiums
FOR INSERT
WITH CHECK (is_super_admin());