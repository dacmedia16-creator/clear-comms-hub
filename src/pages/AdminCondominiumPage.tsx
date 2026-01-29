import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Bell, 
  Plus, 
  Loader2, 
  Pin, 
  Trash2, 
  Edit, 
  ExternalLink,
  AlertTriangle,
  Clock,
  CheckCircle,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ANNOUNCEMENT_CATEGORIES, AnnouncementCategory } from "@/lib/constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshButton } from "@/components/RefreshButton";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { generateWhatsAppMessage, openWhatsAppShare } from "@/lib/whatsapp-templates";

interface Announcement {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  category: AnnouncementCategory;
  is_pinned: boolean;
  is_urgent: boolean;
  published_at: string;
  created_at: string;
}

interface Condominium {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export default function AdminCondominiumPage() {
  const { condoId } = useParams<{ condoId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [condominium, setCondominium] = useState<Condominium | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [lastCreatedAnnouncement, setLastCreatedAnnouncement] = useState<Announcement | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<AnnouncementCategory>("informativo");
  const [isPinned, setIsPinned] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function loadData() {
      if (!condoId || !user) return;

      try {
        // Load condominium
        const { data: condoData, error: condoError } = await supabase
          .from("condominiums")
          .select("*")
          .eq("id", condoId)
          .single();

        if (condoError) throw condoError;
        setCondominium(condoData);

        // Load announcements
        const { data: announcementsData, error: announcementsError } = await supabase
          .from("announcements")
          .select("*")
          .eq("condominium_id", condoId)
          .order("is_pinned", { ascending: false })
          .order("published_at", { ascending: false });

        if (announcementsError) throw announcementsError;
        setAnnouncements(announcementsData || []);
      } catch (error: any) {
        console.error("Error loading data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: error.message,
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [condoId, user, navigate, toast]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condominium || !title.trim() || !content.trim()) return;

    setCreating(true);
    try {
      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user!.id)
        .single();

      if (!profile) throw new Error("Perfil não encontrado");

      // Create announcement
      const { data, error } = await supabase
        .from("announcements")
        .insert({
          condominium_id: condominium.id,
          title: title.trim(),
          summary: summary.trim() || null,
          content: content.trim(),
          category,
          is_pinned: isPinned,
          is_urgent: isUrgent || category === "urgente",
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      setAnnouncements((prev) => [data, ...prev]);
      setLastCreatedAnnouncement(data);

      // Reset form
      setCreateDialogOpen(false);
      setTitle("");
      setSummary("");
      setContent("");
      setCategory("informativo");
      setIsPinned(false);
      setIsUrgent(false);

      // Show success dialog with share option
      setSuccessDialogOpen(true);
    } catch (error: any) {
      console.error("Error creating announcement:", error);
      toast({
        title: "Erro ao publicar aviso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ is_pinned: !announcement.is_pinned })
        .eq("id", announcement.id);

      if (error) throw error;

      setAnnouncements((prev) =>
        prev.map((a) => (a.id === announcement.id ? { ...a, is_pinned: !a.is_pinned } : a))
      );
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar aviso",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (announcementId: string) => {
    if (!confirm("Tem certeza que deseja excluir este aviso?")) return;

    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", announcementId);

      if (error) throw error;

      setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
      toast({
        title: "Aviso excluído",
        description: "O aviso foi removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir aviso",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!condominium) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container px-4 mx-auto">
          <div className="flex items-center gap-4 h-16">
            <Button asChild variant="ghost" size="icon">
              <Link to="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-lg truncate">{condominium.name}</h1>
              <p className="text-sm text-muted-foreground">Gerenciar avisos</p>
            </div>
            <div className="flex items-center gap-2">
              <RefreshButton />
              <Button asChild variant="outline" size="sm">
                <Link to={`/c/${condominium.slug}`} target="_blank">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Ver timeline
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-semibold">Avisos</h2>
            <p className="text-sm text-muted-foreground">{announcements.length} avisos publicados</p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="touch-target">
                <Plus className="w-5 h-5 mr-2" />
                Novo Aviso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
              <DialogHeader>
                <DialogTitle className="font-display">Criar novo aviso</DialogTitle>
                <DialogDescription>
                  Preencha as informações do aviso para publicar
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do aviso *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Manutenção dos elevadores"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as AnnouncementCategory)}>
                    <SelectTrigger id="category" className="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      {Object.entries(ANNOUNCEMENT_CATEGORIES).map(([key, cat]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="w-4 h-4" />
                            <span>{cat.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Resumo curto (opcional)</Label>
                  <Input
                    id="summary"
                    placeholder="Uma frase resumindo o aviso..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo completo *</Label>
                  <Textarea
                    id="content"
                    placeholder="Escreva o conteúdo completo do aviso..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 py-2">
                  <div className="flex items-center gap-2">
                    <Switch id="pinned" checked={isPinned} onCheckedChange={setIsPinned} />
                    <Label htmlFor="pinned" className="cursor-pointer">
                      Fixar no topo
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="urgent" checked={isUrgent} onCheckedChange={setIsUrgent} />
                    <Label htmlFor="urgent" className="cursor-pointer">
                      Marcar como urgente
                    </Label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creating || !title.trim() || !content.trim()}>
                    {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Publicar aviso
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-2xl bg-accent mx-auto flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Nenhum aviso publicado</h3>
              <p className="text-muted-foreground mb-6">
                Crie seu primeiro aviso para informar os moradores
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Criar primeiro aviso
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => {
              const categoryInfo = ANNOUNCEMENT_CATEGORIES[announcement.category];
              const Icon = categoryInfo.icon;

              return (
                <Card 
                  key={announcement.id} 
                  className={`${announcement.is_urgent ? "border-destructive bg-destructive/5" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryInfo.bgClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${categoryInfo.badgeClass}`}>
                              {categoryInfo.label}
                            </span>
                            {announcement.is_pinned && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded bg-accent text-accent-foreground flex items-center gap-1">
                                <Pin className="w-3 h-3" />
                                Fixado
                              </span>
                            )}
                            {announcement.is_urgent && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded bg-destructive text-destructive-foreground flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Urgente
                              </span>
                            )}
                          </div>
                          <CardTitle className="font-display text-lg">{announcement.title}</CardTitle>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {format(new Date(announcement.published_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <WhatsAppShareButton
                          announcement={announcement}
                          condominium={condominium}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePin(announcement)}
                          title={announcement.is_pinned ? "Desafixar" : "Fixar no topo"}
                        >
                          <Pin className={`w-4 h-4 ${announcement.is_pinned ? "text-primary" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(announcement.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {announcement.summary && (
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground">{announcement.summary}</p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Success Dialog with Share Option */}
        <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
          <DialogContent className="sm:max-w-md bg-card">
            <DialogHeader>
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <DialogTitle className="text-center font-display">Aviso publicado!</DialogTitle>
              <DialogDescription className="text-center">
                O aviso foi publicado com sucesso na timeline do condomínio.
              </DialogDescription>
            </DialogHeader>
            
            {lastCreatedAnnouncement && (
              <div className="bg-muted/50 rounded-lg p-4 my-2">
                <p className="font-medium text-sm">{lastCreatedAnnouncement.title}</p>
                {lastCreatedAnnouncement.summary && (
                  <p className="text-sm text-muted-foreground mt-1">{lastCreatedAnnouncement.summary}</p>
                )}
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setSuccessDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Fechar
              </Button>
              {lastCreatedAnnouncement && (
                <Button
                  onClick={() => {
                    const message = generateWhatsAppMessage(
                      lastCreatedAnnouncement,
                      condominium,
                      "https://clear-comms-hub.lovable.app"
                    );
                    openWhatsAppShare(message);
                  }}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Compartilhar via WhatsApp
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
