import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { SuperAdminGuard } from "@/components/SuperAdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useAllCondominiums } from "@/hooks/useAllCondominiums";
import { usePlans, Plan, CreatePlanInput } from "@/hooks/usePlans";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { RefreshButton } from "@/components/RefreshButton";
import { MobileBottomNav, MobileNavItem } from "@/components/mobile/MobileBottomNav";
import {
  ArrowLeft,
  Loader2,
  CreditCard,
  Search,
  Building2,
  Users,
  FileText,
  Bell,
  LayoutDashboard,
  Pencil,
  Check,
  AlertTriangle,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const superAdminNavItems: MobileNavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/super-admin" },
  { icon: Building2, label: "Condos", path: "/super-admin/condominiums" },
  { icon: Users, label: "Usuários", path: "/super-admin/users" },
  { icon: FileText, label: "Timelines", path: "/super-admin/timelines" },
  { icon: Bell, label: "Notificações", path: "/super-admin/notifications" },
];

const BADGE_OPTIONS = [
  { label: "Cinza", value: "bg-muted text-muted-foreground" },
  { label: "Âmbar", value: "bg-amber-100 text-amber-700" },
  { label: "Verde", value: "bg-emerald-100 text-emerald-700" },
  { label: "Azul", value: "bg-blue-100 text-blue-700" },
  { label: "Roxo", value: "bg-purple-100 text-purple-700" },
  { label: "Primário", value: "bg-primary/10 text-primary" },
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 30);
}

