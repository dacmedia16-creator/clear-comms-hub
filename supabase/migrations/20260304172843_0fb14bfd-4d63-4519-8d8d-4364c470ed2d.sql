CREATE OR REPLACE FUNCTION public.get_condominium_user_roles(
  _condominium_id uuid,
  _list_id uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  member_id uuid,
  role app_role,
  block text,
  unit text,
  is_approved boolean,
  created_at timestamptz,
  list_id uuid
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check permission ONCE
  IF NOT (
    can_manage_condominium(_condominium_id) 
    OR is_super_admin()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Return rows without per-row RLS
  RETURN QUERY
    SELECT ur.id, ur.user_id, ur.member_id, ur.role, 
           ur.block, ur.unit, ur.is_approved, ur.created_at, ur.list_id
    FROM user_roles ur
    WHERE ur.condominium_id = _condominium_id
      AND (_list_id IS NULL OR ur.list_id = _list_id)
    ORDER BY ur.created_at DESC;
END;
$$;