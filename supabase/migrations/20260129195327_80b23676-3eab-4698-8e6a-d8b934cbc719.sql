-- Corrigir funcao can_create_announcement para incluir syndic
CREATE OR REPLACE FUNCTION public.can_create_announcement(cond_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 
    public.can_manage_condominium(cond_id) OR 
    public.has_condominium_role(cond_id, 'syndic') OR
    public.has_condominium_role(cond_id, 'collaborator') OR
    public.is_super_admin();
END;
$function$;