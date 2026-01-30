import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AnnouncementForEmail {
  id: string;
  title: string;
  summary: string | null;
  category: string;
}

interface CondominiumForEmail {
  id: string;
  name: string;
  slug: string;
}

interface SendEmailResponse {
  total: number;
  status?: string;
  message?: string;
  error?: string;
}

export function useSendEmail() {
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<SendEmailResponse | null>(null);

  const sendToMembers = async (
    announcement: AnnouncementForEmail,
    condominium: CondominiumForEmail,
    baseUrl: string
  ): Promise<SendEmailResponse> => {
    setSending(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
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
        console.error("Error invoking send-email:", error);
        const errorResponse: SendEmailResponse = {
          total: 0,
          error: error.message || "Erro ao enviar emails",
        };
        setLastResult(errorResponse);
        return errorResponse;
      }

      const result = data as SendEmailResponse;
      setLastResult(result);
      return result;

    } catch (err) {
      console.error("Exception in sendToMembers (email):", err);
      const errorResponse: SendEmailResponse = {
        total: 0,
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
