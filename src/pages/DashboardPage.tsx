import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { MobileBottomNav, MobileNavItem } from "@/components/mobile/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Building2, LogOut, Plus, FileText, Settings, Loader2, ExternalLink, Shield, User, ChevronDown, Users, Grid3X3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { RefreshButton } from "@/components/RefreshButton";
import { PendingApprovalScreen } from "@/components/PendingApprovalScreen";
import { getOrganizationIcon, getOrganizationTerms, ORGANIZATION_TYPE_OPTIONS, OrganizationType } from "@/lib/organization-types";
import { useAllCondominiums } from "@/hooks/useAllCondominiums";

// Role labels and styles
const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  syndic: "Síndico",
  collaborator: "Colaborador",
  resident: "Morador",
};

const roleStyles: Record<string, string> = {
  owner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  admin: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  syndic: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  collaborator: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  resident: "bg-muted text-muted-foreground",
};

// Permission helper functions
const canManageAnnouncements = (role?: string) =>
  ['owner', 'admin', 'syndic', 'collaborator'].includes(role || '');

const canAccessSettings = (role?: string) =>
  ['owner', 'admin', 'syndic'].includes(role || '');

const isResidentOnly = (role?: string) => role === 'resident';

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, condominiums, pendingRoles, loading: profileLoading, refetch } = useProfile();
  const { isSuperAdmin } = useSuperAdmin();
  const { condominiums: allCondominiums } = useAllCondominiums();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const totalOrganizations = allCondominiums.length;

  // Check if user is only a resident (no admin roles)
  const hasOnlyResidentRoles = condominiums.length > 0 && 
    condominiums.every(c => c.userRole === 'resident');

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [selectedOrgType, setSelectedOrgType] = useState<OrganizationType>("condominium");
  const [newCondoName, setNewCondoName] = useState("");
  const [newCondoDescription, setNewCondoDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const selectedTerms = getOrganizationTerms(selectedOrgType);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleCreateCondominium = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newCondoName.trim()) return;

    setCreating(true);
    try {
      // Generate slug
      const { data: slugData, error: slugError } = await supabase
        .rpc("generate_unique_slug", { base_name: newCondoName });

      if (slugError) throw slugError;

      // Create condominium
      const { data, error } = await supabase
        .from("condominiums")
        .insert({
          name: newCondoName.trim(),
          slug: slugData,
          description: newCondoDescription.trim() || null,
          owner_id: profile.id,
          organization_type: selectedOrgType,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: `${selectedTerms.organization} criado!`,
        description: `${selectedTerms.organization} foi criado com sucesso.`,
      });

      setCreateDialogOpen(false);
      setNewCondoName("");
      setNewCondoDescription("");
      
      // Navigate to the new condominium
      navigate(`/admin/${data.id}`);
    } catch (error: any) {
      console.error("Error creating condominium:", error);
      toast({
        title: "Erro ao criar condomínio",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show pending approval screen if user has only pending roles
  if (pendingRoles.length > 0 && condominiums.length === 0 && !isSuperAdmin) {
    return (
      <PendingApprovalScreen
        pendingRoles={pendingRoles}
        onSignOut={handleSignOut}
        onRefresh={refetch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background has-bottom-nav">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">AVISO PRO</span>
            </Link>

            <div className="flex items-center gap-4">
              {isSuperAdmin && (
                <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                  <Link to="/super-admin">
                    <Shield className="w-4 h-4 mr-2" />
                    Super Admin
                  </Link>
                </Button>
              )}
              <RefreshButton />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">
                      {profile?.full_name?.split(" ")[0] || "Usuário"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 mx-auto py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Olá, {profile?.full_name?.split(" ")[0] || "Usuário"}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {hasOnlyResidentRoles 
                ? "Veja os avisos do seu condomínio"
                : "Gerencie seus condomínios e avisos"}
            </p>
          </div>

          {isSuperAdmin && (
            <>
              {/* Type Picker Dialog */}
              <Dialog open={typePickerOpen} onOpenChange={setTypePickerOpen}>
                <DialogTrigger asChild>
                  <Button className="touch-target">
                    <Plus className="w-5 h-5 mr-2" />
                    Nova Organização
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-display">Escolha o tipo de organização</DialogTitle>
                    <DialogDescription>
                      Selecione o segmento para adaptar a terminologia e funcionalidades
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {ORGANIZATION_TYPE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          className="flex flex-col items-start gap-1 rounded-lg border border-border p-4 text-left hover:bg-accent hover:border-primary transition-colors"
                          onClick={() => {
                            setSelectedOrgType(opt.value);
                            setTypePickerOpen(false);
                            setCreateDialogOpen(true);
                          }}
                        >
                          <Icon className="w-6 h-6 text-primary mb-1" />
                          <span className="font-semibold text-sm text-foreground">{opt.label}</span>
                          <span className="text-xs text-muted-foreground">{opt.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Create Form Dialog */}
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="bg-card">
                  <DialogHeader>
                    <DialogTitle className="font-display">Criar {selectedTerms.organization.toLowerCase()}</DialogTitle>
                    <DialogDescription>
                      Preencha as informações básicas
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCondominium} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="condoName">Nome *</Label>
                      <Input
                        id="condoName"
                        placeholder={`Ex: ${selectedTerms.organization} Exemplo`}
                        value={newCondoName}
                        onChange={(e) => setNewCondoName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condoDescription">Descrição (opcional)</Label>
                      <Textarea
                        id="condoDescription"
                        placeholder="Uma breve descrição..."
                        value={newCondoDescription}
                        onChange={(e) => setNewCondoDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={creating || !newCondoName.trim()}>
                        {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Criar {selectedTerms.organization.toLowerCase()}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {/* Segments Card - Super Admin Only */}
        {isSuperAdmin && (
          <Card className="mb-8 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                <Grid3X3 className="w-6 h-6 text-primary" />
              </div>
              
              <h3 className="font-display text-xl font-bold mb-1">
                Segmentos de Organização
              </h3>
              <p className="text-muted-foreground mb-4">
                Visualize e crie organizações por categoria: Condomínios, Clínicas, Empresas, etc.
              </p>
              
              <div className="flex gap-2 mb-4">
                <Badge variant="secondary" className="bg-muted">6 categorias</Badge>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  {totalOrganizations} organizações
                </Badge>
              </div>
              
              <Button asChild className="w-full">
                <Link to="/super-admin/segments">
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Ver Segmentos
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Condominiums Grid */}
        {condominiums.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-2xl bg-accent mx-auto flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Nenhum condomínio cadastrado</h3>
              <p className="text-muted-foreground mb-6">
                {isSuperAdmin 
                  ? "Crie seu primeiro condomínio para começar a publicar avisos"
                  : "Você ainda não está vinculado a nenhum condomínio. Entre em contato com o administrador."}
              </p>
              {isSuperAdmin && (
                <Button onClick={() => setTypePickerOpen(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Criar minha primeira organização
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {condominiums.map((condo) => {
              const OrgIcon = getOrganizationIcon(condo.organization_type);
              const terms = getOrganizationTerms(condo.organization_type);
              
              return (
                <Card key={condo.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                        <OrgIcon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                        {condo.plan}
                      </span>
                    </div>
                    <CardTitle className="font-display mt-3">{condo.name}</CardTitle>
                    <Badge className={`${roleStyles[condo.userRole || "resident"]} mt-1`} variant="secondary">
                      {roleLabels[condo.userRole || "resident"]}
                    </Badge>
                    {condo.description && (
                      <CardDescription className="line-clamp-2 mt-2">{condo.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {condo.organization_type === 'real_estate' && canManageAnnouncements(condo.userRole) ? (
                        <Button asChild className="w-full touch-target">
                          <Link to={`/imobiliaria/${condo.id}`}>
                            <Building2 className="w-4 h-4 mr-2" />
                            Abrir CRM Imobiliário
                          </Link>
                        </Button>
                      ) : canManageAnnouncements(condo.userRole) ? (
                        <Button asChild className="w-full touch-target">
                          <Link to={`/admin/${condo.id}`}>
                            <FileText className="w-4 h-4 mr-2" />
                            {condo.userRole === 'collaborator' ? 'Criar avisos' : 'Gerenciar avisos'}
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild className="w-full touch-target">
                          <Link to={`/c/${condo.slug}`} target="_blank">
                            <FileText className="w-4 h-4 mr-2" />
                            Ver avisos
                          </Link>
                        </Button>
                      )}
                      {canAccessSettings(condo.userRole) && (
                        <div className="flex gap-2">
                          <Button asChild variant="outline" className="flex-1">
                            <Link to={`/admin/${condo.id}/settings`}>
                              <Settings className="w-4 h-4 mr-1" />
                              Config
                            </Link>
                          </Button>
                          <Button asChild variant="outline" className="flex-1">
                            <Link to={`/admin/${condo.id}/members`}>
                              <Users className="w-4 h-4 mr-1" />
                              {terms.memberPlural}
                            </Link>
                          </Button>
                          <Button asChild variant="outline" className="flex-1">
                            <Link to={`/c/${condo.slug}`} target="_blank">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Ver timeline
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        {/* Mobile Bottom Nav */}
        {isSuperAdmin ? (
          <MobileBottomNav items={[
            { icon: Building2, label: "Orgs", path: "/dashboard" },
            { icon: Shield, label: "Super Admin", path: "/super-admin" },
            { icon: User, label: "Perfil", path: "/profile" },
          ]} />
        ) : (
          <MobileBottomNav items={[
            { icon: Building2, label: "Orgs", path: "/dashboard" },
            { icon: User, label: "Perfil", path: "/profile" },
          ]} />
        )}
      </main>
    </div>
  );
}
