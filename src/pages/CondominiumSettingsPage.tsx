import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Condominium {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  slug: string;
  code: number;
  plan: "free" | "starter" | "pro";
  notification_email: boolean;
  notification_whatsapp: boolean;
}

export default function CondominiumSettingsPage() {
  const { condoId } = useParams<{ condoId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [condominium, setCondominium] = useState<Condominium | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [notificationEmail, setNotificationEmail] = useState(true);
  const [notificationWhatsapp, setNotificationWhatsapp] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (condoId) {
      fetchCondominium();
    }
  }, [condoId]);

  const fetchCondominium = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("condominiums")
        .select("*")
        .eq("id", condoId)
        .single();

      if (error) throw error;

      setCondominium(data);
      setName(data.name);
      setDescription(data.description || "");
      setAddress(data.address || "");
      setCity(data.city || "");
      setState(data.state || "");
      setNotificationEmail(data.notification_email);
      setNotificationWhatsapp(data.notification_whatsapp);
    } catch (error: any) {
      console.error("Error fetching condominium:", error);
      toast({
        title: "Erro ao carregar condomínio",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O nome do condomínio é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("condominiums")
        .update({
          name: name.trim(),
          description: description.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          notification_email: notificationEmail,
          notification_whatsapp: notificationWhatsapp,
        })
        .eq("id", condoId);

      if (error) throw error;

      toast({
        title: "Configurações salvas!",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error: any) {
      console.error("Error saving condominium:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const planLabels: Record<string, string> = {
    free: "Free",
    starter: "Starter",
    pro: "Pro",
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
          <div className="flex items-center h-16 gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/admin/${condoId}`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">
                {condominium.name}
              </h1>
              <p className="text-sm text-muted-foreground">Configurações</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 mx-auto py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Informações Básicas</CardTitle>
              <CardDescription>
                Dados gerais do condomínio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do condomínio *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Residencial Jardins"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Uma breve descrição do condomínio..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Rua das Flores, 123"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: São Paulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Ex: SP"
                    maxLength={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Notificações</CardTitle>
              <CardDescription>
                Configure como os moradores receberão os avisos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notification">Notificação por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar avisos por email para os moradores
                  </p>
                </div>
                <Switch
                  id="email-notification"
                  checked={notificationEmail}
                  onCheckedChange={setNotificationEmail}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="whatsapp-notification">Notificação por WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar avisos por WhatsApp para os moradores
                  </p>
                </div>
                <Switch
                  id="whatsapp-notification"
                  checked={notificationWhatsapp}
                  onCheckedChange={setNotificationWhatsapp}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Informações do Sistema</CardTitle>
              <CardDescription>
                Dados gerados automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Código do condomínio</span>
                <code className="text-sm bg-primary/10 text-primary font-bold px-3 py-1 rounded">
                  {condominium.code}
                </code>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Link da timeline</span>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  /c/{condominium.slug}
                </code>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Plano atual</span>
                <span className="text-sm font-medium px-2 py-1 rounded-full bg-muted">
                  {planLabels[condominium.plan]}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/${condoId}`)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
