-- Passo 1: Remover a política problemática
DROP POLICY IF EXISTS "Condo managers can view member profiles" ON public.profiles;

-- Passo 2: Criar função auxiliar SECURITY DEFINER para obter profile_id sem RLS
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Passo 3: Atualizar has_condominium_role para usar a função auxiliar
CREATE OR REPLACE FUNCTION public.has_condominium_role(cond_id uuid, _role app_role DEFAULT NULL::app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.condominium_id = cond_id 
      AND ur.user_id = public.get_current_profile_id()
      AND (_role IS NULL OR ur.role = _role)
  );
$$;

-- Passo 4: Atualizar is_condominium_owner
CREATE OR REPLACE FUNCTION public.is_condominium_owner(cond_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.condominiums c
    WHERE c.id = cond_id 
      AND c.owner_id = public.get_current_profile_id()
  );
$$;

-- Passo 5: Atualizar is_super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins sa
    WHERE sa.user_id = public.get_current_profile_id()
  );
$$;

-- Passo 6: Recriar a política corrigida (agora sem recursão)
CREATE POLICY "Condo managers can view member profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = profiles.id
    AND can_manage_condominium(ur.condominium_id)
  )
);