import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Loader2, ChevronDown, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  sender_id: string;
  is_default: boolean;
}

interface SenderOption {
  id: string;
  name: string;
  phone: string;
  is_default: boolean;
  template_identifier: string | null;
}

function formatPhoneDisplay(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return phone;
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
  const [senders, setSenders] = useState<SenderOption[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);

  useEffect(() => {
    const load = async () => {
      const [sendersResult, templatesResult] = await Promise.all([
        (supabase as any)
          .from("whatsapp_senders")
          .select("id, name, phone, is_default, template_identifier")
          .eq("is_active", true)
          .order("is_default", { ascending: false })
          .order("name"),
        (supabase as any)
        .from("whatsapp_sender_templates")
          .select("id, label, identifier, is_default, sender_id, whatsapp_senders!inner(name, is_active)")
          .eq("whatsapp_senders.is_active", true)
          .order("is_default", { ascending: false })
      ]);

      if (sendersResult.error) {
        console.error("Failed to load senders", sendersResult.error);
        return;
      }

      if (templatesResult.error) {
        console.error("Failed to load templates", templatesResult.error);
        return;
      }

      setSenders((sendersResult.data || []) as SenderOption[]);

      const opts: TemplateOption[] = (templatesResult.data || []).map((t: any) => ({
        id: t.id,
        label: t.label,
        identifier: t.identifier,
        sender_id: t.sender_id,
        sender_name: t.whatsapp_senders?.name || "",
        is_default: t.is_default,
      }));
      setTemplates(opts);
    };
    load();
  }, []);

  const senderTemplates = useMemo(() => {
    const map = new Map<string, TemplateOption[]>();
    templates.forEach((template) => {
      const current = map.get(template.sender_id) || [];
      current.push(template);
      map.set(template.sender_id, current);
    });
    return map;
  }, [templates]);

  const handleSend = async (senderId?: string, templateId?: string) => {
    const baseUrl = window.location.origin;
    const result = await sendToMembers(announcement, condominium, baseUrl, templateId, senderId);

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

  const directSender = senders.length === 1 ? senders[0] : senders.find((sender) => sender.is_default) || null;
  const directTemplates = directSender ? senderTemplates.get(directSender.id) || [] : [];
  const canSendDirectly = senders.length <= 1 && directSender && directTemplates.length <= 1;

  if (canSendDirectly) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => handleSend(directSender.id, directTemplates[0]?.id)}
        disabled={sending}
        title="Enviar via WhatsApp"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
        {showLabel && <span className="ml-1">{sending ? "Enviando..." : "Enviar WhatsApp"}</span>}
      </Button>
    );
  }

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
        <DropdownMenuLabel>Escolher número</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {senders.map((sender) => {
          const options = senderTemplates.get(sender.id) || [];

          if (options.length <= 1) {
            return (
              <DropdownMenuItem key={sender.id} onClick={() => handleSend(sender.id, options[0]?.id)}>
                <div className="flex flex-col">
                  <span className="font-medium text-sm flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    {sender.name}
                    {sender.is_default && <span className="text-xs text-muted-foreground">(padrão)</span>}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatPhoneDisplay(sender.phone)}
                    {options[0] ? ` · ${options[0].label}` : sender.template_identifier ? ` · ${sender.template_identifier}` : " · template padrão"}
                  </span>
                </div>
              </DropdownMenuItem>
            );
          }

          return (
            <DropdownMenuSub key={sender.id}>
              <DropdownMenuSubTrigger>
                <div className="flex flex-col">
                  <span className="font-medium text-sm flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    {sender.name}
                    {sender.is_default && <span className="text-xs text-muted-foreground">(padrão)</span>}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatPhoneDisplay(sender.phone)}</span>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64">
                <DropdownMenuLabel>Escolher template</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {options.map((template) => (
                  <DropdownMenuItem key={template.id} onClick={() => handleSend(sender.id, template.id)}>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {template.label}
                        {template.is_default && <span className="ml-1 text-xs text-muted-foreground">(padrão)</span>}
                      </span>
                      <span className="text-xs text-muted-foreground">{template.identifier}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
