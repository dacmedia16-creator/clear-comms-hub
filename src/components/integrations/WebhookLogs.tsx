import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Webhook, WebhookLog } from "@/hooks/useWebhooks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface WebhookLogsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook: Webhook;
  logs: WebhookLog[];
  loading: boolean;
}

const EVENT_LABELS: Record<string, string> = {
  "announcement.created": "Aviso criado",
  "announcement.updated": "Aviso atualizado",
  "announcement.deleted": "Aviso excluído",
  "member.created": "Membro adicionado",
  "member.updated": "Membro atualizado",
};

export function WebhookLogs({ open, onOpenChange, webhook, logs, loading }: WebhookLogsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-display">
            Logs de Entregas - {webhook.name}
          </DialogTitle>
          <DialogDescription>
            Histórico das últimas 50 tentativas de envio
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum log encontrado</p>
            <p className="text-sm">Os logs aparecerão aqui quando o webhook for disparado</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <Accordion type="single" collapsible className="space-y-2">
              {logs.map((log) => (
                <AccordionItem
                  key={log.id}
                  value={log.id}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3 w-full">
                      {log.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                      )}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {EVENT_LABELS[log.event_type] || log.event_type}
                          </span>
                          {log.response_status && (
                            <Badge
                              variant={log.success ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {log.response_status}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.sent_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Payload enviado:</p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                      {log.response_body && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Resposta:</p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-32">
                            {log.response_body}
                          </pre>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
