-- Nova política: Gestores podem ver perfis de membros do seu condomínio
CREATE POLICY "Condo managers can view member profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = profiles.id
    AND can_manage_condominium(ur.condominium_id)
  )
);