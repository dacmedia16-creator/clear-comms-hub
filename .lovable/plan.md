

# Plano: Sistema Super Admin

## Visao Geral

Criar um papel **Super Admin** que podera gerenciar **todos os condominios** da plataforma e administrar contas de usuarios. Sera um papel especial a nivel de sistema (nao vinculado a um condominio especifico).

---

## Arquitetura do Sistema de Roles

```text
+-------------------+     +---------------------+     +-------------------+
|    Super Admin    |     |  Condominium Owner  |     |  Condominium Admin|
|-------------------|     |---------------------|     |-------------------|
| - Acesso global   |     | - owner_id no condo |     | - user_roles table|
| - Gerenciar todos |     | - CRUD no seu condo |     | - role = 'admin'  |
| - Criar usuarios  |     |                     |     | - Por condominio  |
+-------------------+     +---------------------+     +-------------------+
         |                         |                          |
         v                         v                          v
   [super_admins]          [condominiums]              [user_roles]
   (nova tabela)          (owner_id = profile)      (user_id + condo_id)
```

---

## Mudancas no Banco de Dados

### 1. Nova Tabela: `super_admins`
Tabela dedicada para super admins (separada do user_roles para evitar confusao de contexto):

```sql
CREATE TABLE public.super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);
```

### 2. Nova Funcao: `is_super_admin()`
Funcao security definer para verificar se o usuario atual e super admin:

```sql
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.super_admins sa
    JOIN public.profiles p ON sa.user_id = p.id
    WHERE p.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;
```

### 3. Atualizar Politicas RLS
Adicionar permissoes para super admins nas tabelas principais:

- **profiles**: Super admin pode ver todos os perfis
- **condominiums**: Super admin pode CRUD em todos os condominios
- **user_roles**: Super admin pode gerenciar roles de qualquer condominio
- **announcements**: Super admin pode ver/editar avisos de qualquer condominio

---

## Funcionalidades do Super Admin

### Painel Super Admin (`/super-admin`)
1. **Dashboard Global**
   - Total de condominios cadastrados
   - Total de usuarios
   - Avisos publicados no periodo

2. **Gerenciar Condominios**
   - Lista de todos os condominios
   - Criar condominio para qualquer usuario
   - Editar/excluir condominios
   - Alterar plano do condominio
   - Atribuir novo owner

3. **Gerenciar Usuarios**
   - Lista de todos os profiles
   - Busca por email/nome
   - Ver condominios do usuario
   - Promover usuario a super admin
   - Remover super admin

4. **Gerenciar Admins por Condominio**
   - Adicionar admins a um condominio
   - Remover admins
   - Ver roles de cada usuario

---

## Novas Paginas e Componentes

### Paginas
| Rota | Componente | Descricao |
|------|------------|-----------|
| `/super-admin` | `SuperAdminDashboard.tsx` | Painel principal |
| `/super-admin/condominiums` | `SuperAdminCondominiums.tsx` | Lista/CRUD condominios |
| `/super-admin/users` | `SuperAdminUsers.tsx` | Lista/gerenciar usuarios |
| `/super-admin/users/:id` | `SuperAdminUserDetail.tsx` | Detalhes do usuario |

### Hooks
| Hook | Funcao |
|------|--------|
| `useSuperAdmin.ts` | Verificar se usuario e super admin |
| `useAllCondominiums.ts` | Buscar todos condominios (paginado) |
| `useAllUsers.ts` | Buscar todos usuarios (paginado) |

### Componentes
| Componente | Uso |
|------------|-----|
| `SuperAdminGuard.tsx` | Proteger rotas de super admin |
| `CreateCondominiumDialog.tsx` | Modal para criar condominio |
| `ManageAdminsDialog.tsx` | Modal para gerenciar admins |
| `PromoteSuperAdminDialog.tsx` | Modal para promover super admin |

---

## Fluxo de Acesso

```text
Usuario logado
      |
      v
  [Dashboard normal: /dashboard]
      |
      +-- E Super Admin? ---> [Link "Super Admin" no header]
      |                              |
      v                              v
  [Lista seus condominios]    [/super-admin]
                                     |
                  +------------------+------------------+
                  |                  |                  |
                  v                  v                  v
           [Condominios]       [Usuarios]        [Dashboard]
           - Ver todos         - Ver todos       - Estatisticas
           - Criar             - Promover        - Metricas
           - Editar            - Adicionar roles
```

---

## Seguranca

1. **Verificacao server-side**: Toda operacao usa `is_super_admin()` nas RLS policies
2. **Sem storage client-side**: Nunca armazenar status de super admin em localStorage
3. **Audit trail**: Registrar `created_by` quando um super admin e criado
4. **Primeiro super admin**: Sera criado manualmente via SQL ou seed

---

## Implementacao Passo a Passo

### Fase 1: Database
1. Criar tabela `super_admins`
2. Criar funcao `is_super_admin()`
3. Atualizar RLS policies existentes
4. Criar novas RLS policies para super_admins

### Fase 2: Backend (hooks)
1. Criar `useSuperAdmin.ts` - verificar status
2. Criar `useAllCondominiums.ts` - listar todos condos
3. Criar `useAllUsers.ts` - listar todos usuarios

### Fase 3: Frontend
1. Criar `SuperAdminGuard.tsx` - proteger rotas
2. Criar `SuperAdminDashboard.tsx` - painel principal
3. Criar `SuperAdminCondominiums.tsx` - gerenciar condos
4. Criar `SuperAdminUsers.tsx` - gerenciar usuarios
5. Adicionar link "Super Admin" no header do Dashboard (condicional)

### Fase 4: Funcionalidades
1. CRUD condominios (qualquer condo)
2. Gerenciar roles por condominio
3. Promover/remover super admins
4. Criar primeiro super admin via migration

---

## Arquivos a Criar/Modificar

| Acao | Arquivo |
|------|---------|
| Criar | `supabase/migrations/XXXX_super_admin.sql` |
| Criar | `src/hooks/useSuperAdmin.ts` |
| Criar | `src/hooks/useAllCondominiums.ts` |
| Criar | `src/hooks/useAllUsers.ts` |
| Criar | `src/components/SuperAdminGuard.tsx` |
| Criar | `src/pages/super-admin/SuperAdminDashboard.tsx` |
| Criar | `src/pages/super-admin/SuperAdminCondominiums.tsx` |
| Criar | `src/pages/super-admin/SuperAdminUsers.tsx` |
| Modificar | `src/App.tsx` - adicionar rotas |
| Modificar | `src/pages/DashboardPage.tsx` - link condicional |

---

## Observacoes Importantes

- O primeiro Super Admin sera criado via migration ou manualmente no banco
- Super Admin NAO e um role na tabela `user_roles` (que e por condominio)
- Super Admin tem acesso GLOBAL, independente de condominio
- A interface do Super Admin e separada do Dashboard normal

