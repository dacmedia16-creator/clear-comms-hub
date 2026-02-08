import {
  Building2,
  Stethoscope,
  Briefcase,
  Users,
  Church,
  Store,
  LucideIcon,
} from "lucide-react";

export type OrganizationType =
  | "condominium"
  | "healthcare"
  | "company"
  | "community"
  | "church"
  | "franchise";

export interface OrganizationTerms {
  organization: string;
  organizationPlural: string;
  manager: string;
  member: string;
  memberPlural: string;
  block: string;
  blockPlural: string;
  unit: string;
  unitPlural: string;
}

export interface OrganizationBehavior {
  requiresLocation: boolean;
  blockValidation: "strict" | "flexible";
  unitValidation: "strict" | "flexible";
  showLocationInTimeline: boolean;
  showLocationTargeting: boolean;
}

export interface OrganizationTypeConfig {
  label: string;
  description: string;
  examples: string;
  icon: LucideIcon;
  terms: OrganizationTerms;
  behavior: OrganizationBehavior;
}

export const ORGANIZATION_TYPES: Record<OrganizationType, OrganizationTypeConfig> = {
  condominium: {
    label: "Condomínio",
    description: "Residenciais, comerciais e mistos",
    examples: "Prédios, vilas, loteamentos",
    icon: Building2,
    terms: {
      organization: "Condomínio",
      organizationPlural: "Condomínios",
      manager: "Síndico",
      member: "Morador",
      memberPlural: "Moradores",
      block: "Bloco",
      blockPlural: "Blocos",
      unit: "Unidade",
      unitPlural: "Unidades",
    },
    behavior: {
      requiresLocation: true,
      blockValidation: "strict",
      unitValidation: "strict",
      showLocationInTimeline: true,
      showLocationTargeting: true,
    },
  },
  healthcare: {
    label: "Clínicas e Saúde",
    description: "Hospitais, clínicas e consultórios",
    examples: "Clínicas, laboratórios, hospitais",
    icon: Stethoscope,
    terms: {
      organization: "Instituição",
      organizationPlural: "Instituições",
      manager: "Administrador",
      member: "Paciente",
      memberPlural: "Pacientes",
      block: "Setor",
      blockPlural: "Setores",
      unit: "Área",
      unitPlural: "Áreas",
    },
    behavior: {
      requiresLocation: false,
      blockValidation: "flexible",
      unitValidation: "flexible",
      showLocationInTimeline: false,
      showLocationTargeting: false,
    },
  },
  company: {
    label: "Empresas",
    description: "Equipes operacionais e corporativas",
    examples: "Fábricas, escritórios, times remotos",
    icon: Briefcase,
    terms: {
      organization: "Empresa",
      organizationPlural: "Empresas",
      manager: "Gestor",
      member: "Colaborador",
      memberPlural: "Colaboradores",
      block: "Departamento",
      blockPlural: "Departamentos",
      unit: "Cargo",
      unitPlural: "Cargos",
    },
    behavior: {
      requiresLocation: false,
      blockValidation: "flexible",
      unitValidation: "flexible",
      showLocationInTimeline: false,
      showLocationTargeting: false,
    },
  },
  community: {
    label: "Comunidades",
    description: "Associações, clubes e grupos",
    examples: "ONGs, clubes sociais, cooperativas",
    icon: Users,
    terms: {
      organization: "Comunidade",
      organizationPlural: "Comunidades",
      manager: "Presidente",
      member: "Membro",
      memberPlural: "Membros",
      block: "Grupo",
      blockPlural: "Grupos",
      unit: "Categoria",
      unitPlural: "Categorias",
    },
    behavior: {
      requiresLocation: false,
      blockValidation: "flexible",
      unitValidation: "flexible",
      showLocationInTimeline: false,
      showLocationTargeting: false,
    },
  },
  church: {
    label: "Igrejas",
    description: "Igrejas e instituições religiosas",
    examples: "Templos, paróquias, ministérios",
    icon: Church,
    terms: {
      organization: "Igreja",
      organizationPlural: "Igrejas",
      manager: "Pastor",
      member: "Membro",
      memberPlural: "Membros",
      block: "Ministério",
      blockPlural: "Ministérios",
      unit: "Grupo",
      unitPlural: "Grupos",
    },
    behavior: {
      requiresLocation: false,
      blockValidation: "flexible",
      unitValidation: "flexible",
      showLocationInTimeline: false,
      showLocationTargeting: false,
    },
  },
  franchise: {
    label: "Franquias",
    description: "Redes de lojas e franquias",
    examples: "Lojas, quiosques, unidades",
    icon: Store,
    terms: {
      organization: "Rede",
      organizationPlural: "Redes",
      manager: "Franqueador",
      member: "Franqueado",
      memberPlural: "Franqueados",
      block: "Região",
      blockPlural: "Regiões",
      unit: "Unidade",
      unitPlural: "Unidades",
    },
    behavior: {
      requiresLocation: true,
      blockValidation: "flexible",
      unitValidation: "flexible",
      showLocationInTimeline: true,
      showLocationTargeting: true,
    },
  },
};

