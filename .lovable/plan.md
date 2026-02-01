

# Gerenciador de Planos no Super Admin

## Objetivo

Criar uma nova seção no painel Super Admin para gerenciar os planos de assinatura disponíveis, permitindo visualizar estatísticas, configurar limites e alterar planos de condomínios em massa.

---

## Arquitetura Proposta

Como os planos atualmente estão definidos apenas em código (`src/lib/constants.ts`) e não no banco de dados, existem duas abordagens possíveis:

### Opção A: Interface de Visualização (Recomendada)
Criar uma página que mostra os planos existentes, estatísticas de uso e permite gerenciar quais condomínios estão em cada plano.

### Opção B: Planos no Banco de Dados
Criar uma tabela `plans` no banco para armazenar os planos dinamicamente.

**Recomendo a Opção A** pois mantém a simplicidade e os planos raramente mudam.

---

## Funcionalidades da Nova Página

### 1. Visão Geral dos Planos
- Cards com cada plano (Free, Starter, Pro)
- Estatísticas: quantos condomínios em cada plano
- Recursos incluídos em cada plano
- Preço (visível apenas para admin)

### 2. Gestão de Planos por Condomínio
- Tabela com todos os condomínios
- Filtro por plano atual
- Alteração de plano individual ou em lote
- Busca por nome do condomínio

### 3. Relatório de Upgrades/Downgrades
- Histórico de mudanças de plano (futuro, requer nova tabela)

---

## Estrutura de Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/super-admin/SuperAdminPlans.tsx` | Nova página de gerenciamento |
| `src/App.tsx` | Adicionar rota `/super-admin/plans` |
| `src/pages/super-admin/SuperAdminDashboard.tsx` | Adicionar card de acesso rápido |
| `src/lib/constants.ts` | Manter planos (já existente) |

---

## Layout da Página

```text
+-------------------------------------------------------+
|  [<] Super Admin          [Atualizar] [Sair]          |
+-------------------------------------------------------+
|                                                       |
|  Gerenciador de Planos                                |
|  Visualize e gerencie os planos da plataforma         |
|                                                       |
|  +-------------+  +-------------+  +-------------+    |
|  |   GRATUITO  |  |   INICIAL   |  | PROFISSIONAL|    |
|  |   R$ 0/mês  |  |  R$ 199/mês |  |  R$ 299/mês |    |
|  |             |  |             |  |             |    |
|  | 5 condos    |  | 3 condos    |  | 2 condos    |    |
|  |             |  |             |  |             |    |
|  | - 10 avisos |  | - 50 avisos |  | - Ilimitado |    |
|  | - 2MB anexo |  | - 5MB anexo |  | - 10MB anexo|    |
|  | - Timeline  |  | - Email     |  | - Email+Zap |    |
|  +-------------+  +-------------+  +-------------+    |
|                                                       |
|  +-----------------------------------------------+    |
|  | Condomínios                    [Buscar...]   |    |
|  +-----------------------------------------------+    |
|  | Nome          | Plano    | Trial    | Ações  |    |
|  |---------------|----------|----------|--------|    |
|  | Residencial X | FREE     | 30 dias  | [Edit] |    |
|  | Condo Y       | PRO      | Expirado | [Edit] |    |
|  +-----------------------------------------------+    |
+-------------------------------------------------------+
```

---

## Implementação

### 1. Criar Página `SuperAdminPlans.tsx`

Nova página seguindo o padrão das existentes (header, SuperAdminGuard, MobileBottomNav):

- Importar `PLANS` de `constants.ts`
- Cards de estatísticas por plano
- Tabela de condomínios com ações de alteração de plano
- Filtros: por plano, por status de trial
- Modal para alterar plano de um condomínio

### 2. Atualizar `App.tsx`

Adicionar nova rota:
```tsx
<Route path="/super-admin/plans" element={<SuperAdminPlans />} />
```

### 3. Atualizar `SuperAdminDashboard.tsx`

Adicionar novo card na seção de links rápidos:
- Ícone: `CreditCard` (do lucide-react)
- Título: "Gerenciar Planos"
- Descrição: "Visualize e altere os planos dos condomínios"
- Estatísticas: contagem por plano

### 4. Atualizar Navegação Mobile

Adicionar item ao `superAdminNavItems` (opcional, pode ficar acessível apenas pelo dashboard).

---

## Seção Técnica

### Componentes Utilizados
- `Card`, `CardHeader`, `CardContent` - layout dos cards de planos
- `Table`, `TableHeader`, `TableRow`, `TableCell` - lista de condomínios
- `Dialog` - modal de alteração de plano
- `Select` - seleção do novo plano
- `Badge` - indicadores de plano
- `Button` - ações
- `Input` - busca

### Hooks Existentes a Utilizar
- `useAllCondominiums` - lista todos os condomínios
- `useSuperAdmin` - verificação de permissão

### Query de Atualização de Plano
```typescript
await supabase
  .from("condominiums")
  .update({ plan: newPlan })
  .eq("id", condoId);
```

### Estilização dos Badges de Plano
- **Free**: `bg-muted text-muted-foreground`
- **Starter**: `bg-amber-100 text-amber-700`
- **Pro**: `bg-primary/10 text-primary`

