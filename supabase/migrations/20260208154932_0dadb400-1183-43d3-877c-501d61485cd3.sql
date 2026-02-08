-- Atualizar função can_manage_condominium para incluir Super Admin
CREATE OR REPLACE FUNCTION public.can_manage_condominium(cond_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 
    public.is_condominium_owner(cond_id) OR 
    public.has_condominium_role(cond_id, 'admin') OR
    public.has_condominium_role(cond_id, 'syndic') OR
    public.is_super_admin();
END;
$function$;