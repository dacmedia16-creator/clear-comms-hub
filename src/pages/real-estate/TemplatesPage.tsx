import { useState } from "react";
import { useParams } from "react-router-dom";
import { RealEstateLayout } from "@/components/real-estate/RealEstateLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Plus, Loader2, MessageSquareText, Trash2 } from "lucide-react";
import { useMessageTemplates, MessageTemplate } from "@/hooks/useRealEstate";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const channelLabel: Record<string, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
};

export default function TemplatesPage() {
  const { condoId } = useParams<{ condoId: string }>();
  const { templates, loading, refetch } = useMessageTemplates(condoId);
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MessageTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    channel: "whatsapp" as "whatsapp" | "sms" | "email",
    subject: "",
    body: "",
  });

  function openNew() {
    setEditing(null);
    setForm({ name: "", channel: "whatsapp", subject: "", body: "" });
    setOpen(true);
  }

  function openEdit(t: MessageTemplate) {
    setEditing(t);
    setForm({
      name: t.name,
      channel: t.channel,
      subject: t.subject || "",
      body: t.body,
    });
    setOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!condoId) return;
    setSaving(true);
    try {
      let createdBy: string | null = null;
      if (user) {
        const { data: prof } = await supabase.from("profiles").select("id").eq("user_id", user.id).maybeSingle();
        createdBy = prof?.id || null;
      }
      const payload = {
        condominium_id: condoId,
        name: form.name,
        channel: form.channel,
        subject: form.subject || null,
        body: form.body,
        is_active: true,
      };
      if (editing) {
        const { error } = await supabase.from("message_templates").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("message_templates").insert({ ...payload, created_by: createdBy });
        if (error) throw error;
      }
      toast({ title: editing ? "Template atualizado" : "Template criado" });
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este template?")) return;
    const { error } = await supabase.from("message_templates").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else refetch();
  }

  return (
    <RealEstateLayout
      title="Templates de mensagem"
      description="Modelos reutilizáveis para WhatsApp, SMS e Email"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Novo template</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar template" : "Novo template"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Canal</Label>
                  <Select value={form.channel} onValueChange={(v: any) => setForm((f) => ({ ...f, channel: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {form.channel === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input id="subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="body">Corpo *</Label>
                <Textarea id="body" rows={8} required value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
                <p className="text-xs text-muted-foreground">Variáveis: {"{{nome}}, {{imovel}}, {{preco}}, {{corretor}}"}</p>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : templates.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <MessageSquareText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nenhum template cadastrado.</p>
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {templates.map((t) => (
            <Card key={t.id} className="cursor-pointer hover:border-primary/50" onClick={() => openEdit(t)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{t.name}</p>
                    <Badge variant="secondary" className="mt-1">{channelLabel[t.channel]}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">{t.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </RealEstateLayout>
  );
}
