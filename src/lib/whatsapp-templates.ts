import { getCategoryConfig } from "./category-config";

// Templates padrão para categorias universais e específicas
export const WHATSAPP_TEMPLATES: Record<string, string> = {
  // Categorias universais
  informativo: `ℹ️ *AVISO - {nome_condo}*

📋 *{titulo}*

{resumo}

🔗 Acesse o aviso completo:
{link}`,

  financeiro: `💰 *AVISO FINANCEIRO - {nome_condo}*

📋 *{titulo}*

{resumo}

💵 Confira os detalhes:
{link}`,

  manutencao: `🔧 *AVISO DE MANUTENÇÃO - {nome_condo}*

📋 *{titulo}*

{resumo}

📍 Mais informações:
{link}`,

  convivencia: `🤝 *AVISO DE CONVIVÊNCIA - {nome_condo}*

📋 *{titulo}*

{resumo}

🏠 Leia mais:
{link}`,

  seguranca: `🔒 *AVISO DE SEGURANÇA - {nome_condo}*

📋 *{titulo}*

{resumo}

⚡ Veja o comunicado:
{link}`,

  urgente: `⚠️ *AVISO URGENTE - {nome_condo}*

📋 *{titulo}*

{resumo}

🚨 LEIA AGORA:
{link}`,

  // Categorias de Escola
  pedagogico: `📚 *AVISO PEDAGÓGICO - {nome_condo}*

📋 *{titulo}*

{resumo}

📖 Veja mais detalhes:
{link}`,

  calendario: `📅 *CALENDÁRIO - {nome_condo}*

📋 *{titulo}*

{resumo}

🗓️ Confira o calendário:
{link}`,

  // Categorias de Empresa
  rh: `💼 *AVISO DE RH - {nome_condo}*

📋 *{titulo}*

{resumo}

👔 Mais informações:
{link}`,

  compliance: `📋 *COMPLIANCE - {nome_condo}*

📋 *{titulo}*

{resumo}

✅ Leia o comunicado:
{link}`,

  // Categorias de Clínica
  atendimento: `❤️ *AVISO DE ATENDIMENTO - {nome_condo}*

📋 *{titulo}*

{resumo}

🏥 Mais informações:
{link}`,

  horarios: `⏰ *AVISO DE HORÁRIOS - {nome_condo}*

📋 *{titulo}*

{resumo}

🕐 Confira os horários:
{link}`,

  // Categorias de Academia
  treinos: `💪 *AVISO DE TREINOS - {nome_condo}*

📋 *{titulo}*

{resumo}

🏋️ Mais detalhes:
{link}`,

  // Categorias de Igreja
  cultos: `🙏 *AVISO DE CULTOS - {nome_condo}*

📋 *{titulo}*

{resumo}

⛪ Veja o comunicado:
{link}`,

  pastoral: `❤️ *PASTORAL - {nome_condo}*

📋 *{titulo}*

{resumo}

🤲 Mais informações:
{link}`,

  // Eventos (compartilhado)
  eventos: `🎉 *EVENTO - {nome_condo}*

📋 *{titulo}*

{resumo}

📌 Confira os detalhes:
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
