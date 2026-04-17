import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { RealEstateLayout } from "@/components/real-estate/RealEstateLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Loader2, UserPlus } from "lucide-react";
import { useCaptureLeads, usePipelines, CaptureLead, PipelineStage } from "@/hooks/useRealEstate";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function LeadsPage() {
  const { condoId } = useParams<{ condoId: string }>();
  const [tab, setTab] = useState<"property" | "broker">("property");
  const { leads, loading, refetch } = useCaptureLeads(condoId);
  const { pipelines, stages } = usePipelines(condoId);
  const { user } = useAuth();
  const { toast } = useToast();
  const [openNew, setOpenNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    source: "",
    notes: "",
  });

  const pipelineForTab = pipelines.find((p) => p.lead_type === tab && p.is_default) || pipelines.find((p) => p.lead_type === tab);
  const stagesForTab = useMemo(
    () => stages.filter((s) => s.pipeline_id === pipelineForTab?.id).sort((a, b) => a.position - b.position),
    [stages, pipelineForTab]
  );
  const leadsForTab = leads.filter((l) => l.lead_type === tab);

  const leadsByStage = useMemo(() => {
    const map: Record<string, CaptureLead[]> = {};
    stagesForTab.forEach((s) => (map[s.id] = []));
    map["__none__"] = [];
    leadsForTab.forEach((l) => {
      const key = l.stage_id && map[l.stage_id] ? l.stage_id : "__none__";
      map[key].push(l);
    });
    return map;
  }, [stagesForTab, leadsForTab]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!condoId) return;
    setSaving(true);
    try {
      let createdBy: string | null = null;
      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        createdBy = prof?.id || null;
      }
      const firstStage = stagesForTab[0];
      const { error } = await supabase.from("capture_leads").insert({
        condominium_id: condoId,
        lead_type: tab,
        full_name: form.full_name,
        phone: form.phone || null,
        email: form.email || null,
        source: form.source || null,
        notes: form.notes || null,
        stage_id: firstStage?.id || null,
        created_by: createdBy,
      });
      if (error) throw error;
      toast({ title: "Lead criado" });
      setOpenNew(false);
      setForm({ full_name: "", phone: "", email: "", source: "", notes: "" });
      refetch();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function moveLead(leadId: string, stageId: string) {
    const { error } = await supabase.from("capture_leads").update({ stage_id: stageId }).eq("id", leadId);
    if (error) {
      toast({ title: "Erro ao mover", description: error.message, variant: "destructive" });
    } else {
      // log interaction
      const stage = stages.find((s) => s.id === stageId);
      await supabase.from("interactions").insert({
        condominium_id: condoId,
        entity_type: "lead",
        entity_id: leadId,
        channel: "system",
        direction: "internal",
        content: `Movido para etapa: ${stage?.name || ""}`,
      });
      refetch();
    }
  }

  return (
    <RealEstateLayout
      title="Leads de Captação"
      description="Pipeline de captação de imóveis e corretores"
      actions={
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo lead — {tab === "property" ? "Imóvel" : "Corretor"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome *</Label>
                <Input id="full_name" required value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Origem</Label>
                <Input id="source" placeholder="Indicação, site, OLX..." value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Criar lead
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="property">Imóveis</TabsTrigger>
          <TabsTrigger value="broker">Corretores</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : leadsForTab.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <UserPlus className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Nenhum lead nesta categoria ainda.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-3 min-w-max">
                {stagesForTab.map((stage) => (
                  <KanbanColumn
                    key={stage.id}
                    stage={stage}
                    leads={leadsByStage[stage.id] || []}
                    allStages={stagesForTab}
                    onMove={moveLead}
                  />
                ))}
                {(leadsByStage["__none__"] || []).length > 0 && (
                  <KanbanColumn
                    stage={{ id: "__none__", name: "Sem etapa", position: -1, color: "#94a3b8", pipeline_id: "", sla_days: null, is_terminal: false }}
                    leads={leadsByStage["__none__"]}
                    allStages={stagesForTab}
                    onMove={moveLead}
                  />
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </RealEstateLayout>
  );
}

function KanbanColumn({
  stage,
  leads,
  allStages,
  onMove,
}: {
  stage: PipelineStage;
  leads: CaptureLead[];
  allStages: PipelineStage[];
  onMove: (leadId: string, stageId: string) => void;
}) {
  return (
    <div className="w-72 shrink-0 bg-muted/40 rounded-xl p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color || "#94a3b8" }} />
          <h3 className="font-semibold text-sm">{stage.name}</h3>
        </div>
        <Badge variant="secondary">{leads.length}</Badge>
      </div>
      <div className="space-y-2">
        {leads.map((lead) => (
          <Card key={lead.id} className="bg-card">
            <CardContent className="p-3">
              <p className="font-medium text-sm">{lead.full_name}</p>
              {lead.phone && <p className="text-xs text-muted-foreground">{lead.phone}</p>}
              {lead.source && <p className="text-xs text-muted-foreground mt-1">Origem: {lead.source}</p>}
              {allStages.length > 1 && (
                <Select value={stage.id !== "__none__" ? stage.id : ""} onValueChange={(v) => onMove(lead.id, v)}>
                  <SelectTrigger className="h-7 text-xs mt-2">
                    <SelectValue placeholder="Mover para..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allStages.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
