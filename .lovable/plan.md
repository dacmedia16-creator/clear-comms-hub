

# Criar Planos Dinamicamente no Super Admin

## Objetivo

Permitir que o Super Admin crie, edite e exclua planos de assinatura através da interface, em vez de ter planos fixos no código.

---

## Situação Atual

Os planos estão definidos de duas formas:

1. **Código (constants.ts)**: Define nome, preço, limites e features
2. **Banco de Dados (ENUM)**: `plan_type` com valores fixos `['free', 'starter', 'pro']`

Esta arquitetura impede criar novos planos sem alterar o código e o banco.

---

## Nova Arquitetura

Migrar para uma tabela `plans` no banco de dados que armazena todas as configurações dos planos dinamicamente.

---

## Mudanças Necessárias

### 1. Banco de Dados

**Criar tabela `plans`:**

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único |
| slug | text | Identificador de URL (ex: "free", "starter") |
| name | text | Nome exibido (ex: "Gratuito") |
| price | integer | Preço em centavos (0 = grátis) |
| announcements_per_month | integer | Limite de avisos (-1 = ilimitado) |
| max_attachment_size_mb | integer | Tamanho máximo de anexo em MB |
| features | jsonb | Array de features para exibição |
| badge_class | text | Classes CSS do badge |
| is_active | boolean | Se o plano está disponível |
| display_order | integer | Ordem de exibição |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data de atualização |

**RLS Policies:**
- Super admins podem CRUD completo
- Leitura pública para exibir na interface

**Migrar coluna `condominiums.plan`:**
- Alterar de ENUM para TEXT (referenciando `plans.slug`)

**Dados iniciais:**
- Inserir os 3 planos atuais (free, starter, pro) na nova tabela

---

### 2. Hook para Gerenciar Planos

**Criar `src/hooks/usePlans.ts`:**

```typescript
interface Plan {
  id: string;
  slug: string;
  name: string;
  price: number;
  announcements_per_month: number;
  max_attachment_size_mb: number;
  features: string[];
  badge_class: string;
  is_active: boolean;
  display_order: number;
}

// Funções:
// - fetchPlans(): Listar todos os planos
// - createPlan(): Criar novo plano
// - updatePlan(): Atualizar plano existente
// - deletePlan(): Excluir plano (se não houver condos usando)
```

---

### 3. Atualizar SuperAdminPlans.tsx

**Adicionar funcionalidades:**

1. **Botão "Novo Plano"** no header
2. **Modal de criação/edição** com campos:
   - Nome do plano
   - Slug (gerado automaticamente do nome)
   - Preço (em R$)
   - Limite de avisos por mês
   - Tamanho máximo de anexo (MB)
   - Features (lista editável)
   - Cor do badge
   - Status (ativo/inativo)

3. **Ações nos cards de plano:**
   - Editar plano
   - Desativar plano
   - Excluir plano (apenas se não tiver condos vinculados)

4. **Reordenação:**
   - Arrastar para reordenar a exibição dos planos

---

### 4. Atualizar Referências no Código

**Arquivos que usam PLANS de constants.ts:**

| Arquivo | Mudança |
|---------|---------|
| `src/lib/constants.ts` | Manter como fallback/cache |
| `src/pages/super-admin/SuperAdminPlans.tsx` | Usar hook usePlans |
| `src/pages/super-admin/SuperAdminDashboard.tsx` | Usar hook usePlans |
| `src/hooks/useAllCondominiums.ts` | Atualizar tipo de plan |
| Outros componentes que mostram plano | Adaptar para dados dinâmicos |

---

## Layout da Interface Atualizada

```text
+-------------------------------------------------------+
|  [<] Planos                    [+ Novo Plano]  [Sair] |
+-------------------------------------------------------+
|                                                       |
|  Gerenciador de Planos                                |
|  Crie e gerencie os planos da plataforma              |
|                                                       |
|  +-------------+  +-------------+  +-------------+    |
|  |   GRATUITO  |  |   INICIAL   |  | PROFISSIONAL|    |
|  |   R$ 0/mês  |  |  R$ 199/mês |  |  R$ 299/mês |    |
|  |  [Editar]   |  |  [Editar]   |  |  [Editar]   |    |
|  +-------------+  +-------------+  +-------------+    |
|                                                       |
|  [Tabela de Condomínios permanece igual...]           |
+-------------------------------------------------------+
```

**Modal de Criação/Edição:**

```text
+------------------------------------------+
|  Novo Plano / Editar Plano       [X]     |
+------------------------------------------+
|  Nome: [_____________________]           |
|  Slug: [_____________________] (auto)    |
|  Preço (R$): [______]                    |
|  Avisos/mês: [______] (-1 = ilimitado)   |
|  Anexo máx (MB): [______]                |
|                                          |
|  Features:                               |
|  [+ Adicionar feature]                   |
|  - Até 10 avisos/mês          [x]        |
|  - Timeline pública           [x]        |
|                                          |
|  Cor do Badge: [Selecionar...]           |
|  [x] Plano ativo                         |
|                                          |
|            [Cancelar]  [Salvar]          |
+------------------------------------------+
```

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| **Migração SQL** | Criar tabela `plans`, migrar coluna, inserir dados |
| `src/hooks/usePlans.ts` | **Novo** - Hook para CRUD de planos |
| `src/pages/super-admin/SuperAdminPlans.tsx` | Adicionar modal e ações de CRUD |
| `src/lib/constants.ts` | Manter como fallback (opcional remover depois) |
| `src/hooks/useAllCondominiums.ts` | Atualizar tipo de plan para string |

---

## Seção Tecnica

### Migração SQL

```sql
-- 1. Criar tabela plans
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  announcements_per_month integer NOT NULL DEFAULT 10,
  max_attachment_size_mb integer NOT NULL DEFAULT 2,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  badge_class text NOT NULL DEFAULT 'bg-muted text-muted-foreground',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
ON public.plans FOR SELECT
USING (is_active = true OR is_super_admin());

CREATE POLICY "Super admins can manage plans"
ON public.plans FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- 3. Inserir planos existentes
INSERT INTO public.plans (slug, name, price, announcements_per_month, 
  max_attachment_size_mb, features, badge_class, display_order) VALUES
('free', 'Gratuito', 0, 10, 2, 
  '["Até 10 avisos/mês", "Anexos até 2MB", "Timeline pública"]',
  'bg-muted text-muted-foreground', 1),
('starter', 'Inicial', 19900, 50, 5,
  '["Até 50 avisos/mês", "Anexos até 5MB", "Notificações por email", "Suporte prioritário"]',
  'bg-amber-100 text-amber-700', 2),
('pro', 'Profissional', 29900, -1, 10,
  '["Avisos ilimitados", "Anexos até 10MB", "Email + WhatsApp", "Relatórios", "API de integração"]',
  'bg-primary/10 text-primary', 3);

-- 4. Alterar coluna condominiums.plan de ENUM para TEXT
ALTER TABLE public.condominiums 
  ALTER COLUMN plan TYPE text USING plan::text;

-- 5. Remover o ENUM antigo (opcional, após confirmar migração)
-- DROP TYPE public.plan_type;
```

### Validação de Exclusão

Antes de excluir um plano, verificar se há condomínios usando:

```typescript
const { count } = await supabase
  .from('condominiums')
  .select('*', { count: 'exact', head: true })
  .eq('plan', planSlug);

if (count > 0) {
  throw new Error(`Não é possível excluir: ${count} condomínios usam este plano`);
}
```

