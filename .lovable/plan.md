

# Plano de Expansão: AVISO PRO Multi-Segmento

## Visão Geral
Expandir o AVISO PRO para atender diferentes tipos de organizações além de condomínios.

---

## ✅ Fase 1: Infraestrutura Base (CONCLUÍDA)
- Campo `organization_type` na tabela `condominiums`
- Mapeamento de termos por tipo de organização
- Super Admin pode selecionar tipo ao criar organizações

## ✅ Fase 2: Terminologia Dinâmica (CONCLUÍDA)
- Hook `useOrganizationTerms` busca tipo e retorna termos
- Páginas de membros usam terminologia dinâmica
- Função `getRoleLabel()` para labels de funções

## ✅ Fase 3: Categorias Híbridas por Segmento (CONCLUÍDA)
- `CATEGORY_CONFIG` com categorias universais e específicas
- Enum `announcement_category` expandido com novos valores
- Hook `useCategoriesForOrganization` filtra categorias
- AdminCondominiumPage e TimelinePage usam categorias dinâmicas
- WhatsApp templates para novas categorias

---

## 🔜 Fase 4: Onboarding Dinâmico (Pendente)
- Fluxo de signup adaptado por tipo de organização
- Templates de blocos/unidades por segmento
- Passo de configuração inicial personalizado

## 🔜 Fase 5: Analytics e Relatórios (Pendente)
- Métricas específicas por segmento
- Dashboard personalizado por tipo

---

## Visão Geral

Criar um sistema de categorias híbridas onde existem categorias universais (disponíveis para todos os tipos de organização) e categorias específicas por segmento. Isso permitirá que escolas tenham categorias como "Pedagógico" e "Calendário Escolar", enquanto empresas terão "RH" e "Compliance".

---

## 1. Arquitetura Escolhida

### Abordagem: Constantes TypeScript + Lógica de Filtragem

Ao invés de criar uma tabela no banco de dados, vamos manter as categorias como constantes TypeScript (similar ao que já existe em `constants.ts`), mas com uma estrutura expandida que indica quais categorias são universais e quais são específicas por tipo de organização.

**Justificativa:**
- Mantém consistência com o enum `announcement_category` já existente no banco
- Evita complexidade de sincronização entre banco e frontend
- Permite adição rápida de categorias sem migrações SQL
- Mantém performance (sem queries extras)

---

## 2. Nova Estrutura de Categorias

### Arquivo: `src/lib/category-config.ts` (CRIAR)

