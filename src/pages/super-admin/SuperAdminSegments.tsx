import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SuperAdminGuard } from "@/components/SuperAdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useAllUsers } from "@/hooks/useAllUsers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, ArrowLeft, Loader2, Plus, Eye, LayoutDashboard, Building2, Users, FileText, Grid3X3 } from "lucide-react";
import { RefreshButton } from "@/components/RefreshButton";
import { MobileBottomNav, MobileNavItem } from "@/components/mobile/MobileBottomNav";
import { 
  ORGANIZATION_TYPES, 
  ORGANIZATION_TYPE_OPTIONS, 
  type OrganizationType 
} from "@/lib/organization-types";
import { useAuth } from "@/hooks/useAuth";

const superAdminNavItems: MobileNavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/super-admin" },
  { icon: Grid3X3, label: "Segmentos", path: "/super-admin/segments" },
  { icon: Building2, label: "Orgs", path: "/super-admin/condominiums" },
  { icon: Users, label: "Usuários", path: "/super-admin/users" },
  { icon: Bell, label: "Notif.", path: "/super-admin/notifications" },
];

export default function SuperAdminSegments() {
  const { signOut } = useAuth();
  const { condominiums, loading, refetch } = useAllCondominiums();
  const { users } = useAllUsers();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<OrganizationType>("condominium");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    owner_id: "",
    plan: "free" as "free" | "starter" | "pro",
    organization_type: "condominium" as OrganizationType,
  });
  const [saving, setSaving] = useState(false);

  // Calculate stats per segment
  const segmentStats = ORGANIZATION_TYPE_OPTIONS.map(option => {
    const count = condominiums.filter(
      c => (c.organization_type || "condominium") === option.value
    ).length;
    return { ...option, count };
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      owner_id: "",
      plan: "free",
      organization_type: selectedType,
    });
  };

  const openCreateDialog = (type: OrganizationType) => {
    setSelectedType(type);
    setFormData(prev => ({ ...prev, organization_type: type }));
    setCreateDialogOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.owner_id) return;

    setSaving(true);
    try {
      const { data: slugData, error: slugError } = await supabase
        .rpc("generate_unique_slug", { base_name: formData.name });

      if (slugError) throw slugError;

      const { error } = await supabase
        .from("condominiums")
        .insert({
          name: formData.name.trim(),
          slug: slugData,
          description: formData.description.trim() || null,
          owner_id: formData.owner_id,
          plan: formData.plan,
          organization_type: formData.organization_type,
        });

      if (error) throw error;

      const config = ORGANIZATION_TYPES[formData.organization_type];
      toast({ title: `${config.terms.organization} criado com sucesso!` });
      setCreateDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error("Error creating organization:", error);
      toast({ title: "Erro ao criar organização", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleViewSegment = (type: OrganizationType) => {
    navigate(`/super-admin/condominiums?type=${type}`);
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
                  <div className="w-9 h-9 rounded-lg bg-destructive flex items-center justify-center">
                    <Grid3X3 className="w-5 h-5 text-destructive-foreground" />
                  </div>
                  <span className="font-display text-xl font-bold text-foreground">Segmentos</span>
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
              Segmentos de Organização
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie e crie organizações por categoria
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {segmentStats.map((segment) => {
                const Icon = segment.icon;
                return (
                  <Card key={segment.value} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-3">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <CardTitle className="font-display text-xl">{segment.label}</CardTitle>
                      <CardDescription>{segment.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl font-bold text-foreground">{segment.count}</span>
                        <span className="text-sm text-muted-foreground">
                          {segment.count === 1 ? "organização" : "organizações"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">
                        {segment.examples}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewSegment(segment.value)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={() => openCreateDialog(segment.value)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Criar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={(open) => { setCreateDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>
                Criar {ORGANIZATION_TYPES[formData.organization_type]?.terms.organization || "Organização"}
              </DialogTitle>
              <DialogDescription>
                Crie uma nova organização do tipo {ORGANIZATION_TYPES[formData.organization_type]?.label}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Tipo de Organização *</Label>
                <Select 
                  value={formData.organization_type} 
                  onValueChange={(v: OrganizationType) => setFormData({ ...formData, organization_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORGANIZATION_TYPE_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={`Nome da ${ORGANIZATION_TYPES[formData.organization_type]?.terms.organization.toLowerCase() || "organização"}`}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Proprietário *</Label>
                <Select value={formData.owner_id} onValueChange={(v) => setFormData({ ...formData, owner_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o proprietário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email || "Sem nome"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plano</Label>
                <Select value={formData.plan} onValueChange={(v: "free" | "starter" | "pro") => setFormData({ ...formData, plan: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving || !formData.name.trim() || !formData.owner_id}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Criar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <MobileBottomNav items={superAdminNavItems} />
      </div>
    </SuperAdminGuard>
  );
}
