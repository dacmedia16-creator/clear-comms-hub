import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface WhatsAppSenderTemplate {
  id: string;
  sender_id: string;
  identifier: string;
  label: string;
  button_config: string;
  has_nome_param: boolean;
  param_style: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSenderTemplate {
  sender_id: string;
  identifier: string;
  label: string;
  button_config?: string;
  has_nome_param?: boolean;
  param_style?: string;
  is_default?: boolean;
}

export function useWhatsAppSenderTemplates(senderId?: string) {
  const [templates, setTemplates] = useState<WhatsAppSenderTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from("whatsapp_sender_templates")
        .select("*")
        .order("is_default", { ascending: false })
        .order("label");

      if (senderId) query = query.eq("sender_id", senderId);

      const { data, error } = await query;
      if (error) throw error;
      setTemplates((data as WhatsAppSenderTemplate[]) || []);
    } catch (error) {
      console.error("Error fetching sender templates:", error);
      toast({
        title: "Erro ao carregar templates",
        description: "Não foi possível carregar os templates do número.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [senderId]);

  const createTemplate = async (template: CreateSenderTemplate): Promise<boolean> => {
    try {
      if (template.is_default) {
        await (supabase as any)
          .from("whatsapp_sender_templates")
          .update({ is_default: false })
          .eq("sender_id", template.sender_id);
      }

      const { error } = await (supabase as any)
        .from("whatsapp_sender_templates")
        .insert({
          sender_id: template.sender_id,
          identifier: template.identifier,
          label: template.label,
          button_config: template.button_config ?? "two_buttons",
          has_nome_param: template.has_nome_param ?? true,
          param_style: template.param_style ?? "named",
          is_default: template.is_default ?? false,
        });

      if (error) throw error;

      toast({ title: "Template adicionado", description: "Template salvo com sucesso." });
      await fetchTemplates();
      return true;
    } catch (error: any) {
      console.error("Error creating template:", error);
      toast({
        title: "Erro ao adicionar template",
        description: error?.message || "Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<CreateSenderTemplate>): Promise<boolean> => {
    try {
      if (updates.is_default && updates.sender_id) {
        await (supabase as any)
          .from("whatsapp_sender_templates")
          .update({ is_default: false })
          .eq("sender_id", updates.sender_id)
          .neq("id", id);
      }

      const { error } = await (supabase as any)
        .from("whatsapp_sender_templates")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Template atualizado" });
      await fetchTemplates();
      return true;
    } catch (error) {
      console.error("Error updating template:", error);
      toast({ title: "Erro ao atualizar", variant: "destructive" });
      return false;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from("whatsapp_sender_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Template removido" });
      await fetchTemplates();
      return true;
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({ title: "Erro ao remover", variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
