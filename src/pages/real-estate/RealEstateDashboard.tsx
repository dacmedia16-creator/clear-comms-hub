import { useParams } from "react-router-dom";
import { RealEstateLayout } from "@/components/real-estate/RealEstateLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, UserPlus, ListChecks, TrendingUp, Loader2 } from "lucide-react";
import { useProperties, useCaptureLeads, useTasks } from "@/hooks/useRealEstate";

export default function RealEstateDashboard() {
  const { condoId } = useParams<{ condoId: string }>();
  const { properties, loading: lp } = useProperties(condoId);
  const { leads, loading: ll } = useCaptureLeads(condoId);
  const { tasks, loading: lt } = useTasks(condoId);

  const propertiesActive = properties.filter((p) =>
    ["capturing", "captured", "published", "active"].includes(p.status)
  ).length;
  const openLeads = leads.filter((l) => !l.converted_at).length;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const tasksToday = tasks.filter(
    (t) =>
      t.status !== "done" &&
      t.status !== "cancelled" &&
      t.due_at &&
      new Date(t.due_at) >= todayStart &&
      new Date(t.due_at) <= todayEnd
  ).length;
  const conversionsThisMonth = leads.filter((l) => {
    if (!l.converted_at) return false;
    const d = new Date(l.converted_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const cards = [
    { label: "Imóveis ativos", value: propertiesActive, icon: Building, loading: lp },
    { label: "Leads abertos", value: openLeads, icon: UserPlus, loading: ll },
    { label: "Tarefas para hoje", value: tasksToday, icon: ListChecks, loading: lt },
    { label: "Conversões no mês", value: conversionsThisMonth, icon: TrendingUp, loading: ll },
  ];

  return (
    <RealEstateLayout title="Dashboard" description="Visão geral da operação imobiliária">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {c.label}
                </CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {c.loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-3xl font-bold">{c.value}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </RealEstateLayout>
  );
}
