import { useEffect, useState } from "react";
import { MessageCircle, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSendWhatsApp } from "@/hooks/useSendWhatsApp";
import { AnnouncementForShare, CondominiumForShare } from "@/lib/whatsapp-templates";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SendWhatsAppButtonProps {
  announcement: AnnouncementForShare & { id: string };
  condominium: CondominiumForShare & { id: string };
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "icon";
  showLabel?: boolean;
  onSendStarted?: (announcementId: string, totalExpected: number, broadcastId?: string) => void;
}

interface TemplateOption {
  id: string;
  label: string;
  identifier: string;
  sender_name: string;
  is_default: boolean;
}

export function SendWhatsAppButton({
  announcement,
  condominium,
  variant = "ghost",
  size = "icon",
  showLabel = false,
  onSendStarted,
}: SendWhatsAppButtonProps) {
  const { sendToMembers, sending } = useSendWhatsApp();
  const [templates, setTemplates] = useState<TemplateOption[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await (supabase as any)
        .from("whatsapp_sender_templates")
        .select("id, label, identifier, is_default, whatsapp_senders!inner(name, is_active)")
        .eq("whatsapp_senders.is_active", true)
        .order("is_default", { ascending: false });

      if (error) {
        console.error("Failed to load templates", error);
        return;
      }

      const opts: TemplateOption[] = (data || []).map((t: any) => ({
        id: t.id,
        label: t.label,
        identifier: t.identifier,
        sender_name: t.whatsapp_senders?.name || "",
        is_default: t.is_default,
      }));
      setTemplates(opts);
    };
    load();
  }, []);

  const handleSend = async (templateId?: string) => {
    const baseUrl = window.location.origin;
    const result = await sendToMembers(announcement, condominium, baseUrl, templateId);

    if (result.error) {
      toast({ title: "Erro ao enviar", description: result.error, variant: "destructive" });
      return;
    }

    if (result.total === 0) {
      toast({
        title: "Nenhum destinatário",
        description: result.message || "Nenhum membro com telefone cadastrado.",
      });
      return;
    }

    if (onSendStarted && result.total > 0) {
      onSendStarted(announcement.id, result.total, (result as any).broadcast_id);
    }

    if (result.failed === 0) {
      toast({ title: "Mensagens enviadas!", description: `${result.sent ?? result.total} mensagem(s) em processamento.` });
    } else if (result.sent === 0) {
      toast({ title: "Falha no envio", description: `${result.failed} falha(s).`, variant: "destructive" });
    } else {
      toast({ title: "Envio parcial", description: `${result.sent} enviada(s), ${result.failed} falha(s).` });
    }
  };

  // If no templates configured (or only one), use simple button
  if (templates.length <= 1) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => handleSend()}
        disabled={sending}
        title="Enviar via WhatsApp"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
        {showLabel && <span className="ml-1">{sending ? "Enviando..." : "Enviar WhatsApp"}</span>}
      </Button>
    );
  }

  // Multiple templates: dropdown to choose
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={sending} title="Enviar via WhatsApp">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
          {showLabel && (
            <span className="ml-1 flex items-center gap-1">
              {sending ? "Enviando..." : "Enviar WhatsApp"}
              <ChevronDown className="w-3 h-3" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Escolher template</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {templates.map((t) => (
          <DropdownMenuItem key={t.id} onClick={() => handleSend(t.id)}>
            <div className="flex flex-col">
              <span className="font-medium text-sm">
                {t.label}
                {t.is_default && <span className="ml-1 text-xs text-muted-foreground">(padrão)</span>}
              </span>
              <span className="text-xs text-muted-foreground">
                {t.sender_name} · {t.identifier}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
