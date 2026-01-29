-- Remover política atual de auto-registro de moradores
DROP POLICY IF EXISTS "Users can self-register as resident" ON public.user_roles;

-- Criar nova política que exige is_approved = false para moradores se auto-registrarem
CREATE POLICY "Users can self-register as resident"
ON public.user_roles FOR INSERT
WITH CHECK (
  (role = 'resident'::app_role) 
  AND (is_approved = false)
  AND (user_id = (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
);