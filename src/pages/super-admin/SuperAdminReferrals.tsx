import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SuperAdminGuard } from "@/components/SuperAdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Loader2, 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  MessageSquare, 
  Mail, 
  Check, 
  X, 
  Pencil, 
  Trash2,
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Bell,
  Phone,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RefreshButton } from "@/components/RefreshButton";
import { MobileBottomNav, MobileNavItem } from "@/components/mobile/MobileBottomNav";
import { useSyndicReferrals, SyndicReferral } from "@/hooks/useSyndicReferrals";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

const superAdminNavItems: MobileNavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/super-admin" },
  { icon: Building2, label: "Condos", path: "/super-admin/condominiums" },
  { icon: Users, label: "Usuários", path: "/super-admin/users" },
  { icon: FileText, label: "Timelines", path: "/super-admin/timelines" },
  { icon: Bell, label: "Notificações", path: "/super-admin/notifications" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os status" },
  { value: "pending", label: "Pendente" },
  { value: "contacted", label: "Contatado" },
  { value: "converted", label: "Convertido" },
  { value: "rejected", label: "Rejeitado" },
];

const SEND_FILTER_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "whatsapp_failed", label: "WhatsApp falhou" },
  { value: "email_failed", label: "Email falhou" },
  { value: "any_failed", label: "Qualquer falha" },
];

function getStatusBadge(status: string | null) {
  const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    pending: { variant: "secondary", label: "Pendente" },
    contacted: { variant: "default", label: "Contatado" },
    converted: { variant: "outline", label: "Convertido" },
    rejected: { variant: "destructive", label: "Rejeitado" },
  };

  const config = statusConfig[status || "pending"] || statusConfig.pending;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function SendStatusIcon({ sent }: { sent: boolean | null }) {
  if (sent === true) {
    return <Check className="w-4 h-4 text-emerald-500" />;
  }
  if (sent === false) {
    return <X className="w-4 h-4 text-destructive" />;
  }
  return <span className="w-4 h-4 text-muted-foreground">-</span>;
}

