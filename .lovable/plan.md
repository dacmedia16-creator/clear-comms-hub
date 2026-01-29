

# Plano: Criar Usuario Colaborador

## Resumo

Criar um novo tipo de papel "collaborator" (colaborador) que pode ser vinculado a um condominio e possui permissao para criar avisos, mas sem as demais permissoes de administracao.

---

## Analise do Estado Atual

### Sistema de Roles Existente

| Role | Descricao | Permissoes |
|------|-----------|------------|
| admin | Administrador do condominio | Gestao completa |
| syndic | Sindico | Gestao completa |
| resident | Morador | Apenas visualizacao |

### RLS Policy para Criacao de Avisos

A policy atual permite criar avisos se:
```sql
can_manage_condominium(condominium_id) OR is_super_admin()
```

A funcao `can_manage_condominium` verifica:
- Se e owner do condominio OU
- Se tem role "admin" no condominio

### O que Precisa Mudar

1. Adicionar novo valor "collaborator" ao enum `app_role`
2. Atualizar policies RLS para permitir colaboradores criarem avisos
3. Atualizar interface do Super Admin para gerenciar colaboradores
4. Criar pagina de acesso para colaboradores

---

## Implementacao

### 1. Migracao SQL

```sql
-- Adicionar role collaborator
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

-- Atualizar policy de INSERT em announcements
DROP POLICY IF EXISTS "Create announcements" ON announcements;

CREATE POLICY "Create announcements" ON public.announcements
FOR INSERT
WITH CHECK (
  (can_create_announcement(condominium_id) AND 
   created_by = (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
```

### 2. Atualizar Hook useProfile

Modificar para buscar condominios onde o usuario tem qualquer role (incluindo collaborator), nao apenas onde e owner.

### 3. Atualizar Interface de Membros

Adicionar "Colaborador" como opcao ao adicionar membros no painel Super Admin.

### 4. Criar Pagina para Colaboradores

Colaboradores devem ter acesso a uma interface simplificada para:
- Ver condominios onde sao colaboradores
- Criar avisos nesses condominios
- Nao podem editar/excluir avisos de outros ou gerenciar membros

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/hooks/useProfile.ts` | Buscar condominios por role alem de ownership |
| `src/hooks/useCondoMembers.ts` | Incluir collaborator no tipo |
| `src/pages/super-admin/SuperAdminCondoMembers.tsx` | Adicionar opcao "Colaborador" |
| `src/pages/AdminCondominiumPage.tsx` | Ajustar verificacao de permissao |

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| Nenhum novo arquivo necessario | Reutilizar estrutura existente |

---

## Fluxo do Colaborador

```text
1. Super Admin adiciona usuario como "Colaborador" em um condominio
                          |
                          v
2. Colaborador faz login e ve o condominio no seu dashboard
                          |
                          v
3. Colaborador acessa AdminCondominiumPage
                          |
                          v
4. Colaborador pode criar novos avisos
   (Nao pode editar/excluir avisos de outros, nem gerenciar membros)
```

---

## Secao Tecnica

### Diferenca entre Roles

| Acao | Owner | Admin | Syndic | Collaborator | Resident |
|------|-------|-------|--------|--------------|----------|
| Criar avisos | Sim | Sim | Sim | Sim | Nao |
| Editar avisos proprios | Sim | Sim | Sim | Sim | Nao |
| Editar avisos de outros | Sim | Sim | Sim | Nao | Nao |
| Excluir avisos | Sim | Sim | Sim | Nao | Nao |
| Gerenciar membros | Sim | Sim | Nao | Nao | Nao |
| Ver timeline | Sim | Sim | Sim | Sim | Sim |

### Nova Funcao SQL

```sql
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
```

### Atualizacao do useProfile

```typescript
// Buscar condominios onde o usuario e owner OU tem um role
const { data: condoData } = await supabase
  .from("condominiums")
  .select(`
    *,
    user_roles!inner(role)
  `)
  .or(`owner_id.eq.${profileData.id},user_roles.user_id.eq.${profileData.id}`);
```

Alternativa mais simples usando duas queries:
1. Buscar condominios onde e owner
2. Buscar condominios via user_roles
3. Combinar resultados sem duplicatas

---

## Resultado Final

Apos implementacao:
- Super Admin pode adicionar usuarios como "Colaborador" a qualquer condominio
- Colaboradores veem os condominios no dashboard e podem criar avisos
- Colaboradores NAO podem excluir avisos ou gerenciar membros
- Sistema de roles fica mais flexivel para futuras expansoes

