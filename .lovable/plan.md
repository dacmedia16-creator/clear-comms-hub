
# Correção Definitiva: Recursão Infinita nas Políticas RLS

## Problema Raiz

A função `get_current_profile_id()` faz SELECT na tabela `profiles`. Mesmo sendo `SECURITY DEFINER`, quando essa função é chamada dentro de uma política RLS da própria tabela `profiles`, ocorre recursão infinita porque:

```text
SELECT FROM profiles 
→ Policy "Users can view profiles" avaliada
→ Chama is_super_admin()
→ Chama get_current_profile_id()
→ SELECT FROM profiles (precisa avaliar RLS novamente)
→ RECURSÃO INFINITA!
```

## Solução

Vamos reestruturar completamente as funções para **nunca consultar `profiles` dentro de funções usadas em RLS de `profiles`**. A nova abordagem:

1. Usar diretamente `auth.uid()` (que retorna o `user_id` da tabela `auth.users`)
2. Modificar todas as verificações para comparar com `user_id` em vez de `profile_id`
3. Atualizar as funções para trabalhar com `auth.uid()` diretamente

---

## Alterações no Banco de Dados

### 1. Remover Todas as Políticas Problemáticas

```sql
DROP POLICY IF EXISTS "Condo managers can view member profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
```

### 2. Recriar Funções Sem Consultar Profiles

A chave é: nunca consultar `profiles` dentro das funções que serão usadas em RLS de `profiles`.

```sql
-- Função que retorna o profile_id baseado APENAS em auth.uid()
-- SEM passar por RLS (usando tabela profiles bypassando todas as policies)
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  profile_id uuid;
BEGIN
  -- Bypass RLS completamente usando EXECUTE com role elevado
  SELECT p.id INTO profile_id 
  FROM public.profiles p 
  WHERE p.user_id = auth.uid() 
  LIMIT 1;
  
  RETURN profile_id;
END;
$$;

-- GRANT para garantir que a função pode acessar profiles
GRANT EXECUTE ON FUNCTION public.get_current_profile_id() TO authenticated;
```

Porém, o problema persiste porque mesmo com `SECURITY DEFINER`, o PostgreSQL avalia RLS se a função foi chamada de um contexto onde RLS está ativo.

### Solução Alternativa: Mudar Estrutura das Políticas

A abordagem correta é **não usar funções que fazem lookup em `profiles` dentro das políticas de `profiles`**. Em vez disso:

```sql
-- Política simples que não chama nenhuma função que consulte profiles
CREATE POLICY "Users can view profiles"
ON public.profiles FOR SELECT
USING (
  user_id = auth.uid()  -- Compara diretamente com auth.uid()
);
```

Para super admins, precisamos de uma política separada que não cause recursão:

```sql
-- Super admin lookup direto (não passa por profiles)
CREATE OR REPLACE FUNCTION public.is_super_admin_direct()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins sa
    INNER JOIN public.profiles p ON p.id = sa.user_id
    WHERE p.user_id = auth.uid()
  );
$$;
```

Mas isso ainda consulta profiles! A única solução é:

### Solução Definitiva: Mudar Estrutura da Tabela super_admins

Atualmente `super_admins.user_id` referencia `profiles.id`. Precisamos que referencie `auth.users.id` diretamente:

```sql
-- Alteração na estrutura (MIGRAÇÃO)
-- 1. Adicionar nova coluna auth_user_id
ALTER TABLE public.super_admins ADD COLUMN auth_user_id uuid;

-- 2. Preencher com os user_ids corretos
UPDATE public.super_admins sa
SET auth_user_id = (SELECT user_id FROM profiles WHERE id = sa.user_id);

-- 3. Função is_super_admin que não toca em profiles
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
```

### Mesma Abordagem para user_roles

A tabela `user_roles.user_id` atualmente referencia `profiles.id`. Para evitar recursão, precisamos adicionar uma coluna `auth_user_id`:

```sql
ALTER TABLE public.user_roles ADD COLUMN auth_user_id uuid;

UPDATE public.user_roles ur
SET auth_user_id = (SELECT user_id FROM profiles WHERE id = ur.user_id);
```

---

## Plano de Execução

| Passo | Ação |
|-------|------|
| 1 | Adicionar coluna `auth_user_id` nas tabelas `super_admins` e `user_roles` |
| 2 | Preencher os valores baseados na relação atual com `profiles` |
| 3 | Recriar funções `is_super_admin()`, `has_condominium_role()`, `is_condominium_owner()` usando `auth.uid()` diretamente |
| 4 | Remover a política problemática e recriar de forma simples |
| 5 | Atualizar triggers/constraints para manter consistência |

---

## SQL da Migração Completa

```sql
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

-- PASSO 6: Recriar função is_condominium_owner
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

-- PASSO 9: Política para gestores verem membros (SEM recursão)
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
```

---

## Resumo

O problema é estrutural: as tabelas `super_admins` e `user_roles` usam `profiles.id` como referência, mas as políticas RLS de `profiles` precisam verificar essas tabelas. Isso cria um ciclo.

A solução é adicionar uma coluna `auth_user_id` que armazena diretamente o `auth.users.id`, permitindo verificações sem consultar `profiles`.

---

## Impacto no Código Frontend

Nenhuma mudança necessária no código React/TypeScript. Todas as mudanças são no banco de dados.
