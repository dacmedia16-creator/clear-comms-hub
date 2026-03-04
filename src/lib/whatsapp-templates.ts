// Template aprovado pela Meta (categoria Utilidade)
// Gerenciado na Meta Business Suite — as Edge Functions enviam via send_template_message
// Esta constante é usada apenas para preview local (mostrar ao gestor como ficará a mensagem)

export const TEMPLATE_IDENTIFIER = 'aviso_pro_confirma_3';
export const VIP7_TEMPLATE_IDENTIFIER = 'vip7_captacao';
export const VIP7_2_TEMPLATE_IDENTIFIER = 'vip7_captacao2';
export const VIP7_3_TEMPLATE_IDENTIFIER = 'vip7_captacao3';
export const VISITA3_TEMPLATE_IDENTIFIER = 'visita_prova_envio3';
export const VISITA4_TEMPLATE_IDENTIFIER = 'visita_prova_envio4';
export const TEMPLATE_LANGUAGE = 'pt_BR';

// Preview text — simula o template da Meta para exibição local
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

/**
 * Gera preview local da mensagem (para exibir ao gestor antes do envio).
 * O envio real usa send_template_message com bodyParams.
 */
export function generateWhatsAppMessage(
  announcement: AnnouncementForShare,
  condominium: CondominiumForShare,
  baseUrl: string,
  recipientName?: string
): string {
  const timelineUrl = `${baseUrl}/c/${condominium.slug}`;
  const lembrete = announcement.summary || "Acesse o link para mais detalhes.";

  let message = WHATSAPP_UNIVERSAL_TEMPLATE
    .replace("{nome}", recipientName || "morador(a)")
    .replace("{aviso}", announcement.title)
    .replace("{lembrete}", lembrete);

  message += `\n\n${timelineUrl}`;

  return message;
}
