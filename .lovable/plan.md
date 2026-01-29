
# Correção: Recursão Infinita nas Políticas de Profiles

## Problema Identificado

A nova política RLS `"Condo managers can view member profiles"` está causando **recursão infinita** no banco de dados, impedindo qualquer consulta à tabela `profiles`.

### Cadeia de Recursão

```text
SELECT FROM profiles
    ↓
Policy: "Condo managers can view member profiles"
    ↓
Chama can_manage_condominium()
    ↓
Chama has_condominium_role()
    ↓
JOIN public.profiles p ON ur.user_id = p.id
    ↓
SELECT FROM profiles (RECURSÃO!)
```

---

## Solução

### Passo 1: Remover a Política Problemática

Primeiro, precisamos remover a política que está causando o problema para restaurar o funcionamento da aplicação:

```sql
DROP POLICY IF EXISTS "Condo managers can view member profiles" ON public.profiles;
```

### Passo 2: Atualizar as Funções de Verificação

As funções `has_condominium_role`, `is_condominium_owner` e `is_super_admin` devem consultar diretamente `auth.uid()` sem fazer JOIN com `profiles`, usando a tabela `user_roles.user_id` como referência ao `profiles.id`:

```sql
-- Função auxiliar para obter o profile_id do usuário logado sem acessar profiles
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Atualizar has_condominium_role para evitar JOIN com profiles
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

-- Atualizar is_condominium_owner
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

-- Atualizar is_super_admin
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
```

### Passo 3: Recriar Política Sem Recursão

Depois de atualizar as funções, podemos recriar a política de forma segura:

```sql
CREATE POLICY "Condo managers can view member profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = profiles.id
    AND can_manage_condominium(ur.condominium_id)
  )
);
```

---

## Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| Migration SQL | Criar | Remover política + atualizar funções + recriar política |

---

## Ordem de Execução

1. DROP da política problemática (restaura acesso imediato)
2. CREATE função `get_current_profile_id()`
3. ALTER funções existentes para usar a nova função auxiliar
4. CREATE da política corrigida

---

## Seção Técnica

### Por que a Recursão Acontece?

O PostgreSQL avalia políticas RLS antes de retornar dados. Quando uma política em `profiles` chama uma função que faz SELECT em `profiles`, o banco precisa verificar as políticas novamente, criando um loop infinito.

### Solução: Função SECURITY DEFINER

A função `get_current_profile_id()` é marcada como `SECURITY DEFINER`, o que significa que ela roda com os privilégios do **criador da função** (superuser), não do usuário atual. Isso permite que ela consulte `profiles` sem passar pelas políticas RLS, quebrando o ciclo de recursão.

### Impacto

- Todas as funções de verificação continuarão funcionando normalmente
- Nenhuma mudança no código frontend necessária
- A aplicação voltará a funcionar imediatamente após a migração