export default function SuperAdminPlans() {
  const { signOut } = useAuth();
  const { condominiums, loading: loadingCondos, refetch: refetchCondos } = useAllCondominiums();
  const { plans, loading: loadingPlans, refetch: refetchPlans, createPlan, updatePlan, deletePlan } = usePlans();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  
  // Condo plan edit dialog
  const [editingCondo, setEditingCondo] = useState<{
    id: string;
    name: string;
    currentPlan: string;
  } | null>(null);
  const [newCondoPlan, setNewCondoPlan] = useState<string>("");
  const [updatingCondo, setUpdatingCondo] = useState(false);
  
  // Plan CRUD dialog
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);
  
  // Delete confirmation
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Plan form state
  const [planName, setPlanName] = useState("");
  const [planSlug, setPlanSlug] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planAnnouncements, setPlanAnnouncements] = useState("");
  const [planAttachmentSize, setPlanAttachmentSize] = useState("");
  const [planFeatures, setPlanFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [planBadgeClass, setPlanBadgeClass] = useState(BADGE_OPTIONS[0].value);
  const [planIsActive, setPlanIsActive] = useState(true);

  const loading = loadingCondos || loadingPlans;

  // Calculate stats based on dynamic plans
  const stats = useMemo(() => {
    const result: Record<string, number> = {};
    plans.forEach(plan => {
      result[plan.slug] = condominiums.filter(c => c.plan === plan.slug).length;
    });
    return result;
  }, [condominiums, plans]);

  // Filtered condominiums
  const filteredCondominiums = useMemo(() => {
    return condominiums.filter((condo) => {
      const matchesSearch = condo.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesPlan = planFilter === "all" || condo.plan === planFilter;
      return matchesSearch && matchesPlan;
    });
  }, [condominiums, searchQuery, planFilter]);

  // Get trial status
  const getTrialStatus = (trialEndsAt: string | null) => {
    if (!trialEndsAt) return { label: "Sem trial", isExpired: true, daysLeft: 0 };
    const daysLeft = differenceInDays(new Date(trialEndsAt), new Date());
    if (daysLeft < 0) {
      return { label: "Expirado", isExpired: true, daysLeft: 0 };
    }
    return {
      label: `${daysLeft} dias`,
      isExpired: false,
      daysLeft,
    };
  };

  // Get plan badge info
  const getPlanBadge = (planSlug: string) => {
    const plan = plans.find(p => p.slug === planSlug);
    if (plan) {
      return { label: plan.name, className: plan.badge_class };
    }
    return { label: planSlug, className: "bg-muted text-muted-foreground" };
  };

  // Format price for display
  const formatPrice = (priceInCents: number) => {
    if (priceInCents === 0) return "Grátis";
    return `R$ ${(priceInCents / 100).toFixed(0)}/mês`;
  };

  // Update condo plan handler
  const handleUpdateCondoPlan = async () => {
    if (!editingCondo || !newCondoPlan) return;

    setUpdatingCondo(true);
    try {
      const { error } = await supabase
        .from("condominiums")
        .update({ plan: newCondoPlan })
        .eq("id", editingCondo.id);

      if (error) throw error;

      const newPlanInfo = getPlanBadge(newCondoPlan);
      toast({
        title: "Plano atualizado",
        description: `${editingCondo.name} agora está no plano ${newPlanInfo.label}`,
      });

      setEditingCondo(null);
      refetchCondos();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar plano",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingCondo(false);
    }
  };

  const openEditCondoDialog = (condo: { id: string; name: string; plan: string }) => {
    setEditingCondo({
      id: condo.id,
      name: condo.name,
      currentPlan: condo.plan,
    });
    setNewCondoPlan(condo.plan);
  };

  // Plan CRUD handlers
  const openNewPlanDialog = () => {
    setEditingPlan(null);
    setPlanName("");
    setPlanSlug("");
    setPlanPrice("0");
    setPlanAnnouncements("10");
    setPlanAttachmentSize("2");
    setPlanFeatures([]);
    setNewFeature("");
    setPlanBadgeClass(BADGE_OPTIONS[0].value);
    setPlanIsActive(true);
    setPlanDialogOpen(true);
  };

  const openEditPlanDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanSlug(plan.slug);
    setPlanPrice(String(plan.price / 100));
    setPlanAnnouncements(String(plan.announcements_per_month));
    setPlanAttachmentSize(String(plan.max_attachment_size_mb));
    setPlanFeatures([...plan.features]);
    setNewFeature("");
    setPlanBadgeClass(plan.badge_class);
    setPlanIsActive(plan.is_active);
    setPlanDialogOpen(true);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setPlanFeatures([...planFeatures, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setPlanFeatures(planFeatures.filter((_, i) => i !== index));
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (!editingPlan && planName) {
      setPlanSlug(generateSlug(planName));
    }
  }, [planName, editingPlan]);

  const handleSavePlan = async () => {
    if (!planName.trim() || !planSlug.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e slug são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setSavingPlan(true);
    
    const planData: CreatePlanInput = {
      name: planName.trim(),
      slug: planSlug.trim().toLowerCase(),
      price: Math.round(parseFloat(planPrice || "0") * 100),
      announcements_per_month: parseInt(planAnnouncements || "10"),
      max_attachment_size_mb: parseInt(planAttachmentSize || "2"),
      features: planFeatures,
      badge_class: planBadgeClass,
      is_active: planIsActive,
    };

    let success = false;
    
    if (editingPlan) {
      const result = await updatePlan({ id: editingPlan.id, ...planData });
      success = result !== null;
    } else {
      const result = await createPlan(planData);
      success = result !== null;
    }

    setSavingPlan(false);
    
    if (success) {
      setPlanDialogOpen(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!deletingPlan) return;
    
    setIsDeleting(true);
    const success = await deletePlan(deletingPlan.slug);
    setIsDeleting(false);
    
    if (success) {
      setDeletingPlan(null);
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
                  to="/super-admin"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-display text-xl font-bold text-foreground">
                    Planos
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={openNewPlanDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Plano
                </Button>
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
              Gerenciador de Planos
            </h1>
            <p className="text-muted-foreground mt-1">
              Crie e gerencie os planos da plataforma
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Plan Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {plans.map((plan) => {
                  const count = stats[plan.slug] || 0;

                  return (
                    <Card
                      key={plan.id}
                      className={`relative overflow-hidden ${
                        !plan.is_active ? "opacity-60" : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className={plan.badge_class}>
                            {plan.name}
                            {!plan.is_active && " (Inativo)"}
                          </Badge>
                          <span className="text-2xl font-bold text-foreground">
                            {formatPrice(plan.price)}
                          </span>
                        </div>
                        <CardTitle className="text-4xl font-display mt-2">
                          {count}
                        </CardTitle>
                        <CardDescription>
                          {count === 1 ? "condomínio" : "condomínios"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                          {plan.features.slice(0, 5).map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                          {plan.features.length > 5 && (
                            <li className="text-xs text-muted-foreground">
                              +{plan.features.length - 5} mais...
                            </li>
                          )}
                        </ul>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openEditPlanDialog(plan)}
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeletingPlan(plan)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Condominiums Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Condomínios</CardTitle>
                  <CardDescription>
                    Gerencie os planos de cada condomínio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar condomínio..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={planFilter} onValueChange={setPlanFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os planos</SelectItem>
                        {plans.map((plan) => (
                          <SelectItem key={plan.slug} value={plan.slug}>
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead className="hidden md:table-cell">Trial</TableHead>
                          <TableHead className="hidden md:table-cell">Criado em</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCondominiums.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-8 text-muted-foreground"
                            >
                              Nenhum condomínio encontrado
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredCondominiums.map((condo) => {
                            const trial = getTrialStatus(condo.trial_ends_at);
                            const badge = getPlanBadge(condo.plan);

                            return (
                              <TableRow key={condo.id}>
                                <TableCell className="font-medium">
                                  <div className="flex flex-col">
                                    <span>{condo.name}</span>
                                    <span className="text-xs text-muted-foreground md:hidden">
                                      Trial: {trial.label}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={badge.className}>
                                    {badge.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <div className="flex items-center gap-1">
                                    {trial.daysLeft <= 14 && !trial.isExpired && (
                                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    )}
                                    <span
                                      className={
                                        trial.isExpired
                                          ? "text-destructive"
                                          : trial.daysLeft <= 14
                                          ? "text-amber-600"
                                          : "text-muted-foreground"
                                      }
                                    >
                                      {trial.label}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-muted-foreground">
                                  {format(new Date(condo.created_at), "dd/MM/yyyy", {
                                    locale: ptBR,
                                  })}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditCondoDialog(condo)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                    <span className="sr-only">Editar plano</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>

        <MobileBottomNav items={superAdminNavItems} />

        {/* Edit Condo Plan Dialog */}
        <Dialog open={!!editingCondo} onOpenChange={() => setEditingCondo(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Plano</DialogTitle>
              <DialogDescription>
                Altere o plano de {editingCondo?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Label className="mb-2 block">Novo Plano</Label>
              <Select value={newCondoPlan} onValueChange={setNewCondoPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.slug} value={plan.slug}>
                      {plan.name} - {formatPrice(plan.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {editingCondo && newCondoPlan !== editingCondo.currentPlan && (
                <p className="text-sm text-muted-foreground mt-3">
                  Alterando de{" "}
                  <Badge className={getPlanBadge(editingCondo.currentPlan).className}>
                    {getPlanBadge(editingCondo.currentPlan).label}
                  </Badge>{" "}
                  para{" "}
                  <Badge className={getPlanBadge(newCondoPlan).className}>
                    {getPlanBadge(newCondoPlan).label}
                  </Badge>
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCondo(null)}>
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateCondoPlan}
                disabled={
                  updatingCondo ||
                  (editingCondo && newCondoPlan === editingCondo.currentPlan)
                }
              >
                {updatingCondo ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create/Edit Plan Dialog */}
        <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Editar Plano" : "Novo Plano"}
              </DialogTitle>
              <DialogDescription>
                {editingPlan
                  ? "Atualize as informações do plano"
                  : "Crie um novo plano de assinatura"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Nome do plano *</Label>
                <Input
                  id="plan-name"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Ex: Empresarial"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-slug">Slug (identificador) *</Label>
                <Input
                  id="plan-slug"
                  value={planSlug}
                  onChange={(e) => setPlanSlug(e.target.value)}
                  placeholder="Ex: enterprise"
                  disabled={!!editingPlan}
                />
                {editingPlan && (
                  <p className="text-xs text-muted-foreground">
                    O slug não pode ser alterado após a criação
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan-price">Preço (R$/mês)</Label>
                  <Input
                    id="plan-price"
                    type="number"
                    min="0"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan-announcements">Avisos/mês</Label>
                  <Input
                    id="plan-announcements"
                    type="number"
                    min="-1"
                    value={planAnnouncements}
                    onChange={(e) => setPlanAnnouncements(e.target.value)}
                    placeholder="10 (-1 = ilimitado)"
                  />
                  <p className="text-xs text-muted-foreground">-1 = ilimitado</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-attachment">Tamanho máx. anexo (MB)</Label>
                <Input
                  id="plan-attachment"
                  type="number"
                  min="1"
                  value={planAttachmentSize}
                  onChange={(e) => setPlanAttachmentSize(e.target.value)}
                  placeholder="2"
                />
              </div>

              <div className="space-y-2">
                <Label>Features</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Ex: Suporte prioritário"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddFeature} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1 mt-2">
                  {planFeatures.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm bg-muted px-3 py-1.5 rounded"
                    >
                      <Check className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="flex-1">{feature}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor do badge</Label>
                <Select value={planBadgeClass} onValueChange={setPlanBadgeClass}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BADGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Badge className={option.value}>{option.label}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2">
                  <Badge className={planBadgeClass}>{planName || "Preview"}</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Plano ativo</Label>
                  <p className="text-xs text-muted-foreground">
                    Planos inativos não aparecem para novos usuários
                  </p>
                </div>
                <Switch checked={planIsActive} onCheckedChange={setPlanIsActive} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSavePlan} disabled={savingPlan}>
                {savingPlan ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir plano?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o plano "{deletingPlan?.name}"?
                Esta ação não poderá ser desfeita.
                {stats[deletingPlan?.slug || ""] > 0 && (
                  <span className="block mt-2 text-destructive font-medium">
                    Atenção: {stats[deletingPlan?.slug || ""]} condomínio(s) usam este plano.
                    Você precisará migrá-los antes de excluir.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePlan}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
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
      </div>
    </SuperAdminGuard>
  );
}
