import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { AlertCircle, FileText, Loader2, MessageSquare, Pencil, Star, Trash2 } from "lucide-react";
import { useWhatsAppSenders, WhatsAppSender } from "@/hooks/useWhatsAppSenders";
import { AddWhatsAppSenderDialog } from "./AddWhatsAppSenderDialog";
import { EditWhatsAppSenderDialog } from "./EditWhatsAppSenderDialog";
import { SenderTemplatesDialog } from "./SenderTemplatesDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function formatPhoneDisplay(phone: string): string {
  if (phone.length === 11) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  }
  if (phone.length === 10) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
  }
  return phone;
}

function formatButtonConfigLabel(config: string): string {
  switch (config) {
    case "single_button_idx0":
      return "1 botão · posição 1";
    case "single_button_idx1":
      return "1 botão · posição 2";
    case "no_buttons":
      return "Sem botões";
    default:
      return "2 botões";
  }
}

export function WhatsAppSendersCard() {
  const { senders, loading, envKeyStatus, hasActiveSenders, createSender, updateSender, deleteSender, setDefault, toggleActive } = useWhatsAppSenders();
  const [editingSender, setEditingSender] = useState<WhatsAppSender | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [senderToDelete, setSenderToDelete] = useState<WhatsAppSender | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [templatesSender, setTemplatesSender] = useState<WhatsAppSender | null>(null);
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false);

  const handleManageTemplates = (sender: WhatsAppSender) => {
    setTemplatesSender(sender);
    setTemplatesDialogOpen(true);
  };

  const handleEdit = (sender: WhatsAppSender) => {
    setEditingSender(sender);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (sender: WhatsAppSender) => {
    setSenderToDelete(sender);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!senderToDelete) return;
    
    setDeleting(true);
    await deleteSender(senderToDelete.id);
    setDeleting(false);
    setDeleteDialogOpen(false);
    setSenderToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Números de WhatsApp
              </CardTitle>
              <CardDescription>
                Gerencie os números disponíveis para disparo de mensagens
              </CardDescription>
            </div>
            <AddWhatsAppSenderDialog onAdd={createSender} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ENV Key Status Alert */}
          {!envKeyStatus.loading && envKeyStatus.hasEnvKey && (
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-600 dark:text-amber-400">
                API Key do Ambiente Detectada
              </AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground">
                Existe uma configuração via variável de ambiente que será usada como fallback 
                se nenhum número estiver cadastrado ou ativo.
                {!hasActiveSenders && (
                  <Badge variant="secondary" className="ml-2 bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    Ativo (Fallback)
                  </Badge>
                )}
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : senders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum número cadastrado no banco de dados</p>
              <p className="text-sm">
                {envKeyStatus.hasEnvKey 
                  ? "A API Key do ambiente está sendo usada como fallback"
                  : "Adicione um número para começar a enviar mensagens"
                }
              </p>
            </div>
          ) : (
            <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Template padrão</TableHead>
                  <TableHead>Config. do número</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Padrão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {senders.map((sender) => (
                  <TableRow key={sender.id}>
                  <TableCell className="font-medium">{sender.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatPhoneDisplay(sender.phone)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono">
                        {sender.template_identifier ?? <span className="italic">sem identificador no número</span>}
                      </span>
                      <span>
                        O envio usa o template padrão cadastrado em <span className="font-medium">Templates</span> quando existir.
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="cursor-help text-xs">
                            {formatButtonConfigLabel((sender as any).button_config ?? "two_buttons")}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-mono text-xs">{(sender as any).button_config ?? "two_buttons"}</p>
                          <p className="text-xs text-muted-foreground">Configuração aplicada quando o envio usar os dados do número.</p>
                        </TooltipContent>
                      </Tooltip>
                      {(sender as any).has_nome_param === false && (
                        <Badge variant="secondary" className="text-xs">sem nome</Badge>
                      )}
                    </div>
                  </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Switch
                          checked={sender.is_active}
                          onCheckedChange={(checked) => toggleActive(sender.id, checked)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {sender.is_default ? (
                          <Badge variant="default" className="gap-1">
                            <Star className="w-3 h-3" />
                            Padrão
                          </Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDefault(sender.id)}
                            disabled={!sender.is_active}
                            className="text-xs"
                          >
                            Definir
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleManageTemplates(sender)}
                          title="Gerenciar templates"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(sender)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(sender)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditWhatsAppSenderDialog
        sender={editingSender}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={updateSender}
      />

      {/* Templates Dialog */}
      <SenderTemplatesDialog
        sender={templatesSender}
        open={templatesDialogOpen}
        onOpenChange={setTemplatesDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o número "{senderToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