```typescript
import { 
  Info, DollarSign, Wrench, Users, Shield, AlertTriangle,
  BookOpen, Calendar, GraduationCap, Briefcase, FileCheck,
  Heart, Clock, Megaphone, Dumbbell, Music, HandHeart,
  LucideIcon
} from "lucide-react";
import { OrganizationType } from "./organization-types";

export interface CategoryConfig {
  slug: string;
  label: string;
  icon: LucideIcon;
  bgClass: string;
  badgeClass: string;
  isUniversal: boolean;
  organizationTypes: OrganizationType[]; // vazio = universal
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  // === CATEGORIAS UNIVERSAIS ===
  informativo: {
    slug: "informativo",
    label: "Informativo",
    icon: Info,
    bgClass: "bg-blue-100 text-blue-700",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    isUniversal: true,
    organizationTypes: [],
  },
  financeiro: {
    slug: "financeiro",
    label: "Financeiro",
    icon: DollarSign,
    bgClass: "bg-emerald-100 text-emerald-700",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    isUniversal: true,
    organizationTypes: [],
  },
  manutencao: {
    slug: "manutencao",
    label: "Manutenção",
    icon: Wrench,
    bgClass: "bg-orange-100 text-orange-700",
    badgeClass: "bg-orange-100 text-orange-700 border-orange-200",
    isUniversal: true,
    organizationTypes: [],
  },
  convivencia: {
    slug: "convivencia",
    label: "Convivência",
    icon: Users,
    bgClass: "bg-purple-100 text-purple-700",
    badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
    isUniversal: true,
    organizationTypes: [],
  },
  seguranca: {
    slug: "seguranca",
    label: "Segurança",
    icon: Shield,
    bgClass: "bg-red-100 text-red-700",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    isUniversal: true,
    organizationTypes: [],
  },
  urgente: {
    slug: "urgente",
    label: "Urgente",
    icon: AlertTriangle,
    bgClass: "bg-red-500 text-white",
    badgeClass: "bg-red-500 text-white border-red-600",
    isUniversal: true,
    organizationTypes: [],
  },

  // === CATEGORIAS POR SEGMENTO ===
  
  // Escola
  pedagogico: {
    slug: "pedagogico",
    label: "Pedagógico",
    icon: BookOpen,
    bgClass: "bg-indigo-100 text-indigo-700",
    badgeClass: "bg-indigo-100 text-indigo-700 border-indigo-200",
    isUniversal: false,
    organizationTypes: ["school"],
  },
  calendario: {
    slug: "calendario",
    label: "Calendário",
    icon: Calendar,
    bgClass: "bg-cyan-100 text-cyan-700",
    badgeClass: "bg-cyan-100 text-cyan-700 border-cyan-200",
    isUniversal: false,
    organizationTypes: ["school"],
  },

  // Empresa
  rh: {
    slug: "rh",
    label: "RH",
    icon: Briefcase,
    bgClass: "bg-amber-100 text-amber-700",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    isUniversal: false,
    organizationTypes: ["company"],
  },
  compliance: {
    slug: "compliance",
    label: "Compliance",
    icon: FileCheck,
    bgClass: "bg-slate-100 text-slate-700",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    isUniversal: false,
    organizationTypes: ["company"],
  },

  // Clínica
  atendimento: {
    slug: "atendimento",
    label: "Atendimento",
    icon: Heart,
    bgClass: "bg-pink-100 text-pink-700",
    badgeClass: "bg-pink-100 text-pink-700 border-pink-200",
    isUniversal: false,
    organizationTypes: ["clinic"],
  },
  horarios: {
    slug: "horarios",
    label: "Horários",
    icon: Clock,
    bgClass: "bg-teal-100 text-teal-700",
    badgeClass: "bg-teal-100 text-teal-700 border-teal-200",
    isUniversal: false,
    organizationTypes: ["clinic", "gym"],
  },

  // Academia
  treinos: {
    slug: "treinos",
    label: "Treinos",
    icon: Dumbbell,
    bgClass: "bg-lime-100 text-lime-700",
    badgeClass: "bg-lime-100 text-lime-700 border-lime-200",
    isUniversal: false,
    organizationTypes: ["gym"],
  },

  // Igreja
  cultos: {
    slug: "cultos",
    label: "Cultos",
    icon: Music,
    bgClass: "bg-violet-100 text-violet-700",
    badgeClass: "bg-violet-100 text-violet-700 border-violet-200",
    isUniversal: false,
    organizationTypes: ["church"],
  },
  pastoral: {
    slug: "pastoral",
    label: "Pastoral",
    icon: HandHeart,
    bgClass: "bg-rose-100 text-rose-700",
    badgeClass: "bg-rose-100 text-rose-700 border-rose-200",
    isUniversal: false,
    organizationTypes: ["church"],
  },

  // Eventos (compartilhado)
  eventos: {
    slug: "eventos",
    label: "Eventos",
    icon: Calendar,
    bgClass: "bg-fuchsia-100 text-fuchsia-700",
    badgeClass: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
    isUniversal: false,
    organizationTypes: ["school", "company", "church", "club", "association"],
  },
};

// Helper: obter categorias disponíveis para um tipo de organização
export function getCategoriesForOrganization(
  organizationType?: OrganizationType | string | null
): CategoryConfig[] {
  const type = organizationType || "condominium";
  
  return Object.values(CATEGORY_CONFIG).filter(
    (cat) => cat.isUniversal || cat.organizationTypes.includes(type as OrganizationType)
  );
}

// Helper: obter categoria por slug com fallback
export function getCategoryConfig(slug: string): CategoryConfig {
  return CATEGORY_CONFIG[slug] || CATEGORY_CONFIG.informativo;
}
```

