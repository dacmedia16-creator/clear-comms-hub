import { getCategoryConfig } from "./category-config";

// Templates padrão para categorias universais e específicas
export const WHATSAPP_TEMPLATES: Record<string, string> = {
  informativo: `Atualização confirmada - {nome_condo}

{titulo}

{resumo}

Deseja acessar os detalhes completos?
{link}`,

  financeiro: `Informação financeira atualizada - {nome_condo}

{titulo}

{resumo}

Deseja receber mais detalhes?
{link}`,

  manutencao: `Registro de manutenção confirmado - {nome_condo}

{titulo}

{resumo}

Precisa de mais informações?
{link}`,

  convivencia: `Comunicado registrado - {nome_condo}

{titulo}

{resumo}

Deseja acessar o comunicado completo?
{link}`,

  seguranca: `Atualização de segurança confirmada - {nome_condo}

{titulo}

{resumo}

Deseja ver os detalhes?
{link}`,

  urgente: `Atualização urgente confirmada - {nome_condo}

{titulo}

{resumo}

Acesse agora para mais informações:
{link}`,

  pedagogico: `Informação pedagógica atualizada - {nome_condo}

{titulo}

{resumo}

Deseja receber os detalhes?
{link}`,

  calendario: `Agenda confirmada - {nome_condo}

{titulo}

{resumo}

Deseja acessar o calendário completo?
{link}`,

  rh: `Comunicado de RH confirmado - {nome_condo}

{titulo}

{resumo}

Precisa de mais informações?
{link}`,

  compliance: `Atualização de compliance registrada - {nome_condo}

{titulo}

{resumo}

Deseja acessar o documento completo?
{link}`,

  atendimento: `Informação de atendimento confirmada - {nome_condo}

{titulo}

{resumo}

Deseja receber mais detalhes?
{link}`,

  horarios: `Horário atualizado - {nome_condo}

{titulo}

{resumo}

Deseja confirmar os horários?
{link}`,

  treinos: `Informação de treino atualizada - {nome_condo}

{titulo}

{resumo}

Deseja acessar os detalhes?
{link}`,

  cultos: `Programação confirmada - {nome_condo}

{titulo}

{resumo}

Deseja ver a programação completa?
{link}`,

  pastoral: `Comunicado pastoral registrado - {nome_condo}

{titulo}

{resumo}

Precisa de mais informações?
{link}`,

  eventos: `Evento confirmado - {nome_condo}

{titulo}

{resumo}

Deseja receber mais informações?
{link}`,
};

export interface AnnouncementForShare {
  title: string;
  summary: string | null;
  category: string;
}

export interface CondominiumForShare {
  name: string;
  slug: string;
}

export function generateWhatsAppMessage(
  announcement: AnnouncementForShare,
  condominium: CondominiumForShare,
  baseUrl: string
): string {
  // Usa template da categoria ou fallback para informativo
  const template = WHATSAPP_TEMPLATES[announcement.category] || WHATSAPP_TEMPLATES.informativo;
  const timelineUrl = `${baseUrl}/c/${condominium.slug}`;

  return template
    .replace("{nome_condo}", condominium.name)
    .replace("{titulo}", announcement.title)
    .replace("{resumo}", announcement.summary || "Acesse o link para mais detalhes.")
    .replace("{link}", timelineUrl);
}
