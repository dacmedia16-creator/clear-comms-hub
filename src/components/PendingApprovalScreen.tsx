import { Clock, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PendingRole {
  condominiumId: string;
  condominiumName: string;
  role: string;
}

interface PendingApprovalScreenProps {
  pendingRoles: PendingRole[];
  onSignOut: () => void;
  onRefresh: () => void;
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  syndic: "Síndico",
  resident: "Morador",
  collaborator: "Colaborador",
};

export function PendingApprovalScreen({ pendingRoles, onSignOut, onRefresh }: PendingApprovalScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <CardTitle className="font-display text-2xl">Aguardando aprovação</CardTitle>
          <CardDescription>
            Seu cadastro está sendo analisado pelo administrador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            {pendingRoles.map((pending) => (
              <div key={pending.condominiumId} className="text-sm">
                <span className="font-medium">{roleLabels[pending.role] || pending.role}</span>
                {" em "}
                <span className="font-medium">{pending.condominiumName}</span>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Você receberá acesso assim que sua solicitação for aprovada.
          </p>

          <div className="flex gap-3 justify-center pt-4">
            <Button variant="outline" onClick={onSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
            <Button onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
