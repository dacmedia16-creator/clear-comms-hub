import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Bell, Building2, LogOut, Plus, FileText, Settings, Loader2, ExternalLink, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, condominiums, loading: profileLoading } = useProfile();
  const { isSuperAdmin } = useSuperAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCondoName, setNewCondoName] = useState("");
  const [newCondoDescription, setNewCondoDescription] = useState("");
  const [creating, setCreating] = useState(false);

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
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Condomínio criado!",
        description: "Seu condomínio foi criado com sucesso.",
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">AVISO CD</span>
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
              <span className="text-sm text-muted-foreground hidden sm:block">
                {profile?.full_name || profile?.email}
              </span>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 mx-auto py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Olá, {profile?.full_name?.split(" ")[0] || "Síndico"}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus condomínios e avisos
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="touch-target">
                <Plus className="w-5 h-5 mr-2" />
                Novo Condomínio
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle className="font-display">Criar novo condomínio</DialogTitle>
                <DialogDescription>
                  Preencha as informações básicas do seu condomínio
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCondominium} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="condoName">Nome do condomínio *</Label>
                  <Input
                    id="condoName"
                    placeholder="Ex: Residencial Jardins"
                    value={newCondoName}
                    onChange={(e) => setNewCondoName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condoDescription">Descrição (opcional)</Label>
                  <Textarea
                    id="condoDescription"
                    placeholder="Uma breve descrição do condomínio..."
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
                    Criar condomínio
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Condominiums Grid */}
        {condominiums.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-2xl bg-accent mx-auto flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Nenhum condomínio cadastrado</h3>
              <p className="text-muted-foreground mb-6">
                Crie seu primeiro condomínio para começar a publicar avisos
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Criar meu primeiro condomínio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {condominiums.map((condo) => (
              <Card key={condo.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                      {condo.plan}
                    </span>
                  </div>
                  <CardTitle className="font-display mt-3">{condo.name}</CardTitle>
                  {condo.description && (
                    <CardDescription className="line-clamp-2">{condo.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <Button asChild className="w-full touch-target">
                      <Link to={`/admin/${condo.id}`}>
                        <FileText className="w-4 h-4 mr-2" />
                        Gerenciar avisos
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link to={`/admin/${condo.id}/settings`}>
                          <Settings className="w-4 h-4 mr-1" />
                          Config
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="flex-1">
                        <Link to={`/c/${condo.slug}`} target="_blank">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Ver timeline
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
