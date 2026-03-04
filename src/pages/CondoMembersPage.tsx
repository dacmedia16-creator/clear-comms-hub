import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { useCondoMembers, getMemberDisplayName, getMemberEmail, getMemberPhone, getMemberPhoneSecondary, getMemberLocation, CondoMember } from "@/hooks/useCondoMembers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, ArrowLeft, Loader2, Trash2, UserCircle, Check, Bell, Settings, FileText, Upload, Pencil, Search, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Input } from "@/components/ui/input";
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
import { MemberListSelector } from "@/components/MemberListSelector";
import { useMemberLists } from "@/hooks/useMemberLists";
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
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { terms, behavior, placeholders, organizationType } = useOrganizationBehavior(condoId);

  const isGeneric = organizationType === "generic";

  const [condoName, setCondoName] = useState<string>("");
  const [condoSlug, setCondoSlug] = useState<string>("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CondoMember | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [bulkRemoveDialogOpen, setBulkRemoveDialogOpen] = useState(false);
  const [bulkRemoving, setBulkRemoving] = useState(false);

  const { lists, createList, updateList, deleteList, moveMemberToList } = useMemberLists(isGeneric ? condoId : undefined);
  const { members, loading, createMember, removeMember, removeMembersBulk, approveMember, importMembers, updateMember, refetch: refetchMembers } = useCondoMembers(condoId || "", isGeneric ? selectedListId : undefined);

  const filteredMembers = useMemo(
    () => {
      if (!searchQuery.trim()) return members;
      const q = searchQuery.toLowerCase();
      return members.filter((m) => {
        const name = getMemberDisplayName(m).toLowerCase();
        const email = (getMemberEmail(m) || "").toLowerCase();
        const phone = (getMemberPhone(m) || "").toLowerCase();
        return name.includes(q) || email.includes(q) || phone.includes(q);
      });
    },
    [members, searchQuery]
  );

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = useMemo(
    () => filteredMembers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredMembers, currentPage]
  );

  // Reset selection when page, search, or list changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedMemberIds(new Set());
  }, [members.length, searchQuery, selectedListId]);

  // Selection helpers
  const allPageSelected = paginatedMembers.length > 0 && paginatedMembers.every(m => selectedMemberIds.has(m.id));
  const somePageSelected = paginatedMembers.some(m => selectedMemberIds.has(m.id));

  const toggleSelectAll = useCallback(() => {
    setSelectedMemberIds(prev => {
      const next = new Set(prev);
      if (allPageSelected) {
        paginatedMembers.forEach(m => next.delete(m.id));
      } else {
        paginatedMembers.forEach(m => next.add(m.id));
      }
      return next;
    });
  }, [allPageSelected, paginatedMembers]);

  const toggleSelectMember = useCallback((id: string) => {
    setSelectedMemberIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBulkRemove = async () => {
    setBulkRemoving(true);
    const result = await removeMembersBulk(Array.from(selectedMemberIds));
    setBulkRemoving(false);
    setBulkRemoveDialogOpen(false);
    setSelectedMemberIds(new Set());
    if (result.success) {
      toast({ title: `${result.count} ${result.count === 1 ? terms.member.toLowerCase() : terms.memberPlural.toLowerCase()} removido(s)` });
    } else {
      toast({ title: "Erro ao remover", description: result.error, variant: "destructive" });
    }
  };

  const selectAllCheckboxRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.dataset.state = allPageSelected ? "checked" : somePageSelected ? "indeterminate" : "unchecked";
      (selectAllCheckboxRef.current as any).indeterminate = somePageSelected && !allPageSelected;
    }
  }, [allPageSelected, somePageSelected]);

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
    phoneSecondary: string;
    email: string;
    block: string;
    unit: string;
    role: "admin" | "syndic" | "resident" | "collaborator";
  }) => {
    const result = await createMember({ ...data, listId: selectedListId });
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
        {/* Member Lists selector - only for generic orgs */}
        {isGeneric && (
          <div className="mb-4">
            <MemberListSelector
              lists={lists}
              selectedListId={selectedListId}
              onSelectList={(id) => {
                setSelectedListId(id);
                setCurrentPage(1);
              }}
              onCreateList={createList}
              onUpdateList={updateList}
              onDeleteList={deleteList}
            />
          </div>
        )}

        {!loading && members.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Buscar ${terms.member.toLowerCase()} por nome, email ou telefone...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Bulk action bar */}
        {selectedMemberIds.size > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
            <span className="text-sm font-medium">{selectedMemberIds.size} selecionado(s)</span>
            <Button variant="destructive" size="sm" onClick={() => setBulkRemoveDialogOpen(true)}>
              <Trash2 className="w-4 h-4 mr-1" /> Remover selecionados
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedMemberIds(new Set())}>
              <X className="w-4 h-4 mr-1" /> Limpar
            </Button>
          </div>
        )}

        <AlertDialog open={bulkRemoveDialogOpen} onOpenChange={setBulkRemoveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover {selectedMemberIds.size} {selectedMemberIds.size === 1 ? terms.member.toLowerCase() : terms.memberPlural.toLowerCase()}?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Os membros selecionados serão removidos permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={bulkRemoving}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleBulkRemove} disabled={bulkRemoving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {bulkRemoving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
                  <div key={member.id} className="flex items-start gap-3">
                    <div className="pt-4">
                      <Checkbox
                        checked={selectedMemberIds.has(member.id)}
                        onCheckedChange={() => toggleSelectMember(member.id)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <MobileCardItem
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
                    {getMemberPhoneSecondary(member) && (
                      <p className="text-xs text-muted-foreground/70">Tel 2: {getMemberPhoneSecondary(member)}</p>
                    )}
                      </MobileCardItem>
                    </div>
                  </div>
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
                  <TableHead className="w-[40px]">
                    <Checkbox
                      ref={selectAllCheckboxRef}
                      checked={allPageSelected}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
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
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                      <TableRow key={member.id} className={`${!member.is_approved ? "bg-yellow-500/5" : ""} ${selectedMemberIds.has(member.id) ? "bg-muted/50" : ""}`}>
                        <TableCell>
                          <Checkbox
                            checked={selectedMemberIds.has(member.id)}
                            onCheckedChange={() => toggleSelectMember(member.id)}
                          />
                        </TableCell>
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
                          {getMemberPhoneSecondary(member) && (
                            <div className="text-xs text-muted-foreground/70">Tel 2: {getMemberPhoneSecondary(member)}</div>
                          )}
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
