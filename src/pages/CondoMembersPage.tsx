import { useState, useEffect, useMemo } from "react";
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
import { useCondoMembers, getMemberDisplayName, getMemberEmail, getMemberPhone, getMemberLocation, CondoMember } from "@/hooks/useCondoMembers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, ArrowLeft, Loader2, Trash2, UserCircle, Check, Bell, Settings, FileText, Upload, Pencil } from "lucide-react";
import { EditMemberDialog, UpdateMemberData } from "@/components/EditMemberDialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshButton } from "@/components/RefreshButton";
import { AddMemberDialog } from "@/components/super-admin/AddMemberDialog";
import { MobileBottomNav, MobileNavItem } from "@/components/mobile/MobileBottomNav";
import { MobileCardItem } from "@/components/mobile/MobileCardItem";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImportMembersDialog, ParsedMember } from "@/components/ImportMembersDialog";
import { useOrganizationBehavior } from "@/hooks/useOrganizationBehavior";
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
  const { members, loading, createMember, removeMember, approveMember, importMembers, updateMember } = useCondoMembers(condoId || "");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { terms, behavior, placeholders } = useOrganizationBehavior(condoId);

  const [condoName, setCondoName] = useState<string>("");
  const [condoSlug, setCondoSlug] = useState<string>("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CondoMember | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(members.length / ITEMS_PER_PAGE);
  const paginatedMembers = useMemo(
    () => members.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [members, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [members.length]);

  // Nav items for syndic
  const syndicNavItems: MobileNavItem[] = condoId ? [
    { icon: Bell, label: "Avisos", path: `/admin/${condoId}` },
    { icon: Users, label: terms.memberPlural, path: `/admin/${condoId}/members` },
    { icon: Settings, label: "Config", path: `/admin/${condoId}/settings` },
    { icon: FileText, label: "Timeline", path: condoSlug ? `/c/${condoSlug}` : `/admin/${condoId}` },
  ] : [];

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
        .select("name, slug")
        .eq("id", condoId)
        .maybeSingle();
      if (data) {
        setCondoName(data.name);
        setCondoSlug(data.slug);
      }
    };
    fetchCondo();
  }, [condoId]);

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

  const handleImportMembers = async (members: ParsedMember[], onChunkProgress?: (processed: number, total: number) => void) => {
    const result = await importMembers(members, onChunkProgress);
    if (result.success > 0) {
      toast({
        title: "Importação concluída!",
        description: `${result.success} ${terms.member.toLowerCase()}(s) importado(s) com sucesso${result.failed > 0 ? `, ${result.failed} falha(s)` : ""}`,
      });
    } else if (result.failed > 0) {
      toast({
        title: "Erro na importação",
        description: `Nenhum ${terms.member.toLowerCase()} foi importado. ${result.failed} falha(s).`,
        variant: "destructive",
      });
    }
    return result;
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
    <div className="min-h-screen bg-background has-bottom-nav">
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
                  <span className="font-display text-xl font-bold text-foreground">{terms.memberPlural} ({members.length})</span>
                  {condoName && (
                    <p className="text-sm text-muted-foreground">{condoName}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size={isMobile ? "icon" : "default"} onClick={() => setImportDialogOpen(true)}>
                <Upload className="w-4 h-4" />
                {!isMobile && <span className="ml-2">Importar</span>}
              </Button>
              <RefreshButton />
              <Button size={isMobile ? "icon" : "default"} onClick={() => setAddDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                {!isMobile && <span className="ml-2">Adicionar</span>}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Edit Member Dialog */}
      <EditMemberDialog
        member={editingMember}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveMember}
        terms={terms}
        behavior={behavior}
      />

      {/* Import Members Dialog */}
      <ImportMembersDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImportMembers}
        terms={terms}
        behavior={behavior}
      />

      {/* Add Member Dialog - only create new, no existing users list */}
      <AddMemberDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        availableUsers={[]}
        onAddExisting={async () => ({ success: false, error: "Não disponível" })}
        onCreateNew={handleCreateNew}
        terms={terms}
        behavior={behavior}
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
                  <p className="text-sm">Clique em "Adicionar" para cadastrar {terms.memberPlural.toLowerCase()}</p>
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
                    className={!member.is_approved ? "border-yellow-500/50" : ""}
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
                        {location && (
                          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                            {location}
                          </span>
                        )}
                        {member.is_approved ? (
                          <Badge variant="default" className="bg-green-500/20 text-green-700 hover:bg-green-500/30">
                            Aprovado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-500/10">
                            Pendente
                          </Badge>
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
                        {!member.is_approved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApproveMember(member.id, displayName)}
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id, displayName)}
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
                  <TableHead>{behavior.requiresLocation ? `${terms.block}/${terms.unit}` : terms.block}</TableHead>
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
                        <p>Nenhum {terms.member.toLowerCase()} cadastrado neste {terms.organization.toLowerCase()}</p>
                        <p className="text-sm">Clique em "Adicionar" para cadastrar {terms.memberPlural.toLowerCase()}</p>
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
                      <TableRow key={member.id} className={!member.is_approved ? "bg-yellow-500/5" : ""}>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditMember(member)}
                              title="Editar membro"
                            >
                              <Pencil className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            {!member.is_approved && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApproveMember(member.id, displayName)}
                                title="Aprovar membro"
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
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

        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}
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

      <MobileBottomNav items={syndicNavItems} />
    </div>
  );
}
