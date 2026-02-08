import { OrganizationType, OrganizationTerms } from "./organization-types";

export interface SignupFormConfig {
  // Member form
  memberTitle: string;
  memberDescription: string;
  unitLabel: string;
  unitPlaceholder: string;
  codeLabel: string;
  codeDescription: string;
  memberSuccessMessage: (orgName: string, managerTerm: string) => string;

  // Manager form
  managerTitle: string;
  managerDescription: string;
  managerSuccessMessage: string;
}

const configMap: Record<OrganizationType, Partial<SignupFormConfig>> = {
  condominium: {
    memberTitle: "Cadastro de Morador",
    memberDescription: "Entre com o código do seu condomínio para se cadastrar",
    unitLabel: "Bloco e Unidade",
    unitPlaceholder: "ex: Bloco A, Apto 101",
    codeLabel: "Código do Condomínio",
    codeDescription: "Solicite ao seu síndico",
    managerTitle: "Cadastro de Síndico",
    managerDescription: "Solicite acesso como síndico de um condomínio existente",
  },
  school: {
    memberTitle: "Cadastro de Aluno",
    memberDescription: "Entre com o código da sua escola para se cadastrar",
    unitLabel: "Série e Turma",
    unitPlaceholder: "ex: 9º Ano, Turma A",
    codeLabel: "Código da Escola",
    codeDescription: "Solicite à direção da escola",
    managerTitle: "Cadastro de Diretor",
    managerDescription: "Solicite acesso como diretor de uma escola existente",
  },
  company: {
    memberTitle: "Cadastro de Colaborador",
    memberDescription: "Entre com o código da sua empresa para se cadastrar",
    unitLabel: "Departamento e Cargo",
    unitPlaceholder: "ex: TI, Analista",
    codeLabel: "Código da Empresa",
    codeDescription: "Solicite ao seu gestor",
    managerTitle: "Cadastro de Gestor",
    managerDescription: "Solicite acesso como gestor de uma empresa existente",
  },
  clinic: {
    memberTitle: "Cadastro de Paciente",
    memberDescription: "Entre com o código da clínica para se cadastrar",
    unitLabel: "Setor e Área",
    unitPlaceholder: "ex: Cardiologia",
    codeLabel: "Código da Clínica",
    codeDescription: "Solicite à recepção",
    managerTitle: "Cadastro de Administrador",
    managerDescription: "Solicite acesso como administrador de uma clínica existente",
  },
  association: {
    memberTitle: "Cadastro de Associado",
    memberDescription: "Entre com o código da associação para se cadastrar",
    unitLabel: "Núcleo e Categoria",
    unitPlaceholder: "ex: Núcleo Central",
    codeLabel: "Código da Associação",
    codeDescription: "Solicite ao presidente",
    managerTitle: "Cadastro de Presidente",
    managerDescription: "Solicite acesso como presidente de uma associação existente",
  },
  gym: {
    memberTitle: "Cadastro de Aluno",
    memberDescription: "Entre com o código da sua academia para se cadastrar",
    unitLabel: "Turma e Modalidade",
    unitPlaceholder: "ex: Manhã, Musculação",
    codeLabel: "Código da Academia",
    codeDescription: "Solicite na recepção",
    managerTitle: "Cadastro de Proprietário",
    managerDescription: "Solicite acesso como proprietário de uma academia existente",
  },
  church: {
    memberTitle: "Cadastro de Membro",
    memberDescription: "Entre com o código da sua igreja para se cadastrar",
    unitLabel: "Ministério e Grupo",
    unitPlaceholder: "ex: Louvor, Coral",
    codeLabel: "Código da Igreja",
    codeDescription: "Solicite ao pastor",
    managerTitle: "Cadastro de Pastor",
    managerDescription: "Solicite acesso como pastor de uma igreja existente",
  },
  club: {
    memberTitle: "Cadastro de Sócio",
    memberDescription: "Entre com o código do seu clube para se cadastrar",
    unitLabel: "Categoria e Título",
    unitPlaceholder: "ex: Titular, Proprietário",
    codeLabel: "Código do Clube",
    codeDescription: "Solicite na secretaria",
    managerTitle: "Cadastro de Presidente",
    managerDescription: "Solicite acesso como presidente de um clube existente",
  },
  other: {
    memberTitle: "Cadastro de Membro",
    memberDescription: "Entre com o código da sua organização para se cadastrar",
    unitLabel: "Grupo e Subgrupo",
    unitPlaceholder: "ex: Grupo A",
    codeLabel: "Código da Organização",
    codeDescription: "Solicite ao gestor",
    managerTitle: "Cadastro de Gestor",
    managerDescription: "Solicite acesso como gestor de uma organização existente",
  },
};

const defaultConfig: SignupFormConfig = {
  memberTitle: "Cadastro de Membro",
  memberDescription: "Entre com o código da sua organização para se cadastrar",
  unitLabel: "Localização",
  unitPlaceholder: "ex: Bloco A, Sala 101",
  codeLabel: "Código da Organização",
  codeDescription: "Solicite ao gestor",
  memberSuccessMessage: (orgName, managerTerm) =>
    `Aguarde a aprovação do ${managerTerm.toLowerCase()} de ${orgName} para acessar.`,
  managerTitle: "Cadastro de Gestor",
  managerDescription: "Solicite acesso como gestor de uma organização existente",
  managerSuccessMessage: "Seu cadastro será analisado pelo administrador.",
};

export function getSignupFormConfig(
  type?: OrganizationType | string | null,
  terms?: OrganizationTerms
): SignupFormConfig {
  const orgType = (type as OrganizationType) || "condominium";
  const specific = configMap[orgType] || {};

  return {
    ...defaultConfig,
    ...specific,
    memberSuccessMessage: (orgName: string, managerTerm: string) =>
      `Aguarde a aprovação do ${managerTerm.toLowerCase()} de ${orgName} para acessar.`,
  };
}
