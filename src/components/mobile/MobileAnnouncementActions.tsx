import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Pin, Trash2, MessageCircle, X } from "lucide-react";

interface MobileAnnouncementActionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcementTitle: string;
  isPinned: boolean;
  onTogglePin: () => void;
  onDelete: () => void;
  onSendWhatsApp?: () => void;
  showWhatsApp?: boolean;
}

export function MobileAnnouncementActions({
  open,
  onOpenChange,
  announcementTitle,
  isPinned,
  onTogglePin,
  onDelete,
  onSendWhatsApp,
  showWhatsApp = true,
}: MobileAnnouncementActionsProps) {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-base font-semibold line-clamp-1">
            {announcementTitle}
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-2">
          {showWhatsApp && onSendWhatsApp && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-base"
              onClick={() => {
                onSendWhatsApp();
                onOpenChange(false);
              }}
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
              Enviar via WhatsApp
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 text-base"
            onClick={() => {
              onTogglePin();
              onOpenChange(false);
            }}
          >
            <Pin className={`w-5 h-5 ${isPinned ? "text-primary" : ""}`} />
            {isPinned ? "Desafixar aviso" : "Fixar no topo"}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 text-base text-destructive hover:text-destructive"
            onClick={() => {
              onDelete();
              onOpenChange(false);
            }}
          >
            <Trash2 className="w-5 h-5" />
            Excluir aviso
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full h-12 mt-2">
              Cancelar
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
