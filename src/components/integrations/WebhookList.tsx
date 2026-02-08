import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Webhook as WebhookIcon, 
  Plus, 
  Trash2, 
  Edit, 
  ExternalLink, 
  Loader2,
  History,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Webhook, WebhookLog, useWebhooks } from "@/hooks/useWebhooks";
import { WebhookDialog } from "./WebhookDialog";
import { WebhookLogs } from "./WebhookLogs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WebhookListProps {
  condominiumId: string;
}

const EVENT_LABELS: Record<string, string> = {
  "announcement.created": "Aviso criado",
  "announcement.updated": "Aviso atualizado",
  "announcement.deleted": "Aviso excluído",
  "member.created": "Membro adicionado",
  "member.updated": "Membro atualizado",
};

export function WebhookList({ condominiumId }: WebhookListProps) {
  const { webhooks, loading, toggleWebhook, deleteWebhook, fetchWebhookLogs } = useWebhooks(condominiumId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [logsWebhook, setLogsWebhook] = useState<Webhook | null>(null);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const handleEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingWebhook(null);
  };

  const handleViewLogs = async (webhook: Webhook) => {
    setLogsWebhook(webhook);
    setLoadingLogs(true);
    const logData = await fetchWebhookLogs(webhook.id);
    setLogs(logData);
    setLoadingLogs(false);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteWebhook(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display flex items-center gap-2">
              <WebhookIcon className="w-5 h-5" />
              Webhooks
            </CardTitle>
            <CardDescription>
              Receba notificações automáticas em sistemas externos
            </CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Webhook
          </Button>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <WebhookIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Nenhum webhook configurado</p>
              <p className="text-sm">
                Configure webhooks para integrar com sistemas externos
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{webhook.name}</h4>
                      {webhook.is_active ? (
                        <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate">{webhook.url}</span>
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {EVENT_LABELS[event] || event}
                        </Badge>
                      ))}
                    </div>
                    {webhook.last_triggered_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Último disparo: {format(new Date(webhook.last_triggered_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={webhook.is_active}
                      onCheckedChange={(checked) => toggleWebhook(webhook.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewLogs(webhook)}
                      title="Ver logs"
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(webhook)}
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmId(webhook.id)}
                      title="Excluir"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <WebhookDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        condominiumId={condominiumId}
        webhook={editingWebhook}
      />

      {logsWebhook && (
        <WebhookLogs
          open={!!logsWebhook}
          onOpenChange={() => setLogsWebhook(null)}
          webhook={logsWebhook}
          logs={logs}
          loading={loadingLogs}
        />
      )}

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O webhook será removido permanentemente
              e não receberá mais notificações.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
