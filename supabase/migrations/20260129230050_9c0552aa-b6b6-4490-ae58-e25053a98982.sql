-- PASSO 1: Adicionar colunas auth_user_id
ALTER TABLE public.super_admins 
ADD COLUMN IF NOT EXISTS auth_user_id uuid;

ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- PASSO 2: Preencher valores (executar uma vez)
UPDATE public.super_admins sa
SET auth_user_id = (SELECT p.user_id FROM profiles p WHERE p.id = sa.user_id)
WHERE auth_user_id IS NULL;

UPDATE public.user_roles ur
SET auth_user_id = (SELECT p.user_id FROM profiles p WHERE p.id = ur.user_id)
WHERE auth_user_id IS NULL;

-- PASSO 3: Remover políticas problemáticas
DROP POLICY IF EXISTS "Condo managers can view member profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- PASSO 4: Recriar função is_super_admin (SEM tocar em profiles)
CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins sa
    WHERE sa.auth_user_id = auth.uid()
  );
$$;

-- PASSO 5: Recriar função has_condominium_role (SEM tocar em profiles)
CREATE OR REPLACE FUNCTION public.has_condominium_role(cond_id uuid, _role app_role DEFAULT NULL)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.condominium_id = cond_id 
      AND ur.auth_user_id = auth.uid()
      AND (_role IS NULL OR ur.role = _role)
  );
$$;

-- PASSO 6: Recriar função is_condominium_owner (sem recursão)
CREATE OR REPLACE FUNCTION public.is_condominium_owner(cond_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.condominiums c
    INNER JOIN public.profiles p ON p.id = c.owner_id
    WHERE c.id = cond_id 
      AND p.user_id = auth.uid()
  );
$$;

-- PASSO 7: Atualizar can_manage_condominium
CREATE OR REPLACE FUNCTION public.can_manage_condominium(cond_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  RETURN 
    public.is_condominium_owner(cond_id) OR 
    public.has_condominium_role(cond_id, 'admin') OR
    public.has_condominium_role(cond_id, 'syndic');
END;
$$;

-- PASSO 8: Recriar política de profiles SEM recursão
CREATE POLICY "Users can view profiles"
ON public.profiles FOR SELECT
USING (
  user_id = auth.uid() OR is_super_admin()
);

-- PASSO 9: Política para gestores verem membros (usando auth_user_id)
CREATE POLICY "Condo managers can view member profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = profiles.id
    AND can_manage_condominium(ur.condominium_id)
  )
);

-- PASSO 10: Remover função get_current_profile_id (não é mais necessária)
DROP FUNCTION IF EXISTS public.get_current_profile_id();