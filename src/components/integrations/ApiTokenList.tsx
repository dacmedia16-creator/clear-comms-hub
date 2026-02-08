import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Key, Plus, Trash2, Loader2, Copy, CheckCircle, XCircle, Clock } from "lucide-react";
import { ApiToken, AVAILABLE_PERMISSIONS, useApiTokens } from "@/hooks/useApiTokens";
import { ApiTokenDialog } from "./ApiTokenDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
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

interface ApiTokenListProps {
  condominiumId: string;
}

export function ApiTokenList({ condominiumId }: ApiTokenListProps) {
  const { tokens, loading, toggleToken, deleteToken } = useApiTokens(condominiumId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopyPrefix = (prefix: string) => {
    navigator.clipboard.writeText(prefix);
    toast({
      title: "Prefixo copiado",
      description: "O prefixo do token foi copiado para a área de transferência.",
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteToken(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const getPermissionLabel = (permission: string) => {
    return AVAILABLE_PERMISSIONS.find((p) => p.value === permission)?.label || permission;
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
              <Key className="w-5 h-5" />
              Tokens de API
            </CardTitle>
            <CardDescription>
              Autenticação para integrações externas via REST API
            </CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Gerar Token
          </Button>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Nenhum token de API</p>
              <p className="text-sm">
                Gere um token para permitir que sistemas externos acessem a API
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map((token) => {
                const isExpired = token.expires_at && new Date(token.expires_at) < new Date();
                
                return (
                  <div
                    key={token.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{token.name}</h4>
                        {isExpired ? (
                          <Badge variant="destructive">
                            <Clock className="w-3 h-3 mr-1" />
                            Expirado
                          </Badge>
                        ) : token.is_active ? (
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
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                          {token.token_prefix}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyPrefix(token.token_prefix)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {token.permissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {getPermissionLabel(perm)}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Criado: {format(new Date(token.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                        {token.last_used_at && (
                          <span>
                            Último uso: {format(new Date(token.last_used_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                        )}
                        {token.expires_at && (
                          <span className={isExpired ? "text-destructive" : ""}>
                            Expira: {format(new Date(token.expires_at), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={token.is_active && !isExpired}
                        onCheckedChange={(checked) => toggleToken(token.id, checked)}
                        disabled={isExpired}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirmId(token.id)}
                        title="Revogar token"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ApiTokenDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        condominiumId={condominiumId}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar token?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O token será desativado permanentemente
              e qualquer sistema que o utilize perderá o acesso à API.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