---

## 3. Migração do Banco de Dados

### Alterar o ENUM `announcement_category`

Adicionar os novos valores ao enum existente:

```sql
-- Adicionar novos valores ao enum announcement_category
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'pedagogico';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'calendario';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'rh';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'compliance';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'atendimento';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'horarios';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'treinos';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'cultos';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'pastoral';
ALTER TYPE public.announcement_category ADD VALUE IF NOT EXISTS 'eventos';
```

---

## 4. Hook: useCategoriesForOrganization

### Arquivo: `src/hooks/useCategoriesForOrganization.ts` (CRIAR)

```typescript
import { useMemo } from "react";
import { getCategoriesForOrganization, CategoryConfig } from "@/lib/category-config";
import { OrganizationType } from "@/lib/organization-types";

export function useCategoriesForOrganization(
  organizationType?: OrganizationType | string | null
): CategoryConfig[] {
  return useMemo(() => {
    return getCategoriesForOrganization(organizationType);
  }, [organizationType]);
}
```

---

## 5. Componentes e Páginas a Atualizar

### 5.1 AdminCondominiumPage.tsx

| Local | Atual | Novo |
|-------|-------|------|
| Select de categoria | `ANNOUNCEMENT_CATEGORIES` (fixo) | `useCategoriesForOrganization(orgType)` |
| Importação | `@/lib/constants` | `@/lib/category-config` |

**Mudança principal:**
```tsx
// Antes
{Object.entries(ANNOUNCEMENT_CATEGORIES).map(([key, cat]) => (
  <SelectItem key={key} value={key}>...</SelectItem>
))}

// Depois
const categories = useCategoriesForOrganization(organizationType);
{categories.map((cat) => (
  <SelectItem key={cat.slug} value={cat.slug}>
    <cat.icon className="w-4 h-4" />
    {cat.label}
  </SelectItem>
))}
```

### 5.2 TimelinePage.tsx

| Local | Atual | Novo |
|-------|-------|------|
| Filtro de categorias | `ANNOUNCEMENT_CATEGORIES` | `getCategoriesForOrganization(condoType)` |
| Exibição de badge | `ANNOUNCEMENT_CATEGORIES[category]` | `getCategoryConfig(category)` |

**Nota:** O TimelinePage precisa buscar o `organization_type` do condomínio para mostrar os filtros corretos.

### 5.3 DemoPage.tsx

Manter as categorias universais para a demo, já que é genérica.

### 5.4 constants.ts

Manter `ANNOUNCEMENT_CATEGORIES` para compatibilidade retroativa, mas marcar como deprecated com comentário apontando para `category-config.ts`.

---

## 6. Fluxo de Dados

