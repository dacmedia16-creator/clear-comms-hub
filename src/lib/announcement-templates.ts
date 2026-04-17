import { OrganizationType } from "./organization-types";
import { CategorySlug } from "./category-config";

export interface AnnouncementTemplate {
  id: string;
  name: string;
  title: string;
  summary: string;
  content: string;
  category: CategorySlug;
  isUrgent: boolean;
}

// Templates específicos por tipo de organização
const templatesByType: Record<OrganizationType, AnnouncementTemplate[]> = {
  condominium: [
    {
      id: "condo-assembly",
      name: "Convocação de Assembleia",
      title: "Convocação para Assembleia Geral",
      summary: "Assembleia geral ordinária para deliberação de pautas importantes.",
      content: `Prezados moradores,

Convocamos todos para a Assembleia Geral que será realizada:

📅 Data: [DATA]
🕐 Horário: [HORÁRIO]
📍 Local: [LOCAL]

Pauta:
1. [PAUTA 1]
2. [PAUTA 2]
3. Assuntos gerais

A presença de todos é fundamental para as deliberações.

Atenciosamente,
Administração`,
      category: "informativo",
      isUrgent: false,
    },
    {
      id: "condo-maintenance",
      name: "Aviso de Manutenção",
      title: "Manutenção Programada",
      summary: "Serviço de manutenção agendado.",
      content: `Prezados moradores,

Informamos que será realizada manutenção:

🔧 Serviço: [TIPO DE MANUTENÇÃO]
📅 Data: [DATA]
🕐 Horário: [HORÁRIO INÍCIO] às [HORÁRIO FIM]
📍 Local afetado: [ÁREA]

⚠️ Durante este período, [IMPACTO DO SERVIÇO].

Pedimos a compreensão de todos.

Atenciosamente,
Administração`,
      category: "manutencao",
      isUrgent: false,
    },
    {
      id: "condo-payment",
      name: "Boleto Disponível",
      title: "Boleto do Condomínio Disponível",
      summary: "O boleto do mês já está disponível para pagamento.",
      content: `Prezados moradores,

Informamos que o boleto do condomínio referente ao mês de [MÊS/ANO] já está disponível.

💰 Valor: R$ [VALOR]
📅 Vencimento: [DATA DE VENCIMENTO]

O boleto foi enviado por e-mail e também está disponível no portal.

Evite multa e juros, pague em dia!

Atenciosamente,
Administração`,
      category: "financeiro",
      isUrgent: false,
    },
    {
      id: "condo-rules",
      name: "Lembrete de Regras",
      title: "Lembrete sobre Regras de Convivência",
      summary: "Reforço das normas do condomínio.",
      content: `Prezados moradores,

Reforçamos algumas regras importantes para a boa convivência:

📋 [REGRA 1]
📋 [REGRA 2]
📋 [REGRA 3]

O cumprimento das normas garante a harmonia de todos.

Em caso de dúvidas, consulte o Regulamento Interno ou entre em contato com a administração.

Atenciosamente,
Administração`,
      category: "convivencia",
      isUrgent: false,
    },
  ],
  healthcare: [
    {
      id: "health-hours",
      name: "Alteração de Horário",
      title: "Alteração no Horário de Atendimento",
      summary: "Mudança nos horários da instituição.",
      content: `Prezados pacientes,

Informamos alteração no horário de atendimento:

📅 Data: [DATA]
🕐 Novo horário: [NOVO HORÁRIO]

Motivo: [MOTIVO]

Agendamentos marcados para este período serão remarcados.

Dúvidas: [TELEFONE/EMAIL]

Atenciosamente,
Administração`,
      category: "horarios",
      isUrgent: false,
    },
    {
      id: "health-campaign",
      name: "Campanha de Saúde",
      title: "Campanha de Saúde",
      summary: "Ação de prevenção e cuidados.",
      content: `Prezados pacientes,

Convidamos para nossa campanha de saúde:

🏥 [NOME DA CAMPANHA]
📅 Período: [PERÍODO]
💉 Serviços: [SERVIÇOS OFERECIDOS]

Agende seu horário: [CONTATO]

Cuide da sua saúde!

Atenciosamente,
Equipe de Saúde`,
      category: "atendimento",
      isUrgent: false,
    },
    {
      id: "health-service",
      name: "Novo Serviço",
      title: "Novo Serviço Disponível",
      summary: "Nova especialidade ou exame disponível.",
      content: `Prezados pacientes,

Temos o prazer de anunciar um novo serviço:

🏥 [NOME DO SERVIÇO]
👨‍⚕️ Especialista: [NOME]
📅 Disponível a partir de: [DATA]

Agendamentos: [CONTATO]

Atenciosamente,
Administração`,
      category: "informativo",
      isUrgent: false,
    },
  ],
  company: [
    {
      id: "company-hr",
      name: "Comunicado de RH",
      title: "Comunicado do Departamento de RH",
      summary: "Informativo importante de Recursos Humanos.",
      content: `Prezados colaboradores,

Comunicamos:

📋 [ASSUNTO DO COMUNICADO]

Detalhes:
[DESCRIÇÃO DETALHADA]

Dúvidas devem ser direcionadas ao RH pelo e-mail [EMAIL] ou ramal [RAMAL].

Atenciosamente,
Departamento de Recursos Humanos`,
      category: "rh",
      isUrgent: false,
    },
    {
      id: "company-training",
      name: "Treinamento Obrigatório",
      title: "Convocação para Treinamento",
      summary: "Treinamento obrigatório para colaboradores.",
      content: `Prezados colaboradores,

Comunicamos a realização de treinamento obrigatório:

📚 Tema: [TEMA DO TREINAMENTO]
📅 Data: [DATA]
🕐 Horário: [HORÁRIO]
📍 Local: [LOCAL/LINK]

Público: [DEPARTAMENTOS/CARGOS]

A participação é obrigatória e será registrada.

Atenciosamente,
RH / Treinamento & Desenvolvimento`,
      category: "rh",
      isUrgent: false,
    },
    {
      id: "company-compliance",
      name: "Aviso de Compliance",
      title: "Comunicado de Compliance",
      summary: "Informativo sobre normas e políticas.",
      content: `Prezados colaboradores,

O departamento de Compliance informa:

📋 [ASSUNTO]

Norma/Política: [REFERÊNCIA]

Ação necessária: [O QUE DEVE SER FEITO]

Prazo: [PRAZO SE APLICÁVEL]

O cumprimento das normas é obrigatório.

Atenciosamente,
Departamento de Compliance`,
      category: "compliance",
      isUrgent: false,
    },
    {
      id: "company-event",
      name: "Evento Corporativo",
      title: "Convite para Evento",
      summary: "Evento da empresa.",
      content: `Prezados colaboradores,

Convidamos para:

🎉 [NOME DO EVENTO]
📅 Data: [DATA]
🕐 Horário: [HORÁRIO]
📍 Local: [LOCAL]

Descrição: [DESCRIÇÃO]

Contamos com sua presença!

Atenciosamente,
RH`,
      category: "eventos",
      isUrgent: false,
    },
  ],
  community: [
    {
      id: "community-meeting",
      name: "Reunião de Membros",
      title: "Convocação para Reunião",
      summary: "Reunião geral dos membros.",
      content: `Prezados membros,

Convocamos para reunião:

📅 Data: [DATA]
🕐 Horário: [HORÁRIO]
📍 Local: [LOCAL]

Pauta:
1. [PAUTA 1]
2. [PAUTA 2]
3. Assuntos gerais

Sua participação é importante!

Atenciosamente,
Diretoria`,
      category: "informativo",
      isUrgent: false,
    },
    {
      id: "community-event",
      name: "Evento da Comunidade",
      title: "Convite para Evento",
      summary: "Evento especial para membros.",
      content: `Prezados membros,

Convidamos você e sua família para:

🎉 [NOME DO EVENTO]
📅 Data: [DATA]
🕐 Horário: [HORÁRIO]
📍 Local: [LOCAL]

Contamos com sua presença!

Atenciosamente,
Diretoria`,
      category: "eventos",
      isUrgent: false,
    },
    {
      id: "community-payment",
      name: "Mensalidade/Anuidade",
      title: "Aviso de Mensalidade",
      summary: "Lembrete sobre pagamento da contribuição.",
      content: `Prezados membros,

Lembramos que a contribuição referente a [MÊS/ANO] está disponível para pagamento:

💰 Valor: R$ [VALOR]
📅 Vencimento: [DATA]
🏦 Formas de pagamento: [FORMAS]

Membros em dia têm acesso a todos os benefícios.

Dúvidas: [CONTATO]

Atenciosamente,
Tesouraria`,
      category: "financeiro",
      isUrgent: false,
    },
  ],
  church: [
    {
      id: "church-worship",
      name: "Programação de Cultos",
      title: "Programação Especial de Cultos",
      summary: "Horários e temas dos cultos.",
      content: `Queridos irmãos,

Confira a programação especial:

⛪ [DIA/DATA]: [TEMA] - [HORÁRIO]
⛪ [DIA/DATA]: [TEMA] - [HORÁRIO]

Pregador(es): [NOME]

Venha adorar conosco!

Com amor,
Liderança da Igreja`,
      category: "cultos",
      isUrgent: false,
    },
    {
      id: "church-event",
      name: "Evento da Igreja",
      title: "Convite Especial",
      summary: "Evento especial na igreja.",
      content: `Queridos irmãos,

Convidamos para:

🎉 [NOME DO EVENTO]
📅 Data: [DATA]
🕐 Horário: [HORÁRIO]
📍 Local: [LOCAL]

[DESCRIÇÃO]

Traga sua família e amigos!

Com amor,
Liderança da Igreja`,
      category: "eventos",
      isUrgent: false,
    },
    {
      id: "church-pastoral",
      name: "Comunicado Pastoral",
      title: "Palavra da Liderança",
      summary: "Mensagem da liderança pastoral.",
      content: `Queridos irmãos,

[MENSAGEM PASTORAL]

Que Deus abençoe a todos.

Com amor em Cristo,
[NOME DO PASTOR/LÍDER]`,
      category: "pastoral",
      isUrgent: false,
    },
  ],
  franchise: [
    {
      id: "franchise-operations",
      name: "Comunicado Operacional",
      title: "Comunicado da Matriz",
      summary: "Aviso operacional para todas as unidades.",
      content: `Prezados franqueados,

Comunicamos:

📋 [ASSUNTO]

Detalhes:
[DESCRIÇÃO]

Ação necessária: [O QUE DEVE SER FEITO]
Prazo: [PRAZO]

Dúvidas: [CONTATO]

Atenciosamente,
Matriz`,
      category: "operacoes",
      isUrgent: false,
    },
    {
      id: "franchise-promo",
      name: "Campanha Promocional",
      title: "Nova Campanha Promocional",
      summary: "Campanha de marketing para a rede.",
      content: `Prezados franqueados,

Lançamos nova campanha promocional:

🎯 [NOME DA CAMPANHA]
📅 Período: [DATA INÍCIO] a [DATA FIM]
💰 Desconto/Oferta: [DETALHES]

Materiais de apoio: [LINK/INSTRUÇÕES]

Dúvidas com o marketing: [CONTATO]

Atenciosamente,
Departamento de Marketing`,
      category: "operacoes",
      isUrgent: false,
    },
    {
      id: "franchise-training",
      name: "Treinamento da Rede",
      title: "Treinamento Obrigatório",
      summary: "Capacitação para franqueados e equipes.",
      content: `Prezados franqueados,

Comunicamos treinamento obrigatório:

📚 Tema: [TEMA]
📅 Data: [DATA]
🕐 Horário: [HORÁRIO]
📍 Local: [LOCAL/LINK]

Público-alvo: [QUEM DEVE PARTICIPAR]

A participação é obrigatória.

Atenciosamente,
Departamento de Treinamento`,
      category: "eventos",
      isUrgent: false,
    },
    {
      id: "franchise-event",
      name: "Convenção/Evento",
      title: "Convenção da Rede",
      summary: "Evento para franqueados.",
      content: `Prezados franqueados,

Convidamos para:

🎉 [NOME DO EVENTO]
📅 Data: [DATA]
🕐 Horário: [HORÁRIO]
📍 Local: [LOCAL]

Programação:
• [ATIVIDADE 1]
• [ATIVIDADE 2]

Inscrições: [COMO SE INSCREVER]

Atenciosamente,
Matriz`,
      category: "eventos",
      isUrgent: false,
    },
  ],
  school: [
    {
      id: "school-parents-meeting",
      name: "Reunião de Pais",
      title: "Convocação para Reunião de Pais",
      summary: "Reunião de pais e responsáveis para tratar de assuntos pedagógicos.",
      content: `Prezados pais e responsáveis,

Convocamos para a reunião de pais:

📅 Data: [DATA]
🕐 Horário: [HORÁRIO]
📍 Local: [LOCAL]

Pauta:
1. [PAUTA 1]
2. [PAUTA 2]
3. Assuntos gerais

A presença é fundamental para o acompanhamento escolar.

Atenciosamente,
Diretoria`,
      category: "pedagogico",
      isUrgent: false,
    },
    {
      id: "school-calendar",
      name: "Calendário Escolar",
      title: "Atualização do Calendário Escolar",
      summary: "Datas importantes e alterações no calendário.",
      content: `Prezados pais e alunos,

Informamos sobre o calendário escolar:

📅 [DATA/PERÍODO]: [EVENTO]
📅 [DATA/PERÍODO]: [EVENTO]

⚠️ Observações: [OBSERVAÇÕES]

Dúvidas: [CONTATO]

Atenciosamente,
Secretaria Escolar`,
      category: "academico",
      isUrgent: false,
    },
    {
      id: "school-announcement",
      name: "Comunicado da Diretoria",
      title: "Comunicado da Diretoria",
      summary: "Informativo oficial da diretoria escolar.",
      content: `Prezados pais, alunos e colaboradores,

Comunicamos:

📋 [ASSUNTO]

Detalhes:
[DESCRIÇÃO]

Dúvidas: [CONTATO]

Atenciosamente,
Diretoria`,
      category: "informativo",
      isUrgent: false,
    },
  ],
  real_estate: [
    {
      id: "real-estate-new-property",
      name: "Anúncio de Novo Imóvel",
      title: "Novo imóvel disponível",
      summary: "Confira o imóvel recém-captado.",
      content: `Olá,

Acabamos de captar um novo imóvel:

🏠 [TIPO] em [BAIRRO/CIDADE]
🛏 [QUARTOS] quartos | 🛁 [BANHEIROS] banheiros | 🚗 [VAGAS]
📐 [ÁREA] m² | 💰 R$ [PREÇO]

Quer agendar uma visita? Responda esta mensagem.

Atenciosamente,
[CORRETOR RESPONSÁVEL]`,
      category: "informativo",
      isUrgent: false,
    },
    {
      id: "real-estate-broker-onboarding",
      name: "Boas-vindas ao Corretor",
      title: "Bem-vindo(a) à imobiliária!",
      summary: "Mensagem de boas-vindas para corretores aprovados.",
      content: `Olá [NOME],

Seja muito bem-vindo(a) à nossa equipe!

📋 Próximos passos:
1. [PASSO 1]
2. [PASSO 2]
3. [PASSO 3]

Qualquer dúvida, fale com a Direção.

Boas captações!`,
      category: "informativo",
      isUrgent: false,
    },
    {
      id: "real-estate-followup",
      name: "Follow-up de Captação",
      title: "Continuamos interessados no seu imóvel",
      summary: "Mensagem de follow-up para proprietários.",
      content: `Olá [PROPRIETÁRIO],

Tudo bem? Aqui é da [IMOBILIÁRIA].

Continuamos interessados em captar seu imóvel em [BAIRRO]. Podemos conversar essa semana?

Aguardo seu retorno.`,
      category: "informativo",
      isUrgent: false,
    },
  ],
  generic: [
    {
      id: "generic-general",
      name: "Comunicado Geral",
      title: "Comunicado Geral",
      summary: "Comunicado para todos os membros da organização.",
      content: `Prezados membros,

Informamos que [ASSUNTO].

Detalhes:
[DESCRIÇÃO]

Dúvidas: [CONTATO]

Atenciosamente,
Gestão`,
      category: "informativo",
      isUrgent: false,
    },
  ],
};

