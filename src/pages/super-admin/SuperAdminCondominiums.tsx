import { useState } from "react";
import { Link } from "react-router-dom";
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
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useAllCondominiums } from "@/hooks/useAllCondominiums";
import { useAllUsers } from "@/hooks/useAllUsers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Building2, Plus, ArrowLeft, Loader2, Pencil, Trash2, ExternalLink, Search, Users, LayoutDashboard, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshButton } from "@/components/RefreshButton";
import { MobileBottomNav, MobileNavItem } from "@/components/mobile/MobileBottomNav";
import { MobileCardItem } from "@/components/mobile/MobileCardItem";
import { useIsMobile } from "@/hooks/use-mobile";

const superAdminNavItems: MobileNavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/super-admin" },
  { icon: Building2, label: "Condos", path: "/super-admin/condominiums" },
  { icon: Users, label: "Usuários", path: "/super-admin/users" },
  { icon: FileText, label: "Timelines", path: "/super-admin/timelines" },
  { icon: Bell, label: "Notificações", path: "/super-admin/notifications" },
];

export default function SuperAdminCondominiums() {
  const { condominiums, loading, refetch } = useAllCondominiums();
  const { users } = useAllUsers();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCondo, setSelectedCondo] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    owner_id: "",
    plan: "free" as "free" | "starter" | "pro",
  });
  const [saving, setSaving] = useState(false);

  const filteredCondos = condominiums.filter(condo =>
    condo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    condo.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    condo.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: "", description: "", owner_id: "", plan: "free" });
    setSelectedCondo(null);
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
        });

      if (error) throw error;

      toast({ title: "Condomínio criado com sucesso!" });
      setCreateDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error("Error creating condominium:", error);
      toast({ title: "Erro ao criar condomínio", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCondo || !formData.name.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("condominiums")
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          owner_id: formData.owner_id,
          plan: formData.plan,
        })
        .eq("id", selectedCondo.id);

      if (error) throw error;

      toast({ title: "Condomínio atualizado!" });
      setEditDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error("Error updating condominium:", error);
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (condo: any) => {
    if (!confirm(`Tem certeza que deseja excluir "${condo.name}"? Esta ação é irreversível.`)) return;

    try {
      const { error } = await supabase
        .from("condominiums")
        .delete()
        .eq("id", condo.id);

      if (error) throw error;

      toast({ title: "Condomínio excluído!" });
      refetch();
    } catch (error: any) {
      console.error("Error deleting condominium:", error);
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    }
  };

  const openEditDialog = (condo: any) => {
    setSelectedCondo(condo);
    setFormData({
      name: condo.name,
      description: condo.description || "",
      owner_id: condo.owner_id,
      plan: condo.plan,
    });
    setEditDialogOpen(true);
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
                    <Building2 className="w-5 h-5 text-destructive-foreground" />
                  </div>
                  <span className="font-display text-xl font-bold text-foreground">Condomínios</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <RefreshButton />

                <Dialog open={createDialogOpen} onOpenChange={(open) => { setCreateDialogOpen(open); if (!open) resetForm(); }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card">
                    <DialogHeader>
                      <DialogTitle>Criar Condomínio</DialogTitle>
                      <DialogDescription>Crie um novo condomínio para qualquer usuário</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Nome *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Nome do condomínio"
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
                        <Select value={formData.plan} onValueChange={(v: any) => setFormData({ ...formData, plan: v })}>
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
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container px-4 mx-auto py-8">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : isMobile ? (
            /* Mobile: Cards */
            <div className="space-y-4">
              {filteredCondos.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  Nenhum condomínio encontrado
                </Card>
              ) : (
                filteredCondos.map((condo) => (
                  <MobileCardItem
                    key={condo.id}
                    title={condo.name}
                    subtitle={condo.slug}
                    metadata={
                      <code className="text-xs bg-primary/10 text-primary font-bold px-2 py-1 rounded">
                        {condo.code}
                      </code>
                    }
                    badges={
                      <>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                          condo.plan === "pro" ? "bg-primary/10 text-primary" :
                          condo.plan === "starter" ? "bg-accent text-accent-foreground" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {condo.plan}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(condo.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </>
                    }
                    actions={
                      <>
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/c/${condo.slug}`} target="_blank">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/super-admin/condominiums/${condo.id}/members`}>
                            <Users className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(condo)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(condo)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </>
                    }
                  >
                    <p className="text-sm text-muted-foreground">
                      {condo.owner?.full_name || condo.owner?.email || "Sem proprietário"}
                    </p>
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
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Proprietário</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCondos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum condomínio encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCondos.map((condo) => (
                      <TableRow key={condo.id}>
                        <TableCell>
                          <code className="text-sm bg-primary/10 text-primary font-bold px-2 py-1 rounded">
                            {condo.code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{condo.name}</div>
                            <div className="text-sm text-muted-foreground">{condo.slug}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{condo.owner?.full_name || "—"}</div>
                            <div className="text-muted-foreground">{condo.owner?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                            condo.plan === "pro" ? "bg-primary/10 text-primary" :
                            condo.plan === "starter" ? "bg-accent text-accent-foreground" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {condo.plan}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(condo.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button asChild variant="ghost" size="icon" title="Ver Timeline">
                              <Link to={`/c/${condo.slug}`} target="_blank">
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button asChild variant="ghost" size="icon" title="Gerenciar Membros">
                              <Link to={`/super-admin/condominiums/${condo.id}/members`}>
                                <Users className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(condo)} title="Editar">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(condo)} title="Excluir">
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

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Editar Condomínio</DialogTitle>
              <DialogDescription>Atualize as informações do condomínio</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Proprietário *</Label>
                <Select value={formData.owner_id} onValueChange={(v) => setFormData({ ...formData, owner_id: v })}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Select value={formData.plan} onValueChange={(v: any) => setFormData({ ...formData, plan: v })}>
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
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving || !formData.name.trim()}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Salvar
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