```text
┌─────────────────────────────────────────────────────────────┐
│                    Criar Aviso                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuário acessa AdminCondominiumPage                      │
│                                                              │
│  2. Hook useOrganizationTerms busca organization_type        │
│     → "school"                                               │
│                                                              │
│  3. Hook useCategoriesForOrganization filtra categorias      │
│     → [informativo, financeiro, manutencao, convivencia,    │
│        seguranca, urgente, pedagogico, calendario, eventos]  │
│                                                              │
│  4. Select mostra apenas categorias disponíveis              │
│                                                              │
│  5. Usuário seleciona "pedagogico" e salva                   │
│                                                              │
│  6. Banco salva category = 'pedagogico'                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Timeline Pública                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuário acessa /timeline/escola-municipal-abc            │
│                                                              │
│  2. Busca condominium com organization_type = "school"       │
│                                                              │
│  3. getCategoriesForOrganization("school") retorna           │
│     categorias universais + escola                           │
│                                                              │
│  4. Filtros mostram: Todos | Informativo | Pedagógico |...   │
│                                                              │
│  5. getCategoryConfig(announcement.category) retorna         │
│     ícone e estilos corretos para cada aviso                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Categorias por Segmento (Resumo)

| Segmento | Categorias Extras |
|----------|-------------------|
| **Todos (Universal)** | Informativo, Financeiro, Manutenção, Convivência, Segurança, Urgente |
| **Escola** | Pedagógico, Calendário, Eventos |
| **Empresa** | RH, Compliance, Eventos |
| **Clínica** | Atendimento, Horários |
| **Academia** | Treinos, Horários |
| **Igreja** | Cultos, Pastoral, Eventos |
| **Clube** | Eventos |
| **Associação** | Eventos |

---

## 8. Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/lib/category-config.ts` | **CRIAR** | Nova estrutura de categorias híbridas |
| `src/hooks/useCategoriesForOrganization.ts` | **CRIAR** | Hook para obter categorias por tipo |
| `src/lib/constants.ts` | Atualizar | Adicionar comentário de deprecação |
| `src/pages/AdminCondominiumPage.tsx` | Atualizar | Usar hook de categorias dinâmicas |
| `src/pages/TimelinePage.tsx` | Atualizar | Filtros dinâmicos por org type |
| `supabase/migrations/` | **CRIAR** | Adicionar novos valores ao enum |

---

## 9. Ordem de Implementação

1. Criar migração SQL para adicionar novos valores ao enum
2. Criar `src/lib/category-config.ts` com estrutura completa
3. Criar `src/hooks/useCategoriesForOrganization.ts`
4. Atualizar `src/pages/AdminCondominiumPage.tsx` para usar categorias dinâmicas
5. Atualizar `src/pages/TimelinePage.tsx` para filtros dinâmicos
6. Atualizar `src/lib/constants.ts` com comentário de deprecação
7. Atualizar `src/pages/DemoPage.tsx` para usar nova estrutura (opcional)

---

## 10. Exemplo Visual

### Escola (organization_type = "school")

```
┌─────────────────────────────────────────┐
│ Criar Novo Aviso                        │
├─────────────────────────────────────────┤
│ Categoria *                             │
│ ┌─────────────────────────────────────┐ │
│ │ 📢 Informativo                   ▼ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Opções no dropdown:                     │
│ ├─ 📢 Informativo                       │
│ ├─ 💰 Financeiro                        │
│ ├─ 🔧 Manutenção                        │
│ ├─ 👥 Convivência                       │
│ ├─ 🛡️ Segurança                         │
│ ├─ ⚠️ Urgente                           │
│ ├─ 📚 Pedagógico      ← Específico      │
│ ├─ 📅 Calendário      ← Específico      │
│ └─ 🎉 Eventos         ← Específico      │
└─────────────────────────────────────────┘
```

### Condomínio (organization_type = "condominium")

```
┌─────────────────────────────────────────┐
│ Criar Novo Aviso                        │
├─────────────────────────────────────────┤
│ Categoria *                             │
│ ┌─────────────────────────────────────┐ │
│ │ 📢 Informativo                   ▼ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Opções no dropdown:                     │
│ ├─ 📢 Informativo                       │
│ ├─ 💰 Financeiro                        │
│ ├─ 🔧 Manutenção                        │
│ ├─ 👥 Convivência                       │
│ ├─ 🛡️ Segurança                         │
│ └─ ⚠️ Urgente                           │
│                                         │
│ (Apenas categorias universais)          │
└─────────────────────────────────────────┘
```

---

## Resultado Esperado

- Escolas verão categorias como "Pedagógico" e "Calendário"
- Empresas verão "RH" e "Compliance"
- Condomínios mantêm as 6 categorias originais
- Timeline pública mostra filtros adequados ao tipo
- Sistema extensível para adicionar novas categorias no futuro
- Compatibilidade total com avisos existentes

