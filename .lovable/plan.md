

# Plano: Poderes Completos do Super Admin

## Resumo

Implementar as funcionalidades completas do Super Admin conforme solicitado:

1. Cadastrar e excluir condominios
2. Cadastrar e excluir Sindicos e moradores
3. Ver a Timeline de todos os condominios

---

## Analise do Estado Atual

### O que ja existe

| Funcionalidade | Status |
|----------------|--------|
| Criar condominio | Implementado |
| Excluir condominio | Implementado |
| Editar condominio | Implementado |
| Ver lista de usuarios | Implementado |
| Promover/Remover Super Admin | Implementado |
| Gerenciar sindicos/moradores | Nao existe |
| Ver timelines de todos os condos | Parcial (link externo) |

### O que precisa ser implementado

1. **Gestao de Membros por Condominio**: Adicionar/remover sindicos e moradores vinculados a cada condominio
2. **Visualizacao de Timelines**: Pagina para ver todas as timelines no painel Super Admin

---

## Implementacao

### 1. Nova Pagina: Gerenciar Membros do Condominio

Criar pagina `src/pages/super-admin/SuperAdminCondoMembers.tsx`

**Funcionalidades:**
- Listar todos os usuarios vinculados ao condominio (via tabela `user_roles`)
- Adicionar novo membro (sindico ou morador)
- Remover membro do condominio
- Alterar role do membro (syndic <-> admin)

**Fluxo de navegacao:**
- Na tabela de condominios, adicionar botao "Membros" que leva para `/super-admin/condominiums/:condoId/members`

---

### 2. Atualizar Tabela user_roles

Adicionar role "resident" para moradores (atualmente so existe admin e syndic):

```sql
ALTER TYPE public.app_role ADD VALUE 'resident';
```

---

### 3. Nova Pagina: Ver Todas as Timelines

Criar pagina `src/pages/super-admin/SuperAdminTimelines.tsx`

**Funcionalidades:**
- Lista de todos os condominios com link direto para cada timeline
- Preview rapido dos avisos mais recentes de cada condominio
- Contador de avisos por condominio

**Adicionar card no dashboard Super Admin:**
- "Ver Timelines" com estatisticas de avisos

---

### 4. Atualizar Rotas

```text
/super-admin/condominiums/:condoId/members -> SuperAdminCondoMembers
/super-admin/timelines -> SuperAdminTimelines
```

---

### 5. Atualizar Dashboard Super Admin

Adicionar terceiro card para "Timelines" com:
- Total de avisos na plataforma
- Link para ver todas as timelines

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/super-admin/SuperAdminCondoMembers.tsx` | Gestao de sindicos/moradores por condominio |
| `src/pages/super-admin/SuperAdminTimelines.tsx` | Visualizacao de todas as timelines |
| `src/hooks/useCondoMembers.ts` | Hook para buscar membros de um condominio |
| `src/hooks/useAllAnnouncements.ts` | Hook para buscar avisos de todos os condominios |

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/App.tsx` | Adicionar novas rotas |
| `src/pages/super-admin/SuperAdminDashboard.tsx` | Adicionar card de Timelines |
| `src/pages/super-admin/SuperAdminCondominiums.tsx` | Adicionar botao "Membros" na tabela |

---

## Fluxo Visual

```text
Super Admin Dashboard
    |
    +-- Gerenciar Condominios
    |       |
    |       +-- [Por condominio] Gerenciar Membros
    |               |
    |               +-- Adicionar Sindico
    |               +-- Adicionar Morador
    |               +-- Remover Membro
    |
    +-- Gerenciar Usuarios (existente)
    |       |
    |       +-- Promover/Remover Super Admin
    |
    +-- Ver Timelines (NOVO)
            |
            +-- Lista de todos os condominios
            +-- Link para cada timeline
            +-- Estatisticas de avisos
```

---

## Secao Tecnica

### Migration SQL

```sql
-- Adicionar role resident
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'resident';
```

### RLS Policies (ja existentes)

As policies ja permitem Super Admin gerenciar user_roles:
- `Insert roles`: `can_manage_condominium(condominium_id) OR is_super_admin()`
- `Delete roles`: `can_manage_condominium(condominium_id) OR is_super_admin()`
- `View roles`: `can_manage_condominium(condominium_id) OR is_super_admin()`

### Estrutura do Hook useCondoMembers

```typescript
interface Member {
  id: string;
  user_id: string;
  role: 'admin' | 'syndic' | 'resident';
  created_at: string;
  profile: {
    full_name: string | null;
    email: string | null;
  };
}

function useCondoMembers(condoId: string) {
  // Buscar da tabela user_roles com join em profiles
  // Retornar lista de membros
}
```

---

## Resultado Final

Apos implementacao, o Super Admin podera:

1. Criar e excluir condominios (ja funciona)
2. Adicionar sindicos e moradores a qualquer condominio
3. Remover sindicos e moradores de qualquer condominio
4. Visualizar a timeline de todos os condominios diretamente do painel

