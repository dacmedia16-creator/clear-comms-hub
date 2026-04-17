import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RealEstateLayout } from "@/components/real-estate/RealEstateLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function PropertyFormPage() {
  const { condoId, propertyId } = useParams<{ condoId: string; propertyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEdit = !!propertyId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    title: "",
    property_type: "apartamento",
    transaction_type: "venda",
    status: "capturing",
    address: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
    price: "",
    condo_fee: "",
    iptu: "",
    area_m2: "",
    bedrooms: "",
    bathrooms: "",
    parking: "",
    description: "",
  });

  useEffect(() => {
    async function load() {
      if (!isEdit || !propertyId) return;
      setLoading(true);
      const { data } = await supabase.from("properties").select("*").eq("id", propertyId).maybeSingle();
      if (data) {
        setForm({
          code: data.code || "",
          title: data.title,
          property_type: data.property_type || "apartamento",
          transaction_type: data.transaction_type || "venda",
          status: data.status,
          address: data.address || "",
          neighborhood: data.neighborhood || "",
          city: data.city || "",
          state: data.state || "",
          zip_code: data.zip_code || "",
          price: data.price?.toString() || "",
          condo_fee: data.condo_fee?.toString() || "",
          iptu: data.iptu?.toString() || "",
          area_m2: data.area_m2?.toString() || "",
          bedrooms: data.bedrooms?.toString() || "",
          bathrooms: data.bathrooms?.toString() || "",
          parking: data.parking?.toString() || "",
          description: data.description || "",
        });
      }
      setLoading(false);
    }
    load();
  }, [isEdit, propertyId]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!condoId) return;
    setSaving(true);
    try {
      const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));
      const intNum = (v: string) => (v.trim() === "" ? null : parseInt(v));

      const payload = {
        condominium_id: condoId,
        code: form.code || null,
        title: form.title,
        property_type: form.property_type,
        transaction_type: form.transaction_type,
        status: form.status,
        address: form.address || null,
        neighborhood: form.neighborhood || null,
        city: form.city || null,
        state: form.state || null,
        zip_code: form.zip_code || null,
        price: num(form.price),
        condo_fee: num(form.condo_fee),
        iptu: num(form.iptu),
        area_m2: num(form.area_m2),
        bedrooms: intNum(form.bedrooms),
        bathrooms: intNum(form.bathrooms),
        parking: intNum(form.parking),
        description: form.description || null,
      };

      let resultId = propertyId;
      if (isEdit && propertyId) {
        const { error } = await supabase.from("properties").update(payload).eq("id", propertyId);
        if (error) throw error;
      } else {
        // attach created_by profile
        let createdBy: string | null = null;
        if (user) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();
          createdBy = prof?.id || null;
        }
        const { data, error } = await supabase
          .from("properties")
          .insert({ ...payload, created_by: createdBy })
          .select("id")
          .single();
        if (error) throw error;
        resultId = data.id;
      }

      toast({ title: isEdit ? "Imóvel atualizado" : "Imóvel cadastrado" });
      navigate(`/imobiliaria/${condoId}/imoveis/${resultId}`);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro ao salvar",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <RealEstateLayout title={isEdit ? "Editar imóvel" : "Novo imóvel"}>
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </RealEstateLayout>
    );
  }

  return (
    <RealEstateLayout title={isEdit ? "Editar imóvel" : "Novo imóvel"}>
      <Card className="max-w-3xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  required
                  value={form.title}
                  onChange={set("title")}
                  placeholder="Ex: Apartamento 3 dorm Vila Mariana"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Código interno</Label>
                <Input id="code" value={form.code} onChange={set("code")} />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.property_type} onValueChange={(v) => setForm((f) => ({ ...f, property_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartamento">Apartamento</SelectItem>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="terreno">Terreno</SelectItem>
                    <SelectItem value="rural">Rural</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Transação</Label>
                <Select value={form.transaction_type} onValueChange={(v) => setForm((f) => ({ ...f, transaction_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="venda">Venda</SelectItem>
                    <SelectItem value="locacao">Locação</SelectItem>
                    <SelectItem value="venda_locacao">Venda e Locação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="capturing">Captando</SelectItem>
                    <SelectItem value="captured">Captado</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            <section className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Dormitórios</Label>
                <Input id="bedrooms" type="number" value={form.bedrooms} onChange={set("bedrooms")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Banheiros</Label>
                <Input id="bathrooms" type="number" value={form.bathrooms} onChange={set("bathrooms")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parking">Vagas</Label>
                <Input id="parking" type="number" value={form.parking} onChange={set("parking")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area_m2">Área (m²)</Label>
                <Input id="area_m2" value={form.area_m2} onChange={set("area_m2")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input id="price" value={form.price} onChange={set("price")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condo_fee">Condomínio (R$)</Label>
                <Input id="condo_fee" value={form.condo_fee} onChange={set("condo_fee")} />
              </div>
            </section>

            <section className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" value={form.address} onChange={set("address")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input id="neighborhood" value={form.neighborhood} onChange={set("neighborhood")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" value={form.city} onChange={set("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">UF</Label>
                <Input id="state" maxLength={2} value={form.state} onChange={set("state")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP</Label>
                <Input id="zip_code" value={form.zip_code} onChange={set("zip_code")} />
              </div>
            </section>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" rows={5} value={form.description} onChange={set("description")} />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </RealEstateLayout>
  );
}
