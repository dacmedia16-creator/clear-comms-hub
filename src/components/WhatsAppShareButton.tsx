import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateWhatsAppMessage,
  openWhatsAppShare,
  AnnouncementForShare,
  CondominiumForShare,
} from "@/lib/whatsapp-templates";

interface WhatsAppShareButtonProps {
  announcement: AnnouncementForShare;
  condominium: CondominiumForShare;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "icon";
  showLabel?: boolean;
}

export function WhatsAppShareButton({
  announcement,
  condominium,
  variant = "ghost",
  size = "icon",
  showLabel = false,
}: WhatsAppShareButtonProps) {
  const handleShare = () => {
    const message = generateWhatsAppMessage(
      announcement,
      condominium,
      "https://clear-comms-hub.lovable.app"
    );
    openWhatsAppShare(message);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      title="Compartilhar via WhatsApp"
      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
    >
      <MessageCircle className="w-4 h-4" />
      {showLabel && <span className="ml-1">Compartilhar</span>}
    </Button>
  );
}
