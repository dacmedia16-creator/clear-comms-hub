import { AnnouncementCategory } from "./constants";

export const WHATSAPP_TEMPLATES: Record<AnnouncementCategory, string> = {
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
};

export interface AnnouncementForShare {
  title: string;
  summary: string | null;
  category: AnnouncementCategory;
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
  const template = WHATSAPP_TEMPLATES[announcement.category];
  const timelineUrl = `${baseUrl}/c/${condominium.slug}`;

  return template
    .replace("{nome_condo}", condominium.name)
    .replace("{titulo}", announcement.title)
    .replace("{resumo}", announcement.summary || "Acesse o link para mais detalhes.")
    .replace("{link}", timelineUrl);
}