// Helper to get organization config with fallback
export function getOrganizationConfig(type?: OrganizationType | string | null): OrganizationTypeConfig {
  if (!type || !(type in ORGANIZATION_TYPES)) {
    return ORGANIZATION_TYPES.condominium;
  }
  return ORGANIZATION_TYPES[type as OrganizationType];
}

// Helper to get icon component for a type
export function getOrganizationIcon(type?: OrganizationType | string | null): LucideIcon {
  return getOrganizationConfig(type).icon;
}

// Helper to get terms for a type
export function getOrganizationTerms(type?: OrganizationType | string | null): OrganizationTerms {
  return getOrganizationConfig(type).terms;
}

// Helper to get behavior for a type
export function getOrganizationBehavior(type?: OrganizationType | string | null): OrganizationBehavior {
  return getOrganizationConfig(type).behavior;
}

// List of all organization types for dropdowns
export const ORGANIZATION_TYPE_OPTIONS = Object.entries(ORGANIZATION_TYPES).map(([value, config]) => ({
  value: value as OrganizationType,
  label: config.label,
  description: config.description,
  examples: config.examples,
  icon: config.icon,
}));

// Helper to get role label dynamically based on organization terms
export function getRoleLabel(
  role: "admin" | "syndic" | "resident" | "collaborator",
  terms: OrganizationTerms
): string {
  const labels: Record<string, string> = {
    admin: "Administrador",
    syndic: terms.manager,
    resident: terms.member,
    collaborator: "Colaborador",
  };
  return labels[role] || role;
}

// Helper to get all role labels for a given organization
export function getRoleLabels(terms: OrganizationTerms): Record<string, string> {
  return {
    admin: "Administrador",
    syndic: terms.manager,
    resident: terms.member,
    collaborator: "Colaborador",
  };
}

// Helper to get placeholder examples for location fields
export function getLocationPlaceholders(type?: OrganizationType | string | null): {
  block: string;
  unit: string;
} {
  const placeholders: Record<OrganizationType, { block: string; unit: string }> = {
    condominium: { block: "A, B, 1, 2", unit: "101, 202" },
    company: { block: "Comercial, TI", unit: "Analista, Gerente" },
    healthcare: { block: "Cardiologia, UTI", unit: "Consultório 1" },
    church: { block: "Louvor, Jovens", unit: "Coral, Células" },
    community: { block: "Diretoria, Esportes", unit: "Presidente, Sócio" },
    franchise: { block: "Sul, Norte", unit: "Loja 01, Loja 02" },
  };
  
  const orgType = type && type in ORGANIZATION_TYPES ? type as OrganizationType : "condominium";
  return placeholders[orgType];
}
