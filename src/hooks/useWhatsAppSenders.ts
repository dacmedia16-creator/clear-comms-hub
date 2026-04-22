import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface EnvKeyStatus {
  hasEnvKey: boolean;
  loading: boolean;
}

export interface WhatsAppSender {
  id: string;
  name: string;
  phone: string;
  api_key: string;
  is_active: boolean;
  is_default: boolean;
  template_identifier: string | null;
  button_config: string;
  has_nome_param: boolean;
  default_template_identifier?: string | null;
  default_template_label?: string | null;
  default_template_button_config?: string | null;
  default_template_has_nome_param?: boolean | null;
  effective_template_identifier?: string | null;
  effective_button_config?: string;
  effective_has_nome_param?: boolean;
  effective_config_source?: "template" | "sender";
  created_at: string;
  updated_at: string;
}

export interface CreateWhatsAppSender {
  name: string;
  phone: string;
  api_key: string;
  is_active?: boolean;
  is_default?: boolean;
  template_identifier?: string | null;
  button_config?: string;
  has_nome_param?: boolean;
}

export function useWhatsAppSenders() {
  const [senders, setSenders] = useState<WhatsAppSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [envKeyStatus, setEnvKeyStatus] = useState<EnvKeyStatus>({ hasEnvKey: false, loading: true });

  const fetchSenders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("whatsapp_senders")
        .select("*")
        .order("is_default", { ascending: false })
        .order("name");

      if (error) throw error;

      const baseSenders = (data as unknown as WhatsAppSender[]) || [];

      if (baseSenders.length === 0) {
        setSenders([]);
        return;
      }

      const senderIds = baseSenders.map((sender) => sender.id);
      const { data: defaultTemplates, error: templatesError } = await supabase
        .from("whatsapp_sender_templates")
        .select("sender_id, identifier, label, button_config, has_nome_param")
        .in("sender_id", senderIds)
        .eq("is_default", true);

      if (templatesError) throw templatesError;

      const templateMap = new Map(
        (defaultTemplates || []).map((template) => [template.sender_id, template])
      );

      setSenders(
        baseSenders.map((sender) => {
          const defaultTemplate = templateMap.get(sender.id);
          const hasDefaultTemplate = Boolean(defaultTemplate);
          return {
            ...sender,
            default_template_identifier: defaultTemplate?.identifier ?? null,
            default_template_label: defaultTemplate?.label ?? null,
            default_template_button_config: defaultTemplate?.button_config ?? null,
            default_template_has_nome_param: defaultTemplate?.has_nome_param ?? null,
            effective_template_identifier: defaultTemplate?.identifier ?? sender.template_identifier ?? null,
            effective_button_config: defaultTemplate?.button_config ?? sender.button_config ?? "two_buttons",
            effective_has_nome_param: defaultTemplate?.has_nome_param ?? sender.has_nome_param ?? true,
            effective_config_source: hasDefaultTemplate ? "template" : "sender",
          };
        })
      );
    } catch (error) {
      console.error("Error fetching WhatsApp senders:", error);
      toast({
        title: "Erro ao carregar números",
        description: "Não foi possível carregar os números de WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createSender = async (sender: CreateWhatsAppSender): Promise<boolean> => {
    try {
      // If setting as default, unset others first
      if (sender.is_default) {
        await supabase
          .from("whatsapp_senders")
          .update({ is_default: false })
          .eq("is_default", true);
      }

      const { error } = await supabase.from("whatsapp_senders").insert({
        name: sender.name,
        phone: sender.phone,
        api_key: sender.api_key,
        is_active: sender.is_active ?? true,
        is_default: sender.is_default ?? false,
        template_identifier: sender.template_identifier ?? null,
        button_config: sender.button_config ?? "two_buttons",
        has_nome_param: sender.has_nome_param ?? true,
      });

      if (error) throw error;

      toast({
        title: "Número adicionado",
        description: "O número de WhatsApp foi adicionado com sucesso.",
      });

      await fetchSenders();
      return true;
    } catch (error) {
      console.error("Error creating WhatsApp sender:", error);
      toast({
        title: "Erro ao adicionar número",
        description: "Não foi possível adicionar o número. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateSender = async (id: string, updates: Partial<CreateWhatsAppSender>): Promise<boolean> => {
    try {
      // If setting as default, unset others first
      if (updates.is_default) {
        await supabase
          .from("whatsapp_senders")
          .update({ is_default: false })
          .neq("id", id);
      }

      const { error } = await supabase
        .from("whatsapp_senders")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Número atualizado",
        description: "As alterações foram salvas com sucesso.",
      });

      await fetchSenders();
      return true;
    } catch (error) {
      console.error("Error updating WhatsApp sender:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o número. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteSender = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("whatsapp_senders")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Número removido",
        description: "O número foi removido com sucesso.",
      });

      await fetchSenders();
      return true;
    } catch (error) {
      console.error("Error deleting WhatsApp sender:", error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o número. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const setDefault = async (id: string): Promise<boolean> => {
    return updateSender(id, { is_default: true });
  };

  const toggleActive = async (id: string, is_active: boolean): Promise<boolean> => {
    return updateSender(id, { is_active });
  };

  const checkEnvKeyStatus = useCallback(async () => {
    setEnvKeyStatus(prev => ({ ...prev, loading: true }));
    try {
      const { data, error } = await supabase.functions.invoke('test-whatsapp', {
        method: 'GET',
      });

      if (error) throw error;
      setEnvKeyStatus({ hasEnvKey: data?.hasEnvKey ?? false, loading: false });
    } catch (error) {
      console.error("Error checking ENV key status:", error);
      setEnvKeyStatus({ hasEnvKey: false, loading: false });
    }
  }, []);

  useEffect(() => {
    fetchSenders();
    checkEnvKeyStatus();
  }, [fetchSenders, checkEnvKeyStatus]);

  const hasActiveSenders = senders.some(s => s.is_active);

  return {
    senders,
    loading,
    envKeyStatus,
    hasActiveSenders,
    fetchSenders,
    createSender,
    updateSender,
    deleteSender,
    setDefault,
    toggleActive,
  };
}
