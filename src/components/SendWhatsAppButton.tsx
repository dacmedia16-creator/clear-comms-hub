import { MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSendWhatsApp } from "@/hooks/useSendWhatsApp";
import { AnnouncementForShare, CondominiumForShare } from "@/lib/whatsapp-templates";
import { toast } from "@/hooks/use-toast";

interface SendWhatsAppButtonProps {
  announcement: AnnouncementForShare & { id: string };
  condominium: CondominiumForShare & { id: string };
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "icon";
  showLabel?: boolean;
  onSendStarted?: (announcementId: string, totalExpected: number) => void;
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

  const handleSend = async () => {
    const baseUrl = window.location.origin;
    
    const result = await sendToMembers(announcement, condominium, baseUrl);

    if (result.error) {
      toast({
        title: "Erro ao enviar",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    if (result.total === 0) {
      toast({
        title: "Nenhum destinatário",
        description: result.message || "Nenhum membro com telefone cadastrado.",
      });
      return;
    }

    // Notify parent that send started
    if (onSendStarted && result.total > 0) {
      onSendStarted(announcement.id, result.total);
    }

    if (result.failed === 0) {
      toast({
        title: "Mensagens enviadas!",
        description: `${result.sent} mensagem(s) enviada(s) com sucesso.`,
      });
    } else if (result.sent === 0) {
      toast({
        title: "Falha no envio",
        description: `Nenhuma mensagem foi enviada. ${result.failed} falha(s).`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Envio parcial",
        description: `${result.sent} enviada(s), ${result.failed} falha(s).`,
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSend}
      disabled={sending}
      title="Enviar via WhatsApp"
    >
      {sending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <MessageCircle className="w-4 h-4" />
      )}
      {showLabel && <span className="ml-1">{sending ? "Enviando..." : "Enviar WhatsApp"}</span>}
    </Button>
  );
}
