CREATE OR REPLACE FUNCTION public.get_condo_members_by_ids(_member_ids uuid[])
RETURNS TABLE(id uuid, full_name text, email text, phone text, phone_secondary text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT cm.id, cm.full_name, cm.email, cm.phone, cm.phone_secondary
    FROM condo_members cm
    WHERE cm.id = ANY(_member_ids);
END;
$$;