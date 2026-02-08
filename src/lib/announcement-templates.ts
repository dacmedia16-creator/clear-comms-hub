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
  school: [
    {
      id: "school-meeting",
      name: "Reunião de Pais",
      title: "Convocação para Reunião de Pais",
      summary: "Reunião para tratar do desempenho escolar.",
      content: `Prezados pais e responsáveis,

Convidamos para a reunião de pais:

📅 Data: [DATA]
🕐 Horário: [HORÁRIO]
📍 Local: [SALA/AUDITÓRIO]

Pauta:
• Desempenho acadêmico do bimestre
• Informes sobre atividades pedagógicas
• Calendário de provas

A presença é fundamental para o acompanhamento escolar do(a) aluno(a).

Atenciosamente,
Coordenação Pedagógica`,
      category: "pedagogico",
      isUrgent: false,
    },
    {
      id: "school-calendar",
      name: "Alteração de Calendário",
      title: "Alteração no Calendário Escolar",
      summary: "Mudança importante nas datas letivas.",
      content: `Prezados pais e responsáveis,

Informamos alteração no calendário escolar:

📅 [DESCRIÇÃO DA ALTERAÇÃO]

Motivo: [MOTIVO]

As aulas seguirão normalmente nos demais dias.

Qualquer dúvida, entre em contato com a secretaria.

Atenciosamente,
Direção`,
      category: "calendario",
      isUrgent: false,
    },
    {
      id: "school-event",
      name: "Evento Escolar",
      title: "Convite para Evento Escolar",
      summary: "Evento especial na escola.",
      content: `Prezados pais e alunos,

Convidamos para o evento:

🎉 [NOME DO EVENTO]
📅 Data: [DATA]
🕐 Horário: [HORÁRIO]
📍 Local: [LOCAL]

Descrição: [DESCRIÇÃO DO EVENTO]

Contamos com a presença de todos!

Atenciosamente,
Coordenação`,
      category: "eventos",
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
  ],
  clinic: [
    {
      id: "clinic-hours",
      name: "Alteração de Horário",
      title: "Alteração no Horário de Atendimento",
      summary: "Mudança nos horários da clínica.",
      content: `Prezados pacientes,

Informamos alteração no horário de atendimento:

📅 Data: [DATA]
🕐 Novo horário: [NOVO HORÁRIO]

Motivo: [MOTIVO]

Agendamentos marcados para este período serão remarcados.

Dúvidas: [TELEFONE/EMAIL]

Atenciosamente,
Clínica [NOME]`,
      category: "horarios",
      isUrgent: false,
    },
    {
      id: "clinic-campaign",
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
  ],
  gym: [
    {
      id: "gym-schedule",
      name: "Grade de Aulas",
      title: "Atualização na Grade de Aulas",
      summary: "Mudanças nos horários das modalidades.",
      content: `Prezados alunos,

Informamos alterações na grade de aulas:

📅 A partir de: [DATA]

Mudanças:
🏋️ [MODALIDADE 1]: [NOVO HORÁRIO]
🏋️ [MODALIDADE 2]: [NOVO HORÁRIO]

Dúvidas na recepção.

Bons treinos!
Equipe [NOME DA ACADEMIA]`,
      category: "horarios",
      isUrgent: false,
    },
    {
      id: "gym-maintenance",
      name: "Manutenção de Equipamentos",
      title: "Manutenção de Equipamentos",
      summary: "Equipamentos em manutenção temporária.",
      content: `Prezados alunos,

Informamos que os seguintes equipamentos estarão em manutenção:

🔧 Equipamentos: [LISTA]
📅 Período: [DATA INÍCIO] a [DATA FIM]

Alternativas disponíveis: [ALTERNATIVAS]

Agradecemos a compreensão.

Equipe [NOME DA ACADEMIA]`,
      category: "manutencao",
      isUrgent: false,
    },
    {
      id: "gym-event",
      name: "Desafio/Evento",
      title: "Desafio Fitness",
      summary: "Participe do nosso desafio especial!",
      content: `Prezados alunos,

Participe do nosso desafio:

🏆 [NOME DO DESAFIO]
📅 Período: [PERÍODO]
🎯 Objetivo: [OBJETIVO]
🎁 Prêmios: [PRÊMIOS]

Inscrições: [COMO SE INSCREVER]

Vamos juntos!
Equipe [NOME DA ACADEMIA]`,
      category: "treinos",
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
  association: [
    {
      id: "assoc-meeting",
      name: "Reunião de Associados",
      title: "Convocação para Reunião",
      summary: "Reunião geral dos associados.",
      content: `Prezados associados,

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
  ],
  club: [
    {
      id: "club-event",
      name: "Evento do Clube",
      title: "Evento Especial para Sócios",
      summary: "Atividade exclusiva para associados.",
      content: `Prezados sócios,

Convidamos para:

🎉 [NOME DO EVENTO]
📅 Data: [DATA]
🕐 Horário: [HORÁRIO]
📍 Local: [LOCAL]

Traga sua família!

Atenciosamente,
Diretoria Social`,
      category: "eventos",
      isUrgent: false,
    },
  ],
  other: [
    {
      id: "other-general",
      name: "Comunicado Geral",
      title: "Comunicado Importante",
      summary: "Informativo para todos os membros.",
      content: `Prezados membros,

Comunicamos:

[CONTEÚDO DO COMUNICADO]

Dúvidas, entre em contato.

Atenciosamente,
Administração`,
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
  const specificTemplates = templatesByType[type] || templatesByType.other;
  
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
