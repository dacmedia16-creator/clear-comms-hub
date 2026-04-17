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
  healthcare: {
    memberTitle: "Cadastro de Paciente",
    memberDescription: "Entre com o código da instituição para se cadastrar",
    unitLabel: "Setor e Área",
    unitPlaceholder: "ex: Cardiologia",
    codeLabel: "Código da Instituição",
    codeDescription: "Solicite à recepção",
    managerTitle: "Cadastro de Administrador",
    managerDescription: "Solicite acesso como administrador de uma instituição existente",
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
  community: {
    memberTitle: "Cadastro de Membro",
    memberDescription: "Entre com o código da sua comunidade para se cadastrar",
    unitLabel: "Grupo e Categoria",
    unitPlaceholder: "ex: Diretoria, Associado",
    codeLabel: "Código da Comunidade",
    codeDescription: "Solicite ao presidente",
    managerTitle: "Cadastro de Presidente",
    managerDescription: "Solicite acesso como presidente de uma comunidade existente",
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
  franchise: {
    memberTitle: "Cadastro de Franqueado",
    memberDescription: "Entre com o código da sua rede para se cadastrar",
    unitLabel: "Região e Unidade",
    unitPlaceholder: "ex: Sul, Loja 01",
    codeLabel: "Código da Rede",
    codeDescription: "Solicite ao franqueador",
    managerTitle: "Cadastro de Franqueador",
    managerDescription: "Solicite acesso como franqueador de uma rede existente",
  },
  school: {
    memberTitle: "Cadastro de Aluno/Responsável",
    memberDescription: "Entre com o código da sua escola para se cadastrar",
    unitLabel: "Série e Turma",
    unitPlaceholder: "ex: 3º Ano, Turma B",
    codeLabel: "Código da Escola",
    codeDescription: "Solicite à diretoria",
    managerTitle: "Cadastro de Diretor",
    managerDescription: "Solicite acesso como diretor de uma escola existente",
  },
  real_estate: {
    memberTitle: "Cadastro de Corretor",
    memberDescription: "Entre com o código da sua imobiliária para se cadastrar",
    unitLabel: "Equipe e Tipo",
    unitPlaceholder: "ex: Captação, Apartamento",
    codeLabel: "Código da Imobiliária",
    codeDescription: "Solicite ao diretor",
    managerTitle: "Cadastro de Diretor",
    managerDescription: "Solicite acesso como diretor de uma imobiliária existente",
  },
  generic: {
    memberTitle: "Cadastro de Membro",
    memberDescription: "Entre com o código da sua organização para se cadastrar",
    unitLabel: "Grupo e Categoria",
    unitPlaceholder: "ex: Grupo 1, Categoria A",
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
