import {
  Building2,
  GraduationCap,
  Briefcase,
  Stethoscope,
  Dumbbell,
  Church,
  Users,
  Landmark,
  HelpCircle,
  LucideIcon,
} from "lucide-react";

export type OrganizationType =
  | "condominium"
  | "school"
  | "company"
  | "clinic"
  | "association"
  | "gym"
  | "church"
  | "club"
  | "other";

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

export interface OrganizationTypeConfig {
  label: string;
  icon: LucideIcon;
  terms: OrganizationTerms;
}

export const ORGANIZATION_TYPES: Record<OrganizationType, OrganizationTypeConfig> = {
  condominium: {
    label: "Condomínio",
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
  },
  school: {
    label: "Escola",
    icon: GraduationCap,
    terms: {
      organization: "Escola",
      organizationPlural: "Escolas",
      manager: "Diretor",
      member: "Aluno",
      memberPlural: "Alunos",
      block: "Série",
      blockPlural: "Séries",
      unit: "Turma",
      unitPlural: "Turmas",
    },
  },
  company: {
    label: "Empresa",
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
  },
  clinic: {
    label: "Clínica",
    icon: Stethoscope,
    terms: {
      organization: "Clínica",
      organizationPlural: "Clínicas",
      manager: "Administrador",
      member: "Paciente",
      memberPlural: "Pacientes",
      block: "Setor",
      blockPlural: "Setores",
      unit: "Área",
      unitPlural: "Áreas",
    },
  },
  association: {
    label: "Associação",
    icon: Users,
    terms: {
      organization: "Associação",
      organizationPlural: "Associações",
      manager: "Presidente",
      member: "Associado",
      memberPlural: "Associados",
      block: "Núcleo",
      blockPlural: "Núcleos",
      unit: "Categoria",
      unitPlural: "Categorias",
    },
  },
  gym: {
    label: "Academia",
    icon: Dumbbell,
    terms: {
      organization: "Academia",
      organizationPlural: "Academias",
      manager: "Proprietário",
      member: "Aluno",
      memberPlural: "Alunos",
      block: "Turma",
      blockPlural: "Turmas",
      unit: "Modalidade",
      unitPlural: "Modalidades",
    },
  },
  church: {
    label: "Igreja",
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
  },
  club: {
    label: "Clube",
    icon: Landmark,
    terms: {
      organization: "Clube",
      organizationPlural: "Clubes",
      manager: "Presidente",
      member: "Sócio",
      memberPlural: "Sócios",
      block: "Categoria",
      blockPlural: "Categorias",
      unit: "Título",
      unitPlural: "Títulos",
    },
  },
  other: {
    label: "Outros",
    icon: HelpCircle,
    terms: {
      organization: "Organização",
      organizationPlural: "Organizações",
      manager: "Gestor",
      member: "Membro",
      memberPlural: "Membros",
      block: "Grupo",
      blockPlural: "Grupos",
      unit: "Subgrupo",
      unitPlural: "Subgrupos",
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

// List of all organization types for dropdowns
export const ORGANIZATION_TYPE_OPTIONS = Object.entries(ORGANIZATION_TYPES).map(([value, config]) => ({
  value: value as OrganizationType,
  label: config.label,
  icon: config.icon,
}));
