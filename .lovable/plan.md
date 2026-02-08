

# Plano: Estruturação Multi-Segmento do AVISO PRO

## Visão Geral

Expandir o sistema para atender **escolas, empresas, clínicas, associações e academias** além de condomínios, mantendo a terminologia atual como padrão e permitindo seleção de tipo na criação. As categorias serão híbridas: base universal + adicionais por segmento.

---

## 1. Arquitetura de Dados

### Nova Coluna na Tabela `condominiums`

| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `organization_type` | ENUM | `'condominium'` | Tipo da organização |

### Novo Enum `organization_type`

```sql
CREATE TYPE public.organization_type AS ENUM (
  'condominium',  -- Condomínio (padrão)
  'school',       -- Escola
  'company',      -- Empresa
  'clinic',       -- Clínica
  'association',  -- Associação
  'gym',          -- Academia
  'church',       -- Igreja
  'club',         -- Clube
  'other'         -- Outros
);
```

---

## 2. Terminologia Dinâmica

Mapa de tradução por tipo de organização:

| Termo Base | condominium | school | company | clinic | gym | church |
|------------|-------------|--------|---------|--------|-----|--------|
| **Organização** | Condomínio | Escola | Empresa | Clínica | Academia | Igreja |
| **Gestor** | Síndico | Diretor | Gestor | Administrador | Proprietário | Pastor |
| **Membro** | Morador | Aluno/Responsável | Colaborador | Paciente | Aluno | Membro |
| **Bloco** | Bloco | Série/Turma | Departamento | Setor | Turma | Ministério |
| **Unidade** | Unidade | Sala | Cargo | Área | - | Grupo |

### Arquivo de Constantes

```typescript
// src/lib/organization-types.ts
export const ORGANIZATION_TYPES = {
  condominium: {
    label: "Condomínio",
    icon: Building2,
    terms: {
      organization: "Condomínio",
      manager: "Síndico",
      member: "Morador",
      block: "Bloco",
      unit: "Unidade",
    },
  },
  school: {
    label: "Escola",
    icon: GraduationCap,
    terms: {
      organization: "Escola",
      manager: "Diretor",
      member: "Aluno",
      block: "Série",
      unit: "Turma",
    },
  },
  // ... demais tipos
};
```

---

## 3. Categorias Híbridas

### Categorias Base (Universais)

Manter as 6 categorias atuais como disponíveis para todos:
- Informativo
- Financeiro
- Manutenção
- Convivência
- Segurança
- Urgente

### Categorias Adicionais por Segmento

| Segmento | Categorias Extras |
|----------|-------------------|
| **Escola** | Pedagógico, Eventos, Calendário Escolar |
| **Empresa** | RH, Operacional, Compliance |
| **Clínica** | Atendimento, Horários, Saúde |
| **Academia** | Treinos, Horários, Promoções |
| **Igreja** | Cultos, Eventos, Pastoral |

### Estrutura de Dados

Nova tabela `category_templates`:

