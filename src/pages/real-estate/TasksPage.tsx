import { useState } from "react";
import { useParams } from "react-router-dom";
import { RealEstateLayout } from "@/components/real-estate/RealEstateLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Loader2, ListChecks } from "lucide-react";
import { useTasks } from "@/hooks/useRealEstate";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
};

export default function TasksPage() {
  const { condoId } = useParams<{ condoId: string }>();
  const { tasks, loading, refetch } = useTasks(condoId);
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    due_at: "",
    priority: "normal" as const,
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!condoId) return;
    setSaving(true);
    try {
      let createdBy: string | null = null;
      if (user) {
        const { data: prof } = await supabase.from("profiles").select("id").eq("user_id", user.id).maybeSingle();
        createdBy = prof?.id || null;
      }
      const { error } = await supabase.from("tasks").insert({
        condominium_id: condoId,
        title: form.title,
        description: form.description || null,
        due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
        priority: form.priority,
        status: "open",
        created_by: createdBy,
        assigned_to_profile_id: createdBy,
      });
      if (error) throw error;
      toast({ title: "Tarefa criada" });
      setOpen(false);
      setForm({ title: "", description: "", due_at: "", priority: "normal" });
      refetch();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function toggleDone(id: string, current: string) {
    const newStatus = current === "done" ? "open" : "done";
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus, completed_at: newStatus === "done" ? new Date().toISOString() : null })
      .eq("id", id);
    if (!error) refetch();
  }

  const open_tasks = tasks.filter((t) => t.status === "open" || t.status === "in_progress");
  const done_tasks = tasks.filter((t) => t.status === "done");

  return (
    <RealEstateLayout
      title="Tarefas e follow-ups"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Nova tarefa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova tarefa</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input id="title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="due_at">Prazo</Label>
                  <Input id="due_at" type="datetime-local" value={form.due_at} onChange={(e) => setForm((f) => ({ ...f, due_at: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select value={form.priority} onValueChange={(v: any) => setForm((f) => ({ ...f, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Criar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : tasks.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <ListChecks className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nenhuma tarefa cadastrada.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">Em aberto</h2>
            <div className="space-y-2">
              {open_tasks.map((t) => (
                <Card key={t.id}>
                  <CardContent className="p-3 flex items-start gap-3">
                    <Checkbox checked={false} onCheckedChange={() => toggleDone(t.id, t.status)} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{t.title}</p>
                      {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge className={priorityColors[t.priority]} variant="secondary">{t.priority}</Badge>
                        {t.due_at && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(t.due_at), "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {open_tasks.length === 0 && <p className="text-sm text-muted-foreground">Nada em aberto. 🎉</p>}
            </div>
          </section>

          {done_tasks.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">Concluídas</h2>
              <div className="space-y-2">
                {done_tasks.slice(0, 20).map((t) => (
                  <Card key={t.id} className="opacity-70">
                    <CardContent className="p-3 flex items-start gap-3">
                      <Checkbox checked onCheckedChange={() => toggleDone(t.id, t.status)} />
                      <div className="flex-1">
                        <p className="font-medium text-sm line-through">{t.title}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </RealEstateLayout>
  );
}
