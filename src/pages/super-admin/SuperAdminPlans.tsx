import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { SuperAdminGuard } from "@/components/SuperAdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useAllCondominiums } from "@/hooks/useAllCondominiums";
import { useAuth } from "@/hooks/useAuth";
import { PLANS, PlanType } from "@/lib/constants";
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

const PLAN_BADGES: Record<PlanType, { label: string; className: string }> = {
  free: { label: "Gratuito", className: "bg-muted text-muted-foreground" },
  starter: { label: "Inicial", className: "bg-amber-100 text-amber-700" },
  pro: { label: "Profissional", className: "bg-primary/10 text-primary" },
};

export default function SuperAdminPlans() {
  const { signOut } = useAuth();
  const { condominiums, loading, refetch } = useAllCondominiums();
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [editingCondo, setEditingCondo] = useState<{
    id: string;
    name: string;
    currentPlan: PlanType;
  } | null>(null);
  const [newPlan, setNewPlan] = useState<PlanType>("free");
  const [updating, setUpdating] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      free: condominiums.filter((c) => c.plan === "free").length,
      starter: condominiums.filter((c) => c.plan === "starter").length,
      pro: condominiums.filter((c) => c.plan === "pro").length,
    };
  }, [condominiums]);

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

  // Update plan handler
  const handleUpdatePlan = async () => {
    if (!editingCondo) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("condominiums")
        .update({ plan: newPlan })
        .eq("id", editingCondo.id);

      if (error) throw error;

      toast({
        title: "Plano atualizado",
        description: `${editingCondo.name} agora está no plano ${PLAN_BADGES[newPlan].label}`,
      });

      setEditingCondo(null);
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar plano",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const openEditDialog = (condo: {
    id: string;
    name: string;
    plan: PlanType;
  }) => {
    setEditingCondo({
      id: condo.id,
      name: condo.name,
      currentPlan: condo.plan,
    });
    setNewPlan(condo.plan);
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
              Visualize e gerencie os planos dos condomínios
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Plan Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {(Object.keys(PLANS) as PlanType[]).map((planKey) => {
                  const plan = PLANS[planKey];
                  const count = stats[planKey];
                  const badge = PLAN_BADGES[planKey];

                  return (
                    <Card
                      key={planKey}
                      className={`relative overflow-hidden ${
                        planKey === "pro"
                          ? "border-primary/50 shadow-lg"
                          : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className={badge.className}>{badge.label}</Badge>
                          <span className="text-2xl font-bold text-foreground">
                            {plan.price === 0
                              ? "Grátis"
                              : `R$ ${plan.price}/mês`}
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
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
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
                        <SelectItem value="free">Gratuito</SelectItem>
                        <SelectItem value="starter">Inicial</SelectItem>
                        <SelectItem value="pro">Profissional</SelectItem>
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
                            const badge = PLAN_BADGES[condo.plan];

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
                                    onClick={() => openEditDialog(condo)}
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

        {/* Edit Plan Dialog */}
        <Dialog open={!!editingCondo} onOpenChange={() => setEditingCondo(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Plano</DialogTitle>
              <DialogDescription>
                Altere o plano de {editingCondo?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <label className="text-sm font-medium mb-2 block">
                Novo Plano
              </label>
              <Select
                value={newPlan}
                onValueChange={(value) => setNewPlan(value as PlanType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratuito - R$ 0/mês</SelectItem>
                  <SelectItem value="starter">Inicial - R$ 199/mês</SelectItem>
                  <SelectItem value="pro">Profissional - R$ 299/mês</SelectItem>
                </SelectContent>
              </Select>

              {editingCondo && newPlan !== editingCondo.currentPlan && (
                <p className="text-sm text-muted-foreground mt-3">
                  Alterando de{" "}
                  <Badge className={PLAN_BADGES[editingCondo.currentPlan].className}>
                    {PLAN_BADGES[editingCondo.currentPlan].label}
                  </Badge>{" "}
                  para{" "}
                  <Badge className={PLAN_BADGES[newPlan].className}>
                    {PLAN_BADGES[newPlan].label}
                  </Badge>
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCondo(null)}>
                Cancelar
              </Button>
              <Button
                onClick={handleUpdatePlan}
                disabled={
                  updating ||
                  (editingCondo && newPlan === editingCondo.currentPlan)
                }
              >
                {updating ? (
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
      </div>
    </SuperAdminGuard>
  );
}
