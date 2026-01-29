import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCondoMembers } from "@/hooks/useCondoMembers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, ArrowLeft, Loader2, Trash2, UserCircle, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshButton } from "@/components/RefreshButton";
import { AddMemberDialog } from "@/components/super-admin/AddMemberDialog";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  syndic: "Síndico",
  resident: "Morador",
  collaborator: "Colaborador",
};

const roleColors: Record<string, string> = {
  admin: "bg-primary/10 text-primary",
  syndic: "bg-accent text-accent-foreground",
  resident: "bg-muted text-muted-foreground",
  collaborator: "bg-chart-4/20 text-chart-4",
};

export default function CondoMembersPage() {
  const { condoId } = useParams<{ condoId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { members, loading, createMember, removeMember, approveMember } = useCondoMembers(condoId || "");
  const { toast } = useToast();

  const [condoName, setCondoName] = useState<string>("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  // Check if user can manage this condominium
  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !condoId) {
        setHasAccess(false);
        return;
      }

      try {
        // Check if user can manage this condo using RPC
        const { data, error } = await supabase.rpc("can_manage_condominium", {
          cond_id: condoId,
        });

        if (error) throw error;
        setHasAccess(data === true);

        if (!data) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para gerenciar este condomínio.",
            variant: "destructive",
          });
          navigate("/dashboard");
        }
      } catch (err: any) {
        console.error("Error checking access:", err);
        setHasAccess(false);
        navigate("/dashboard");
      }
    };

    if (!authLoading) {
      checkAccess();
    }
  }, [user, condoId, authLoading, navigate, toast]);

  // Get condominium info
  useEffect(() => {
    const fetchCondo = async () => {
      if (!condoId) return;
      const { data } = await supabase
        .from("condominiums")
        .select("name")
        .eq("id", condoId)
        .maybeSingle();
      if (data) setCondoName(data.name);
    };
    fetchCondo();
  }, [condoId]);

  const handleCreateNew = async (data: {
    fullName: string;
    phone: string;
    email: string;
    unit: string;
    role: "admin" | "syndic" | "resident" | "collaborator";
  }) => {
    const result = await createMember(data);
    if (result.success) {
      toast({ title: "Morador cadastrado com sucesso!" });
    } else {
      toast({
        title: "Erro ao cadastrar morador",
        description: result.error,
        variant: "destructive",
      });
    }
    return result;
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Tem certeza que deseja remover "${memberName}" deste condomínio?`)) return;

    const result = await removeMember(memberId);

    if (result.success) {
      toast({ title: "Membro removido!" });
    } else {
      toast({
        title: "Erro ao remover membro",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleApproveMember = async (memberId: string, memberName: string) => {
    const result = await approveMember(memberId);
    if (result.success) {
      toast({ title: `${memberName} foi aprovado(a) com sucesso!` });
    } else {
      toast({
        title: "Erro ao aprovar membro",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  if (authLoading || hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to={`/admin/${condoId}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="font-display text-xl font-bold text-foreground">Moradores</span>
                  {condoName && (
                    <p className="text-sm text-muted-foreground">{condoName}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RefreshButton />
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Add Member Dialog - only create new, no existing users list */}
      <AddMemberDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        availableUsers={[]}
        onAddExisting={async () => ({ success: false, error: "Não disponível" })}
        onCreateNew={handleCreateNew}
      />

      {/* Main Content */}
      <main className="container px-4 mx-auto py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Adicionado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <UserCircle className="w-12 h-12 opacity-30" />
                        <p>Nenhum morador cadastrado neste condomínio</p>
                        <p className="text-sm">Clique em "Adicionar" para cadastrar moradores</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id} className={!member.is_approved ? "bg-yellow-500/5" : ""}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {member.profile?.full_name || "—"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.profile?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {member.profile?.phone || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {member.unit || "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${roleColors[member.role]}`}
                        >
                          {roleLabels[member.role]}
                        </span>
                      </TableCell>
                      <TableCell>
                        {member.is_approved ? (
                          <Badge variant="default" className="bg-green-500/20 text-green-700 hover:bg-green-500/30">
                            Aprovado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-500/10">
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(member.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!member.is_approved && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleApproveMember(
                                  member.id,
                                  member.profile?.full_name || member.profile?.email || "Este membro"
                                )
                              }
                              title="Aprovar membro"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleRemoveMember(
                                member.id,
                                member.profile?.full_name || member.profile?.email || "este membro"
                              )
                            }
                            title="Remover membro"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>
    </div>
  );
}
