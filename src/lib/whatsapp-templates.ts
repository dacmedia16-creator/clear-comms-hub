// Template único aprovado pela Meta (categoria Utilidade)
// Variáveis: {nome}, {aviso}, {lembrete}
// Botão CTA dinâmico: "Ver detalhes" -> https://avisopro.com.br/c/{slug}

export const WHATSAPP_UNIVERSAL_TEMPLATE = `Olá {nome}, este é um aviso informativo importante.

{aviso}

Para mais informações, utilize o acesso indicado.
{lembrete}

Este é um comunicado padrão.`;

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
  baseUrl: string,
  recipientName?: string
): string {
  // Fallback: enquanto usa Zion Talk, inclui o link no corpo
  const timelineUrl = `${baseUrl}/c/${condominium.slug}`;
  const lembrete = announcement.summary || "Acesse o link para mais detalhes.";

  let message = WHATSAPP_UNIVERSAL_TEMPLATE
    .replace("{nome}", recipientName || "morador(a)")
    .replace("{aviso}", announcement.title)
    .replace("{lembrete}", lembrete);

  // Fallback: adiciona link no final enquanto não migra para API Meta com botão CTA
  message += `\n\n${timelineUrl}`;

  return message;
}
