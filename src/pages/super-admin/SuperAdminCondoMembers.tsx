import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { SuperAdminGuard } from "@/components/SuperAdminGuard";
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
import { useAllUsers } from "@/hooks/useAllUsers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, ArrowLeft, Loader2, Trash2, UserCircle, Building2, FileText, MessageSquare, LayoutDashboard } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshButton } from "@/components/RefreshButton";
import { AddMemberDialog } from "@/components/super-admin/AddMemberDialog";
import { MobileBottomNav, MobileNavItem } from "@/components/mobile/MobileBottomNav";
import { MobileCardItem } from "@/components/mobile/MobileCardItem";
import { useIsMobile } from "@/hooks/use-mobile";

const superAdminNavItems: MobileNavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/super-admin" },
  { icon: Building2, label: "Condos", path: "/super-admin/condominiums" },
  { icon: Users, label: "Usuários", path: "/super-admin/users" },
  { icon: FileText, label: "Timelines", path: "/super-admin/timelines" },
  { icon: MessageSquare, label: "WhatsApp", path: "/super-admin/whatsapp" },
];

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

export default function SuperAdminCondoMembers() {
  const { condoId } = useParams<{ condoId: string }>();
  const { members, loading, addMember, createMember, removeMember } = useCondoMembers(condoId || "");
  const { users } = useAllUsers();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [condoName, setCondoName] = useState<string>("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

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

  // Filter out users already in the condominium
  const memberUserIds = new Set(members.map((m) => m.user_id));
  const availableUsers = users.filter((u) => !memberUserIds.has(u.id));

  const handleAddExisting = async (userId: string, role: "admin" | "syndic" | "resident" | "collaborator", unit: string) => {
    const result = await addMember(userId, role, unit);
    if (result.success) {
      toast({ title: "Membro adicionado com sucesso!" });
    } else {
      toast({
        title: "Erro ao adicionar membro",
        description: result.error,
        variant: "destructive",
      });
    }
    return result;
  };

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

  return (
    <SuperAdminGuard>
      <div className="min-h-screen bg-background has-bottom-nav">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link
                  to="/super-admin/condominiums"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <span className="font-display text-xl font-bold text-foreground">Membros</span>
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

        {/* Add Member Dialog */}
        <AddMemberDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          availableUsers={availableUsers}
          onAddExisting={handleAddExisting}
          onCreateNew={handleCreateNew}
        />

        {/* Main Content */}
        <main className="container px-4 mx-auto py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : isMobile ? (
            /* Mobile: Cards */
            <div className="space-y-4">
              {members.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <UserCircle className="w-12 h-12 opacity-30" />
                    <p>Nenhum membro cadastrado neste condomínio</p>
                    <p className="text-sm">Clique em "Adicionar" para incluir síndicos ou moradores</p>
                  </div>
                </Card>
              ) : (
                members.map((member) => (
                  <MobileCardItem
                    key={member.id}
                    title={member.profile?.full_name || "—"}
                    subtitle={member.profile?.email || ""}
                    metadata={
                      <span className="text-xs">
                        {format(new Date(member.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    }
                    badges={
                      <>
                        <span className={`text-xs px-2 py-1 rounded-full ${roleColors[member.role]}`}>
                          {roleLabels[member.role]}
                        </span>
                        {member.unit && (
                          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                            {member.unit}
                          </span>
                        )}
                      </>
                    }
                    actions={
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveMember(
                            member.id,
                            member.profile?.full_name || member.profile?.email || "este membro"
                          )
                        }
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    }
                  >
                    {member.profile?.phone && (
                      <p className="text-xs text-muted-foreground">{member.profile.phone}</p>
                    )}
                  </MobileCardItem>
                ))
              )}
            </div>
          ) : (
            /* Desktop: Table */
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Adicionado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <UserCircle className="w-12 h-12 opacity-30" />
                          <p>Nenhum membro cadastrado neste condomínio</p>
                          <p className="text-sm">Clique em "Adicionar" para incluir síndicos ou moradores</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
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
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(member.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleRemoveMember(
                                member.id,
                                member.profile?.full_name || member.profile?.email || "este membro"
                              )
                            }
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </main>

        <MobileBottomNav items={superAdminNavItems} />
      </div>
    </SuperAdminGuard>
  );
}
