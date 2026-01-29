-- Adicionar role collaborator ao enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'collaborator';

-- Criar funcao para verificar se pode criar avisos
CREATE OR REPLACE FUNCTION public.can_create_announcement(cond_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN 
    public.can_manage_condominium(cond_id) OR 
    public.has_condominium_role(cond_id, 'collaborator') OR
    public.is_super_admin();
END;
$$;

-- Atualizar policy de INSERT em announcements para usar a nova funcao
DROP POLICY IF EXISTS "Create announcements" ON public.announcements;

CREATE POLICY "Create announcements" ON public.announcements
FOR INSERT
WITH CHECK (
  can_create_announcement(condominium_id) AND 
  created_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
);