// Templates universais disponíveis para todos
const universalTemplates: AnnouncementTemplate[] = [
  {
    id: "universal-urgent",
    name: "Aviso Urgente",
    title: "⚠️ AVISO URGENTE",
    summary: "Comunicado urgente que requer atenção imediata.",
    content: `⚠️ ATENÇÃO

[DESCRIÇÃO DO ASSUNTO URGENTE]

Ação necessária: [O QUE DEVE SER FEITO]

Em caso de dúvidas, entre em contato imediatamente.

Administração`,
    category: "urgente",
    isUrgent: true,
  },
  {
    id: "universal-security",
    name: "Aviso de Segurança",
    title: "Aviso de Segurança",
    summary: "Comunicado relacionado à segurança.",
    content: `Prezados,

Informamos sobre questão de segurança:

🔒 [DESCRIÇÃO]

Recomendações:
• [RECOMENDAÇÃO 1]
• [RECOMENDAÇÃO 2]

Qualquer situação suspeita, comunique imediatamente.

Atenciosamente,
Administração`,
    category: "seguranca",
    isUrgent: false,
  },
];

/**
 * Retorna os templates disponíveis para um tipo de organização
 * Inclui templates específicos + universais
 */
export function getAnnouncementTemplates(
  organizationType?: OrganizationType | string | null
): AnnouncementTemplate[] {
  const type = (organizationType as OrganizationType) || "condominium";
  const specificTemplates = templatesByType[type] || templatesByType.condominium;
  
  return [...specificTemplates, ...universalTemplates];
}

/**
 * Busca um template específico por ID
 */
export function getTemplateById(
  templateId: string,
  organizationType?: OrganizationType | string | null
): AnnouncementTemplate | undefined {
  const templates = getAnnouncementTemplates(organizationType);
  return templates.find((t) => t.id === templateId);
}