export default function SuperAdminReferrals() {
  const { signOut } = useAuth();
  const isMobile = useIsMobile();
  const { 
    referrals, 
    loading, 
    stats, 
    refetch, 
    updateStatus, 
    updateNotes, 
    deleteReferral, 
    resendNotification 
  } = useSyndicReferrals();

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sendFilter, setSendFilter] = useState("all");

  // Dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<SyndicReferral | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [resendChannel, setResendChannel] = useState<"whatsapp" | "email" | "both">("both");
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter referrals
  const filteredReferrals = referrals.filter((r) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery ||
      r.syndic_name.toLowerCase().includes(searchLower) ||
      r.syndic_email.toLowerCase().includes(searchLower) ||
      r.condominium_name.toLowerCase().includes(searchLower) ||
      (r.referrer_name && r.referrer_name.toLowerCase().includes(searchLower));

    // Status filter
    const matchesStatus = 
      statusFilter === "all" || 
      (r.status || "pending") === statusFilter;

    // Send filter
    let matchesSend = true;
    if (sendFilter === "whatsapp_failed") {
      matchesSend = r.whatsapp_sent === false;
    } else if (sendFilter === "email_failed") {
      matchesSend = r.email_sent === false;
    } else if (sendFilter === "any_failed") {
      matchesSend = r.whatsapp_sent === false || r.email_sent === false;
    }

    return matchesSearch && matchesStatus && matchesSend;
  });

  // Handlers
  const handleOpenEdit = (referral: SyndicReferral) => {
    setSelectedReferral(referral);
    setEditNotes(referral.notes || "");
    setEditStatus(referral.status || "pending");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedReferral) return;
    setIsProcessing(true);

    const statusSuccess = await updateStatus(selectedReferral.id, editStatus);
    const notesSuccess = await updateNotes(selectedReferral.id, editNotes);

    if (statusSuccess && notesSuccess) {
      toast.success("Indicação atualizada com sucesso");
    } else {
      toast.error("Erro ao atualizar indicação");
    }

    setIsProcessing(false);
    setEditDialogOpen(false);
    setSelectedReferral(null);
  };

  const handleOpenDelete = (referral: SyndicReferral) => {
    setSelectedReferral(referral);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedReferral) return;
    setIsProcessing(true);

    const success = await deleteReferral(selectedReferral.id);

    if (success) {
      toast.success("Indicação excluída com sucesso");
    } else {
      toast.error("Erro ao excluir indicação");
    }

    setIsProcessing(false);
    setDeleteDialogOpen(false);
    setSelectedReferral(null);
  };

  const handleOpenResend = (referral: SyndicReferral) => {
    setSelectedReferral(referral);
    setResendChannel("both");
    setResendDialogOpen(true);
  };

  const handleConfirmResend = async () => {
    if (!selectedReferral) return;
    setIsProcessing(true);

    const result = await resendNotification(selectedReferral.id, resendChannel);

    if (result.success) {
      toast.success(result.message || "Notificação reenviada com sucesso");
    } else {
      toast.error(result.message || "Erro ao reenviar notificação");
    }

    setIsProcessing(false);
    setResendDialogOpen(false);
    setSelectedReferral(null);
  };

  return (
    <SuperAdminGuard>
      <div className="min-h-screen bg-background has-bottom-nav">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link to="/super-admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-display text-xl font-bold text-foreground">Indicações</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <RefreshButton />
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container px-4 mx-auto py-8">
          <div className="mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Indicações de Síndicos
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todas as indicações recebidas pelo formulário
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total</CardDescription>
                    <CardTitle className="text-3xl font-display">{stats.total}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Pendentes</CardDescription>
                    <CardTitle className="text-3xl font-display text-amber-600">{stats.pending}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Contatados</CardDescription>
                    <CardTitle className="text-3xl font-display text-primary">{stats.contacted}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Convertidos</CardDescription>
                    <CardTitle className="text-3xl font-display text-emerald-600">{stats.converted}</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email ou condomínio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sendFilter} onValueChange={setSendFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Envios" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEND_FILTER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Table / Cards */}
              {filteredReferrals.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhuma indicação encontrada</p>
                  </CardContent>
                </Card>
              ) : isMobile ? (
                <div className="space-y-4">
                  {filteredReferrals.map((referral) => (
                    <Card key={referral.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{referral.syndic_name}</CardTitle>
                            <CardDescription>{referral.condominium_name}</CardDescription>
                          </div>
                          {getStatusBadge(referral.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{referral.syndic_phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{referral.syndic_email}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            <SendStatusIcon sent={referral.whatsapp_sent} />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <SendStatusIcon sent={referral.email_sent} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleOpenResend(referral)}
                          >
                            Reenviar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(referral)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDelete(referral)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Síndico</TableHead>
                        <TableHead>Condomínio</TableHead>
                        <TableHead>Indicado por</TableHead>
                        <TableHead className="text-center">WhatsApp</TableHead>
                        <TableHead className="text-center">Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReferrals.map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{referral.syndic_name}</p>
                              <p className="text-sm text-muted-foreground">{referral.syndic_email}</p>
                              <p className="text-sm text-muted-foreground">{referral.syndic_phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>{referral.condominium_name}</TableCell>
                          <TableCell>{referral.referrer_name || "-"}</TableCell>
                          <TableCell className="text-center">
                            <SendStatusIcon sent={referral.whatsapp_sent} />
                          </TableCell>
                          <TableCell className="text-center">
                            <SendStatusIcon sent={referral.email_sent} />
                          </TableCell>
                          <TableCell>{getStatusBadge(referral.status)}</TableCell>
                          <TableCell>
                            {referral.created_at
                              ? format(new Date(referral.created_at), "dd/MM/yyyy", { locale: ptBR })
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenResend(referral)}>
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Reenviar notificações
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenEdit(referral)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleOpenDelete(referral)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </>
          )}
        </main>

        <MobileBottomNav items={superAdminNavItems} />

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Indicação</DialogTitle>
              <DialogDescription>
                Atualize o status e adicione notas sobre esta indicação.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="contacted">Contatado</SelectItem>
                    <SelectItem value="converted">Convertido</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  placeholder="Adicione observações sobre o contato..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={isProcessing}>
                {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir indicação?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A indicação de{" "}
                <strong>{selectedReferral?.syndic_name}</strong> será permanentemente removida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isProcessing}
              >
                {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Resend Dialog */}
        <Dialog open={resendDialogOpen} onOpenChange={setResendDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reenviar Notificações</DialogTitle>
              <DialogDescription>
                Escolha quais canais deseja reenviar para{" "}
                <strong>{selectedReferral?.syndic_name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Canal</Label>
                <Select value={resendChannel} onValueChange={(v) => setResendChannel(v as typeof resendChannel)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">Apenas WhatsApp</SelectItem>
                    <SelectItem value="email">Apenas Email</SelectItem>
                    <SelectItem value="both">WhatsApp e Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedReferral && (
                <div className="bg-muted p-4 rounded-lg text-sm space-y-1">
                  <p><strong>Telefone:</strong> {selectedReferral.syndic_phone}</p>
                  <p><strong>Email:</strong> {selectedReferral.syndic_email}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResendDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmResend} disabled={isProcessing}>
                {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Reenviar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminGuard>
  );
}
