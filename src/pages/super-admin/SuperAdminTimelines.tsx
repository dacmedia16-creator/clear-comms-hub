import { Link } from "react-router-dom";
import { SuperAdminGuard } from "@/components/SuperAdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAllAnnouncements } from "@/hooks/useAllAnnouncements";
import { useAllCondominiums } from "@/hooks/useAllCondominiums";
import { FileText, ArrowLeft, Loader2, ExternalLink, Building2, Bell, Users, MessageSquare, LayoutDashboard } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshButton } from "@/components/RefreshButton";
import { MobileBottomNav, MobileNavItem } from "@/components/mobile/MobileBottomNav";

const superAdminNavItems: MobileNavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/super-admin" },
  { icon: Building2, label: "Condos", path: "/super-admin/condominiums" },
  { icon: Users, label: "Usuários", path: "/super-admin/users" },
  { icon: FileText, label: "Timelines", path: "/super-admin/timelines" },
  { icon: MessageSquare, label: "WhatsApp", path: "/super-admin/whatsapp" },
];

const categoryLabels: Record<string, string> = {
  informativo: "Informativo",
  financeiro: "Financeiro",
  manutencao: "Manutenção",
  convivencia: "Convivência",
  seguranca: "Segurança",
  urgente: "Urgente",
};

export default function SuperAdminTimelines() {
  const { condoStats, totalAnnouncements, loading } = useAllAnnouncements();
  const { condominiums, loading: condosLoading } = useAllCondominiums();

  const isLoading = loading || condosLoading;

  // Include condominiums that have no announcements
  const allCondosWithStats = condominiums.map((condo) => {
    const stat = condoStats.find((s) => s.condoId === condo.id);
    return {
      condoId: condo.id,
      condoName: condo.name,
      condoSlug: condo.slug,
      count: stat?.count || 0,
      latestAnnouncement: stat?.latestAnnouncement || null,
    };
  });

  return (
    <SuperAdminGuard>
      <div className="min-h-screen bg-background has-bottom-nav">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link
                  to="/super-admin"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-display text-xl font-bold text-foreground">
                    Todas as Timelines
                  </span>
                </div>
              </div>
              <RefreshButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container px-4 mx-auto py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de Avisos</CardDescription>
                <CardTitle className="text-3xl font-display">{totalAnnouncements}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Condomínios</CardDescription>
                <CardTitle className="text-3xl font-display">{condominiums.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Com Avisos</CardDescription>
                <CardTitle className="text-3xl font-display">
                  {condoStats.filter((s) => s.count > 0).length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCondosWithStats.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Nenhum condomínio cadastrado</p>
                  </CardContent>
                </Card>
              ) : (
                allCondosWithStats.map((condo) => (
                  <Card key={condo.condoId} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="font-display text-lg">{condo.condoName}</CardTitle>
                          <CardDescription className="text-sm">{condo.condoSlug}</CardDescription>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Bell className="w-4 h-4" />
                          <span>{condo.count}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {condo.latestAnnouncement ? (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Último aviso:</p>
                          <p className="font-medium text-sm line-clamp-1">
                            {condo.latestAnnouncement.title}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                condo.latestAnnouncement.is_urgent
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {categoryLabels[condo.latestAnnouncement.category] ||
                                condo.latestAnnouncement.category}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(condo.latestAnnouncement.published_at),
                                "dd/MM/yyyy",
                                { locale: ptBR }
                              )}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">Sem avisos publicados</p>
                        </div>
                      )}

                      <Button asChild className="w-full">
                        <Link to={`/c/${condo.condoSlug}`} target="_blank">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Ver Timeline
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </main>

        <MobileBottomNav items={superAdminNavItems} />
      </div>
    </SuperAdminGuard>
  );
}
