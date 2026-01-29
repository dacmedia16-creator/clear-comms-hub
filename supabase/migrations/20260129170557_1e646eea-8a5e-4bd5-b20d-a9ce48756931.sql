-- Adicionar campo de unidade na tabela user_roles
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS unit text;

COMMENT ON COLUMN public.user_roles.unit IS 
  'Bloco e Unidade do morador neste condominio (ex: Bloco A, Apt 101)';

-- Criar política para permitir super admins inserir profiles para moradores sem login
DROP POLICY IF EXISTS "Super admins can insert profiles" ON public.profiles;
CREATE POLICY "Super admins can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (is_super_admin());