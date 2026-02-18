import { useState, useEffect, useMemo } from "react";
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
import { useCondoMembers, getMemberDisplayName, getMemberEmail, getMemberPhone, getMemberLocation, CondoMember } from "@/hooks/useCondoMembers";
import { useAllUsers } from "@/hooks/useAllUsers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, ArrowLeft, Loader2, Trash2, UserCircle, Building2, FileText, Bell, LayoutDashboard, Pencil } from "lucide-react";
import { EditMemberDialog, UpdateMemberData } from "@/components/EditMemberDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshButton } from "@/components/RefreshButton";
import { AddMemberDialog } from "@/components/super-admin/AddMemberDialog";
import { MobileBottomNav, MobileNavItem } from "@/components/mobile/MobileBottomNav";
import { MobileCardItem } from "@/components/mobile/MobileCardItem";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOrganizationTerms } from "@/hooks/useOrganizationTerms";
import { getRoleLabel } from "@/lib/organization-types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 20;

const superAdminNavItems: MobileNavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/super-admin" },
  { icon: Building2, label: "Condos", path: "/super-admin/condominiums" },
  { icon: Users, label: "Usuários", path: "/super-admin/users" },
  { icon: FileText, label: "Timelines", path: "/super-admin/timelines" },
  { icon: Bell, label: "Notificações", path: "/super-admin/notifications" },
];

const roleColors: Record<string, string> = {
  admin: "bg-primary/10 text-primary",
  syndic: "bg-accent text-accent-foreground",
  resident: "bg-muted text-muted-foreground",
  collaborator: "bg-chart-4/20 text-chart-4",
};

export default function SuperAdminCondoMembers() {
  const { condoId } = useParams<{ condoId: string }>();
  const { members, loading, addMember, createMember, removeMember, updateMember } = useCondoMembers(condoId || "");
  const { users } = useAllUsers();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { terms } = useOrganizationTerms(condoId);

  const [condoName, setCondoName] = useState<string>("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CondoMember | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(members.length / ITEMS_PER_PAGE);
  const paginatedMembers = useMemo(
    () => members.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [members, currentPage]
  );

  // Reset to page 1 when members change
  useEffect(() => {
    setCurrentPage(1);
  }, [members.length]);

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

  const handleAddExisting = async (userId: string, role: "admin" | "syndic" | "resident" | "collaborator", block: string, unit: string) => {
    const result = await addMember(userId, role, block, unit);
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
    block: string;
    unit: string;
    role: "admin" | "syndic" | "resident" | "collaborator";
  }) => {
    const result = await createMember(data);
    if (result.success) {
      toast({ title: `${terms.member} cadastrado com sucesso!` });
    } else {
      toast({
        title: `Erro ao cadastrar ${terms.member.toLowerCase()}`,
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

  const handleEditMember = (member: CondoMember) => {
    setEditingMember(member);
    setEditDialogOpen(true);
  };

  const handleSaveMember = async (roleId: string, data: UpdateMemberData) => {
    const result = await updateMember(roleId, data);
    if (result.success) {
      toast({ title: `${terms.member} atualizado com sucesso!` });
    } else {
      toast({
        title: `Erro ao atualizar ${terms.member.toLowerCase()}`,
        description: result.error,
        variant: "destructive",
      });
    }
    return result;
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
                    <span className="font-display text-xl font-bold text-foreground">
                      {terms.memberPlural}
                      {!loading && members.length > 0 && (
                        <span className="text-muted-foreground font-normal text-base ml-2">({members.length})</span>
                      )}
                    </span>
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
          terms={terms}
        />

        {/* Edit Member Dialog */}
        <EditMemberDialog
          member={editingMember}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleSaveMember}
          terms={terms}
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
                    <p>Nenhum {terms.member.toLowerCase()} cadastrado neste {terms.organization.toLowerCase()}</p>
                    <p className="text-sm">Clique em "Adicionar" para incluir {terms.memberPlural.toLowerCase()}</p>
                  </div>
                </Card>
              ) : (
                paginatedMembers.map((member) => {
                  const displayName = getMemberDisplayName(member);
                  const email = getMemberEmail(member);
                  const phone = getMemberPhone(member);
                  const location = getMemberLocation(member);
                  
                  return (
                    <MobileCardItem
                      key={member.id}
                      title={displayName}
                      subtitle={email || ""}
                      metadata={
                        <span className="text-xs">
                          {format(new Date(member.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      }
                      badges={
                        <>
                          <span className={`text-xs px-2 py-1 rounded-full ${roleColors[member.role]}`}>
                            {getRoleLabel(member.role, terms)}
                          </span>
                          {location !== "—" && (
                            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                              {location}
                            </span>
                          )}
                        </>
                      }
                      actions={
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMember(member)}
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveMember(member.id, displayName)
                            }
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      }
                    >
                      {phone && (
                        <p className="text-xs text-muted-foreground">{phone}</p>
                      )}
                    </MobileCardItem>
                  );
                })
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
                    <TableHead>{terms.block}/{terms.unit}</TableHead>
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
                          <p>Nenhum {terms.member.toLowerCase()} cadastrado neste {terms.organization.toLowerCase()}</p>
                          <p className="text-sm">Clique em "Adicionar" para incluir {terms.memberPlural.toLowerCase()}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedMembers.map((member) => {
                      const displayName = getMemberDisplayName(member);
                      const email = getMemberEmail(member);
                      const phone = getMemberPhone(member);
                      const location = getMemberLocation(member);
                      
                      return (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{displayName}</div>
                              {email && (
                                <div className="text-sm text-muted-foreground">{email}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {phone || "—"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {location}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${roleColors[member.role]}`}
                            >
                              {getRoleLabel(member.role, terms)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(member.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditMember(member)}
                                title="Editar membro"
                              >
                                <Pencil className="w-4 h-4 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveMember(member.id, displayName)}
                                title="Remover membro"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | "ellipsis")[]>((acc, page, idx, arr) => {
                    if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          isActive={currentPage === item}
                          onClick={() => setCurrentPage(item as number)}
                          className="cursor-pointer"
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </main>

        <MobileBottomNav items={superAdminNavItems} />
      </div>
    </SuperAdminGuard>
  );
}
