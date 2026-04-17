import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RealEstateLayout } from "@/components/real-estate/RealEstateLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2, Building } from "lucide-react";
import { useProperties } from "@/hooks/useRealEstate";

const statusColors: Record<string, string> = {
  capturing: "bg-blue-100 text-blue-700",
  captured: "bg-amber-100 text-amber-700",
  published: "bg-emerald-100 text-emerald-700",
  active: "bg-emerald-100 text-emerald-700",
  archived: "bg-muted text-muted-foreground",
};

export default function PropertiesListPage() {
  const { condoId } = useParams<{ condoId: string }>();
  const { properties, loading } = useProperties(condoId);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return properties;
    return properties.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.code || "").toLowerCase().includes(q) ||
        (p.neighborhood || "").toLowerCase().includes(q) ||
        (p.city || "").toLowerCase().includes(q)
    );
  }, [properties, search]);

  return (
    <RealEstateLayout
      title="Imóveis"
      description="Catálogo de imóveis captados"
      actions={
        <Button asChild>
          <Link to={`/imobiliaria/${condoId}/imoveis/novo`}>
            <Plus className="w-4 h-4 mr-2" /> Novo imóvel
          </Link>
        </Button>
      }
    >
      <div className="mb-4 relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título, código, bairro, cidade..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">Nenhum imóvel cadastrado ainda.</p>
            <Button asChild>
              <Link to={`/imobiliaria/${condoId}/imoveis/novo`}>
                <Plus className="w-4 h-4 mr-2" /> Cadastrar primeiro imóvel
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Link key={p.id} to={`/imobiliaria/${condoId}/imoveis/${p.id}`}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="font-semibold text-sm line-clamp-2">{p.title}</h3>
                    <Badge className={statusColors[p.status] || statusColors.archived} variant="secondary">
                      {p.status}
                    </Badge>
                  </div>
                  {p.code && <p className="text-xs text-muted-foreground mb-2">Cód. {p.code}</p>}
                  <div className="text-xs text-muted-foreground space-y-1">
                    {(p.neighborhood || p.city) && (
                      <p>{[p.neighborhood, p.city].filter(Boolean).join(" • ")}</p>
                    )}
                    <div className="flex gap-3 flex-wrap">
                      {p.bedrooms != null && <span>{p.bedrooms} dorm</span>}
                      {p.bathrooms != null && <span>{p.bathrooms} ban</span>}
                      {p.parking != null && <span>{p.parking} vaga</span>}
                      {p.area_m2 != null && <span>{p.area_m2} m²</span>}
                    </div>
                    {p.price != null && (
                      <p className="text-base font-bold text-foreground pt-1">
                        R$ {Number(p.price).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </RealEstateLayout>
  );
}
