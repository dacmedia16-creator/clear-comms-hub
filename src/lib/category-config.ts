import { 
  Info, 
  DollarSign, 
  Wrench, 
  Users, 
  Shield, 
  AlertTriangle,
  Heart, 
  Clock, 
  Music, 
  HandHeart,
  Briefcase,
  FileCheck,
  Calendar,
  Store,
  BookOpen,
  GraduationCap,
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
  organizationTypes: OrganizationType[];
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
  
  // Healthcare (Clínicas e instituições de saúde)
  atendimento: {
    slug: "atendimento",
    label: "Atendimento",
    icon: Heart,
    bgClass: "bg-pink-100 text-pink-700",
    badgeClass: "bg-pink-100 text-pink-700 border-pink-200",
    isUniversal: false,
    organizationTypes: ["healthcare"],
  },
  horarios: {
    slug: "horarios",
    label: "Horários",
    icon: Clock,
    bgClass: "bg-teal-100 text-teal-700",
    badgeClass: "bg-teal-100 text-teal-700 border-teal-200",
    isUniversal: false,
    organizationTypes: ["healthcare"],
  },

  // Company (Empresas)
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

  // Church (Igrejas)
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

  // Franchise (Franquias)
  operacoes: {
    slug: "operacoes",
    label: "Operações",
    icon: Store,
    bgClass: "bg-cyan-100 text-cyan-700",
    badgeClass: "bg-cyan-100 text-cyan-700 border-cyan-200",
    isUniversal: false,
    organizationTypes: ["franchise"],
  },

  // School (Escolas e Cursos)
  academico: {
    slug: "academico",
    label: "Acadêmico",
    icon: BookOpen,
    bgClass: "bg-indigo-100 text-indigo-700",
    badgeClass: "bg-indigo-100 text-indigo-700 border-indigo-200",
    isUniversal: false,
    organizationTypes: ["school"],
  },
  pedagogico: {
    slug: "pedagogico",
    label: "Pedagógico",
    icon: GraduationCap,
    bgClass: "bg-lime-100 text-lime-700",
    badgeClass: "bg-lime-100 text-lime-700 border-lime-200",
    isUniversal: false,
    organizationTypes: ["school"],
  },

  // Eventos (compartilhado por vários tipos)
  eventos: {
    slug: "eventos",
    label: "Eventos",
    icon: Calendar,
    bgClass: "bg-fuchsia-100 text-fuchsia-700",
    badgeClass: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
    isUniversal: false,
    organizationTypes: ["company", "church", "community", "franchise", "school"],
  },
};

/**
 * Retorna as categorias disponíveis para um tipo de organização.
 * Inclui categorias universais + específicas do segmento.
 */
export function getCategoriesForOrganization(
  organizationType?: OrganizationType | string | null
): CategoryConfig[] {
  const type = organizationType || "condominium";
  
  return Object.values(CATEGORY_CONFIG).filter(
    (cat) => cat.isUniversal || cat.organizationTypes.includes(type as OrganizationType)
  );
}

/**
 * Retorna a configuração de uma categoria pelo slug.
 * Se não encontrar, retorna a categoria "informativo" como fallback.
 */
export function getCategoryConfig(slug: string): CategoryConfig {
  return CATEGORY_CONFIG[slug] || CATEGORY_CONFIG.informativo;
}

/**
 * Tipo para slugs de categoria válidos (inferido do CATEGORY_CONFIG)
 */
export type CategorySlug = keyof typeof CATEGORY_CONFIG;
