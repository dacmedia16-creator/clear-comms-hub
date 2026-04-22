import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AnnouncementForShare, CondominiumForShare } from "@/lib/whatsapp-templates";

interface SendResult {
  phone: string;
  name: string | null;
  success: boolean;
  error?: string;
}

interface SendWhatsAppResponse {
  total: number;
  sent: number;
  failed: number;
  results: SendResult[];
  message?: string;
  error?: string;
  status?: string;
  broadcast_id?: string;
  sender_id?: string | null;
  sender_name_snapshot?: string | null;
  sender_phone_snapshot?: string | null;
  template_id?: string | null;
  template_label_snapshot?: string | null;
  template_identifier_snapshot?: string | null;
}

interface AnnouncementWithTargeting extends AnnouncementForShare {
  id: string;
  target_blocks?: string[] | null;
  target_units?: string[] | null;
  target_member_ids?: string[] | null;
}

export function useSendWhatsApp() {
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<SendWhatsAppResponse | null>(null);
  const [lastBroadcastId, setLastBroadcastId] = useState<string | null>(null);

  const sendToMembers = async (
    announcement: AnnouncementWithTargeting,
    condominium: CondominiumForShare & { id: string },
    baseUrl: string,
    templateId?: string,
    senderId?: string
  ): Promise<SendWhatsAppResponse> => {
    setSending(true);
    setLastResult(null);
    setLastBroadcastId(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          announcement: {
            id: announcement.id,
            title: announcement.title,
            summary: announcement.summary,
            category: announcement.category,
            target_blocks: announcement.target_blocks || null,
            target_units: announcement.target_units || null,
            target_member_ids: announcement.target_member_ids || null,
          },
          condominium: {
            id: condominium.id,
            name: condominium.name,
            slug: condominium.slug,
          },
          baseUrl,
          senderId: senderId || undefined,
          templateId: templateId || undefined,
        },
      });

      if (error) {
        console.error("Error invoking send-whatsapp:", error);
        const errorResponse: SendWhatsAppResponse = {
          total: 0,
          sent: 0,
          failed: 0,
          results: [],
          error: error.message || "Erro ao enviar mensagens",
        };
        setLastResult(errorResponse);
        return errorResponse;
      }

      const result = data as SendWhatsAppResponse;
      setLastResult(result);
      if (result.broadcast_id) {
        setLastBroadcastId(result.broadcast_id);
      }
      return result;

    } catch (err) {
      console.error("Exception in sendToMembers:", err);
      const errorResponse: SendWhatsAppResponse = {
        total: 0,
        sent: 0,
        failed: 0,
        results: [],
        error: err instanceof Error ? err.message : "Erro desconhecido",
      };
      setLastResult(errorResponse);
      return errorResponse;
    } finally {
      setSending(false);
    }
  };

  return {
    sendToMembers,
    sending,
    lastResult,
    lastBroadcastId,
  };
}
