import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Eye, CheckCircle2, Loader2 } from "lucide-react";
import { useActiveBroadcasts } from "@/hooks/useActiveBroadcasts";
import { toast } from "@/hooks/use-toast";

interface Props {
  condominiumId: string | null | undefined;
  onOpenMonitor: (args: { announcementId: string; broadcastId: string; total: number }) => void;
}

export function ActiveBroadcastsBanner({ condominiumId, onOpenMonitor }: Props) {
  const { broadcasts, finalize } = useActiveBroadcasts(condominiumId);
  const [finalizingId, setFinalizingId] = useState<string | null>(null);

  if (broadcasts.length === 0) return null;

  const handleFinalize = async (id: string) => {
    setFinalizingId(id);
    try {
      await finalize(id);
      toast({ title: "Disparo finalizado", description: "O envio foi marcado como concluído." });
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível finalizar.", variant: "destructive" });
    } finally {
      setFinalizingId(null);
    }
  };

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-green-600" />
          <h3 className="font-display text-sm font-semibold">
            Envios de WhatsApp em andamento ({broadcasts.length})
          </h3>
        </div>
        <div className="space-y-2">
          {broadcasts.map((b) => (
            <div
              key={b.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-md border bg-card px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {b.announcement_title || "Aviso sem título"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={
                      b.status === "paused"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    }
                  >
                    {b.status === "paused" ? "Pausado" : "Enviando"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {b.total_members} destinatários
                  </span>
                </div>
                {(b.sender_name_snapshot || b.sender_phone_snapshot || b.template_label_snapshot || b.template_identifier_snapshot) && (
                  <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {(b.sender_name_snapshot || b.sender_phone_snapshot) && (
                      <p className="truncate">
                        Número: {[b.sender_name_snapshot, b.sender_phone_snapshot].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {(b.template_label_snapshot || b.template_identifier_snapshot) && (
                      <p className="truncate">
                        Template: {b.template_label_snapshot || b.template_identifier_snapshot}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onOpenMonitor({
                      announcementId: b.announcement_id,
                      broadcastId: b.id,
                      total: b.total_members,
                    })
                  }
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Abrir Monitor
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFinalize(b.id)}
                  disabled={finalizingId === b.id}
                >
                  {finalizingId === b.id ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                  )}
                  Finalizar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
