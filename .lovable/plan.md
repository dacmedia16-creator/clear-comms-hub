
# Plano: Permitir Síndico Ver Moradores Cadastrados

## Resumo do Problema

Atualmente, apenas Super Admins conseguem ver a lista de moradores de um condomínio. Síndicos não têm acesso porque:

1. A página de membros (`SuperAdminCondoMembers`) está protegida pelo `SuperAdminGuard`
2. A política de segurança da tabela `profiles` só permite visualização pelo próprio usuário ou Super Admins

## Solução Proposta

Criar uma nova página de membros acessível para gestores (Síndico/Admin/Owner) e atualizar as permissões do banco de dados.

---

## Alterações Necessárias

### 1. Banco de Dados (Migration SQL)

Atualizar a política RLS da tabela `profiles` para permitir que gestores de condomínios vejam os perfis dos membros vinculados:

```sql
-- Nova política: Gestores podem ver perfis de membros do seu condomínio
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

### 2. Nova Página: Membros do Condomínio

Criar `src/pages/CondoMembersPage.tsx` - página de visualização de membros para gestores:

| Elemento | Descrição |
|----------|-----------|
| Header | Botão voltar + nome do condomínio |
| Tabela | Lista de membros com nome, telefone, unidade, função |
| Botão Adicionar | Para cadastrar novos moradores |

### 3. Atualizar Rotas

Adicionar nova rota em `src/App.tsx`:
- `/admin/:condoId/members` → `CondoMembersPage`

### 4. Atualizar Dashboard/Admin

Adicionar botão "Ver Moradores" na página de administração do condomínio para síndicos/admins.

---

## Fluxo de Acesso

```text
Dashboard
    │
    ├── Card do Condomínio
    │       │
    │       └── Botão "Gerenciar avisos" → AdminCondominiumPage
    │                                           │
    │                                           ├── Botão "Ver Moradores" → CondoMembersPage (NOVO)
    │                                           │
    │                                           └── Botão "Config" → CondominiumSettingsPage
```

---

## Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `supabase/migrations/...` | Criar | Política RLS para profiles |
| `src/pages/CondoMembersPage.tsx` | Criar | Nova página de membros |
| `src/App.tsx` | Modificar | Adicionar rota `/admin/:condoId/members` |
| `src/pages/AdminCondominiumPage.tsx` | Modificar | Adicionar botão "Ver Moradores" |

---

## Permissões

| Ação | Síndico | Admin | Owner | Super Admin |
|------|---------|-------|-------|-------------|
| Ver lista de membros | ✅ | ✅ | ✅ | ✅ |
| Adicionar membro | ✅ | ✅ | ✅ | ✅ |
| Remover membro | ✅ | ✅ | ✅ | ✅ |

---

## Seção Técnica

### Política RLS Detalhada

A nova política verifica se o usuário logado pode gerenciar pelo menos um condomínio onde o perfil alvo está vinculado:

```sql
CREATE POLICY "Condo managers can view member profiles"
ON public.profiles FOR SELECT
USING (
  -- Permite visualizar perfis de membros dos condomínios que o usuário gerencia
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = profiles.id
    AND can_manage_condominium(ur.condominium_id)
  )
);
```

### Reutilização de Componentes

- `useCondoMembers` - hook existente que já busca membros
- `AddMemberDialog` - componente existente para adicionar membros
- O código será similar ao `SuperAdminCondoMembers`, mas sem o guard de super admin

### Segurança

- Síndicos só verão membros dos **seus** condomínios
- A função `can_manage_condominium` já inclui validação de owner/admin/syndic
- Moradores comuns não terão acesso a esta página
