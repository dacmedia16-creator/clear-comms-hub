import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Webhook {
  id: string;
  condominium_id: string;
  name: string;
  url: string;
  secret: string | null;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  response_status: number | null;
  response_body: string | null;
  sent_at: string;
  success: boolean;
}

export function useWebhooks(condominiumId: string | undefined) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWebhooks = useCallback(async () => {
    if (!condominiumId) return;

    try {
      const { data, error } = await supabase
        .from("webhooks")
        .select("*")
        .eq("condominium_id", condominiumId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebhooks((data as Webhook[]) || []);
    } catch (error: unknown) {
      console.error("Error fetching webhooks:", error);
      toast({
        title: "Erro ao carregar webhooks",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [condominiumId, toast]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const createWebhook = async (data: {
    name: string;
    url: string;
    secret?: string;
    events: string[];
  }) => {
    if (!condominiumId) return null;

    try {
      const { data: webhook, error } = await supabase
        .from("webhooks")
        .insert({
          condominium_id: condominiumId,
          name: data.name,
          url: data.url,
          secret: data.secret || null,
          events: data.events,
        })
        .select()
        .single();

      if (error) throw error;

      setWebhooks((prev) => [webhook as Webhook, ...prev]);
      toast({
        title: "Webhook criado",
        description: `O webhook "${data.name}" foi configurado com sucesso.`,
      });

      return webhook as Webhook;
    } catch (error: unknown) {
      console.error("Error creating webhook:", error);
      toast({
        title: "Erro ao criar webhook",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateWebhook = async (
    webhookId: string,
    data: Partial<Pick<Webhook, "name" | "url" | "secret" | "events" | "is_active">>
  ) => {
    try {
      const { error } = await supabase
        .from("webhooks")
        .update(data)
        .eq("id", webhookId);

      if (error) throw error;

      setWebhooks((prev) =>
        prev.map((w) => (w.id === webhookId ? { ...w, ...data } : w))
      );

      toast({
        title: "Webhook atualizado",
        description: "As alterações foram salvas.",
      });

      return true;
    } catch (error: unknown) {
      console.error("Error updating webhook:", error);
      toast({
        title: "Erro ao atualizar webhook",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    try {
      const { error } = await supabase
        .from("webhooks")
        .delete()
        .eq("id", webhookId);

      if (error) throw error;

      setWebhooks((prev) => prev.filter((w) => w.id !== webhookId));
      toast({
        title: "Webhook excluído",
        description: "O webhook foi removido.",
      });

      return true;
    } catch (error: unknown) {
      console.error("Error deleting webhook:", error);
      toast({
        title: "Erro ao excluir webhook",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleWebhook = async (webhookId: string, isActive: boolean) => {
    return updateWebhook(webhookId, { is_active: isActive });
  };

  const fetchWebhookLogs = async (webhookId: string): Promise<WebhookLog[]> => {
    try {
      const { data, error } = await supabase
        .from("webhook_logs")
        .select("*")
        .eq("webhook_id", webhookId)
        .order("sent_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data as WebhookLog[]) || [];
    } catch (error: unknown) {
      console.error("Error fetching webhook logs:", error);
      return [];
    }
  };

  return {
    webhooks,
    loading,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    toggleWebhook,
    fetchWebhookLogs,
    refetch: fetchWebhooks,
  };
}
