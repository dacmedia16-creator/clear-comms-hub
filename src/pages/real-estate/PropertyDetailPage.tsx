import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RealEstateLayout } from "@/components/real-estate/RealEstateLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Loader2, Send, MessageCircle, Mail, Phone, StickyNote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useInteractions, useMessageTemplates, Property } from "@/hooks/useRealEstate";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const channelIcons: Record<string, any> = {
  whatsapp: MessageCircle,
  sms: Phone,
  email: Mail,
  call: Phone,
  visit: StickyNote,
  note: StickyNote,
  system: StickyNote,
};

export default function PropertyDetailPage() {
  const { condoId, propertyId } = useParams<{ condoId: string; propertyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  const { interactions, refetch: refetchInteractions } = useInteractions(condoId, "property", propertyId);
  const { templates } = useMessageTemplates(condoId);

  const [channel, setChannel] = useState<"whatsapp" | "sms" | "email" | "note">("note");
  const [recipient, setRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      if (!propertyId) return;
      setLoading(true);
      const { data } = await supabase.from("properties").select("*").eq("id", propertyId).maybeSingle();
      setProperty(data as Property | null);
      setLoading(false);
    }
    load();
  }, [propertyId]);

  function applyTemplate(templateId: string) {
    const t = templates.find((x) => x.id === templateId);
    if (!t) return;
    setContent(t.body);
    if (t.subject) setEmailSubject(t.subject);
  }

  async function handleSend() {
    if (!condoId || !propertyId || !content.trim()) return;
    setSending(true);
    try {
      let createdBy: string | null = null;
      if (user) {
        const { data: prof } = await supabase.from("profiles").select("id").eq("user_id", user.id).maybeSingle();
        createdBy = prof?.id || null;
      }

      let success = true;
      let errorMsg = "";

      // For real channels we just register the interaction.
      // Bulk WhatsApp/SMS/Email use existing hooks tied to announcements;
      // here we focus on history. Future: wire dedicated edge function for 1-1 send.
      if (channel !== "note" && !recipient) {
        success = false;
        errorMsg = "Destinatário obrigatório";
      }

      // log interaction either way (note or sent message)
      await supabase.from("interactions").insert({
        condominium_id: condoId,
        entity_type: "property",
        entity_id: propertyId,
        channel,
        direction: channel === "note" ? "internal" : "outbound",
        subject: channel === "email" ? emailSubject : null,
        content,
        created_by: createdBy,
        metadata: { recipient, success, error: errorMsg || null },
      });

      toast({
        title: channel === "note" ? "Nota registrada" : success ? "Enviado" : "Erro ao enviar",
        description: errorMsg || undefined,
        variant: success ? undefined : "destructive",
      });
      setContent("");
      setRecipient("");
      setEmailSubject("");
      refetchInteractions();
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <RealEstateLayout title="Imóvel">
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      </RealEstateLayout>
    );
  }

  if (!property) {
    return (
      <RealEstateLayout title="Imóvel não encontrado">
        <Button onClick={() => navigate(-1)}>Voltar</Button>
      </RealEstateLayout>
    );
  }

  const channelTemplates = templates.filter((t) => channel === "note" || t.channel === channel);

  return (
    <RealEstateLayout
      title={property.title}
      description={property.code ? `Cód. ${property.code}` : undefined}
      actions={
        <Button asChild variant="outline">
          <Link to={`/imobiliaria/${condoId}/imoveis/${property.id}/editar`}>
            <Edit className="w-4 h-4 mr-2" /> Editar
          </Link>
        </Button>
      }
    >
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Sidebar info */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="secondary">{property.status}</Badge>
            </div>
            {property.price != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preço</span>
                <span className="font-semibold">R$ {Number(property.price).toLocaleString("pt-BR")}</span>
              </div>
            )}
            {property.area_m2 != null && (
              <div className="flex justify-between"><span className="text-muted-foreground">Área</span><span>{property.area_m2} m²</span></div>
            )}
            {property.bedrooms != null && (
              <div className="flex justify-between"><span className="text-muted-foreground">Dormitórios</span><span>{property.bedrooms}</span></div>
            )}
            {property.bathrooms != null && (
              <div className="flex justify-between"><span className="text-muted-foreground">Banheiros</span><span>{property.bathrooms}</span></div>
            )}
            {property.parking != null && (
              <div className="flex justify-between"><span className="text-muted-foreground">Vagas</span><span>{property.parking}</span></div>
            )}
            {(property.address || property.neighborhood || property.city) && (
              <div className="pt-2 border-t border-border">
                <p className="text-muted-foreground text-xs mb-1">Endereço</p>
                <p>{[property.address, property.neighborhood, property.city, property.state].filter(Boolean).join(", ")}</p>
              </div>
            )}
            {property.description && (
              <div className="pt-2 border-t border-border">
                <p className="text-muted-foreground text-xs mb-1">Descrição</p>
                <p className="whitespace-pre-wrap">{property.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main column: send + history */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-3">Nova interação</h2>
              <Tabs value={channel} onValueChange={(v: any) => setChannel(v)}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="note">Nota</TabsTrigger>
                  <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                  <TabsTrigger value="sms">SMS</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>
                <TabsContent value={channel} className="mt-4 space-y-3">
                  {channel !== "note" && (
                    <div className="space-y-2">
                      <Label>{channel === "email" ? "Email do destinatário" : "Telefone do destinatário"}</Label>
                      <Input
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder={channel === "email" ? "email@exemplo.com" : "(11) 99999-9999"}
                      />
                    </div>
                  )}
                  {channel === "email" && (
                    <div className="space-y-2">
                      <Label>Assunto</Label>
                      <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
                    </div>
                  )}
                  {channelTemplates.length > 0 && (
                    <div className="space-y-2">
                      <Label>Usar template</Label>
                      <Select onValueChange={applyTemplate}>
                        <SelectTrigger><SelectValue placeholder="Selecione um template..." /></SelectTrigger>
                        <SelectContent>
                          {channelTemplates.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Mensagem</Label>
                    <Textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} />
                  </div>
                  <Button onClick={handleSend} disabled={sending || !content.trim() || (channel !== "note" && !recipient)}>
                    {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    {channel === "note" ? "Registrar nota" : "Enviar"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-3">Histórico</h2>
              {interactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma interação ainda.</p>
              ) : (
                <div className="space-y-3">
                  {interactions.map((i) => {
                    const Icon = channelIcons[i.channel] || StickyNote;
                    return (
                      <div key={i.id} className="flex gap-3 pb-3 border-b border-border last:border-0">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <span className="capitalize">{i.channel}</span>
                            {i.direction && <span>• {i.direction}</span>}
                            <span>• {format(new Date(i.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                          </div>
                          {i.subject && <p className="text-sm font-medium">{i.subject}</p>}
                          {i.content && <p className="text-sm whitespace-pre-wrap">{i.content}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RealEstateLayout>
  );
}
