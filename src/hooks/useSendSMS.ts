import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SendResult {
  phone: string;
  name: string | null;
  success: boolean;
  error?: string;
}

interface SendSMSResponse {
  total: number;
  sent: number;
  failed: number;
  results: SendResult[];
  message?: string;
  error?: string;
}

interface AnnouncementForSMS {
  id: string;
  title: string;
  summary: string | null;
  category: string;
}

interface CondominiumForSMS {
  id: string;
  name: string;
  slug: string;
}

export function useSendSMS() {
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<SendSMSResponse | null>(null);

  const sendToMembers = async (
    announcement: AnnouncementForSMS,
    condominium: CondominiumForSMS,
    baseUrl: string
  ): Promise<SendSMSResponse> => {
    setSending(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          announcement: {
            id: announcement.id,
            title: announcement.title,
            summary: announcement.summary,
            category: announcement.category,
          },
          condominium: {
            id: condominium.id,
            name: condominium.name,
            slug: condominium.slug,
          },
          baseUrl,
        },
      });

      if (error) {
        console.error("Error invoking send-sms:", error);
        const errorResponse: SendSMSResponse = {
          total: 0,
          sent: 0,
          failed: 0,
          results: [],
          error: error.message || "Erro ao enviar SMS",
        };
        setLastResult(errorResponse);
        return errorResponse;
      }

      const result = data as SendSMSResponse;
      setLastResult(result);
      return result;

    } catch (err) {
      console.error("Exception in sendToMembers:", err);
      const errorResponse: SendSMSResponse = {
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
  };
}