```sql
CREATE TABLE public.category_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  color_class TEXT NOT NULL,
  organization_types organization_type[] DEFAULT '{}',
  is_universal BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. Modificações na Interface

### 4.1 Criação de Organização (Super Admin)

Adicionar seletor de tipo no dialog de criação:

```
┌─────────────────────────────────────────┐
│ Criar Nova Organização                  │
├─────────────────────────────────────────┤
│ Tipo de Organização                     │
│ ┌─────────────────────────────────────┐ │
│ │ 🏢 Condomínio                    ▼ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Nome *                                  │
│ ┌─────────────────────────────────────┐ │
│ │ Ex: Residencial Jardins             │ │
│ └─────────────────────────────────────┘ │
│ ...                                     │
└─────────────────────────────────────────┘
```

### 4.2 Dashboard

Exibir ícone correspondente ao tipo:
- 🏢 Building2 → Condomínio
- 🎓 GraduationCap → Escola
- 🏛️ Briefcase → Empresa
- 🏥 Stethoscope → Clínica
- 💪 Dumbbell → Academia
- ⛪ Church → Igreja

### 4.3 Página de Membros

Labels dinâmicos baseados no tipo:
- "Moradores" → "Alunos" (escola)
- "Bloco" → "Série" (escola)
- "Unidade" → "Turma" (escola)

---

## 5. Modificações na Landing Page

### Hero Section

Atualizar o mockup visual para ser mais genérico:

**Atual:**
```
Condomínio Jardins
Canal Oficial
```

**Novo:**
```
Organização Exemplo
Canal Oficial
```

Manter a menção aos segmentos no texto abaixo do CTA:
> "Para condomínios, escolas, empresas, clínicas, associações e academias."

### Seção "Como Funciona"

Manter textos genéricos já implementados (não menciona "condomínio").

---

## 6. Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/lib/organization-types.ts` | **CRIAR** - Constantes e mapeamentos |
| `src/lib/constants.ts` | Mover categorias para `category-config.ts` |
| `src/lib/category-config.ts` | **CRIAR** - Categorias híbridas |
| `src/pages/super-admin/SuperAdminCondominiums.tsx` | Adicionar seletor de tipo |
| `src/pages/DashboardPage.tsx` | Ícones dinâmicos por tipo |
| `src/pages/CondoMembersPage.tsx` | Labels dinâmicos |
| `src/components/landing/Hero.tsx` | Mockup genérico |

---

## 7. Migração de Banco de Dados

```sql
-- 1. Criar enum de tipos
CREATE TYPE public.organization_type AS ENUM (
  'condominium', 'school', 'company', 'clinic', 
  'association', 'gym', 'church', 'club', 'other'
);

-- 2. Adicionar coluna na tabela condominiums
ALTER TABLE public.condominiums 
ADD COLUMN organization_type organization_type DEFAULT 'condominium';

-- 3. Tabela de templates de categorias (opcional para fase 2)
CREATE TABLE public.category_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  color_class TEXT NOT NULL,
  organization_types organization_type[] DEFAULT '{}',
  is_universal BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0
);

-- 4. Popular categorias universais
INSERT INTO public.category_templates (slug, label, icon_name, color_class, is_universal, display_order) VALUES
('informativo', 'Informativo', 'Info', 'bg-blue-100 text-blue-700', true, 1),
('financeiro', 'Financeiro', 'DollarSign', 'bg-emerald-100 text-emerald-700', true, 2),
('manutencao', 'Manutenção', 'Wrench', 'bg-orange-100 text-orange-700', true, 3),
('convivencia', 'Convivência', 'Users', 'bg-purple-100 text-purple-700', true, 4),
('seguranca', 'Segurança', 'Shield', 'bg-red-100 text-red-700', true, 5),
('urgente', 'Urgente', 'AlertTriangle', 'bg-red-500 text-white', true, 6);
```

---

## 8. Fases de Implementação

### Fase 1: Base Multi-Segmento
1. Migração do banco (enum + coluna)
2. Criar `organization-types.ts`
3. Atualizar Super Admin para permitir seleção de tipo
4. Atualizar Dashboard com ícones dinâmicos

### Fase 2: Terminologia Dinâmica
1. Hook `useOrganizationTerms(type)`
2. Atualizar páginas de membros
3. Atualizar formulários de criação

### Fase 3: Categorias por Segmento
1. Tabela `category_templates`
2. Popular categorias extras
3. Atualizar formulário de criação de avisos

---

## Resultado Esperado

- Super Admin pode criar organizações de qualquer tipo
- Cada tipo tem ícone visual distinto no dashboard
- Terminologia se adapta ao contexto (morador→aluno em escolas)
- Categorias base funcionam para todos + extras por segmento
- Sistema preparado para expansão comercial multi-vertical

