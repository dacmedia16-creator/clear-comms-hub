import { Link } from "react-router-dom";
import { SuperAdminGuard } from "@/components/SuperAdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAllCondominiums } from "@/hooks/useAllCondominiums";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useAllAnnouncements } from "@/hooks/useAllAnnouncements";
import { Bell, Building2, Users, FileText, ArrowLeft, Loader2, MessageSquare, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RefreshButton } from "@/components/RefreshButton";
import { MobileBottomNav, MobileNavItem } from "@/components/mobile/MobileBottomNav";

const superAdminNavItems: MobileNavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/super-admin" },
  { icon: Building2, label: "Condos", path: "/super-admin/condominiums" },
  { icon: Users, label: "Usuários", path: "/super-admin/users" },
  { icon: FileText, label: "Timelines", path: "/super-admin/timelines" },
  { icon: MessageSquare, label: "WhatsApp", path: "/super-admin/whatsapp" },
];

export default function SuperAdminDashboard() {
  const { signOut } = useAuth();
  const { condominiums, loading: condosLoading } = useAllCondominiums();
  const { users, loading: usersLoading } = useAllUsers();
  const { totalAnnouncements, loading: announcementsLoading } = useAllAnnouncements();

  const loading = condosLoading || usersLoading || announcementsLoading;

  const stats = {
    totalCondos: condominiums.length,
    totalUsers: users.length,
    superAdmins: users.filter(u => u.is_super_admin).length,
    freeCondos: condominiums.filter(c => c.plan === "free").length,
    starterCondos: condominiums.filter(c => c.plan === "starter").length,
    proCondos: condominiums.filter(c => c.plan === "pro").length,
  };

  return (
    <SuperAdminGuard>
      <div className="min-h-screen bg-background has-bottom-nav">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-destructive flex items-center justify-center">
                    <Bell className="w-5 h-5 text-destructive-foreground" />
                  </div>
                  <span className="font-display text-xl font-bold text-foreground">Super Admin</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <RefreshButton />
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container px-4 mx-auto py-8">
          <div className="mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Painel Super Admin
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os condomínios e usuários da plataforma
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Condomínios</CardDescription>
                    <CardTitle className="text-3xl font-display">{stats.totalCondos}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Usuários</CardDescription>
                    <CardTitle className="text-3xl font-display">{stats.totalUsers}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Super Admins</CardDescription>
                    <CardTitle className="text-3xl font-display">{stats.superAdmins}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Planos Pro</CardDescription>
                    <CardTitle className="text-3xl font-display">{stats.proCondos}</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Quick Links */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-2">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="font-display">Gerenciar Condomínios</CardTitle>
                    <CardDescription>
                      Visualize, crie e edite todos os condomínios cadastrados na plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        Free: {stats.freeCondos}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        Starter: {stats.starterCondos}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        Pro: {stats.proCondos}
                      </span>
                    </div>
                    <Button asChild className="w-full">
                      <Link to="/super-admin/condominiums">
                        <Building2 className="w-4 h-4 mr-2" />
                        Ver Condomínios
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-2">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="font-display">Gerenciar Usuários</CardTitle>
                    <CardDescription>
                      Administre contas de usuários e promova super administradores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        Total: {stats.totalUsers}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                        Super Admins: {stats.superAdmins}
                      </span>
                    </div>
                    <Button asChild className="w-full">
                      <Link to="/super-admin/users">
                        <Users className="w-4 h-4 mr-2" />
                        Ver Usuários
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-2">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="font-display">Ver Timelines</CardTitle>
                    <CardDescription>
                      Visualize todas as timelines de avisos dos condomínios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        Total de Avisos: {totalAnnouncements}
                      </span>
                    </div>
                    <Button asChild className="w-full">
                      <Link to="/super-admin/timelines">
                        <FileText className="w-4 h-4 mr-2" />
                        Ver Timelines
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-2">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="font-display">API WhatsApp</CardTitle>
                    <CardDescription>
                      Gerencie a integração com a API Zion Talk para notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        Zion Talk
                      </span>
                    </div>
                    <Button asChild className="w-full">
                      <Link to="/super-admin/whatsapp">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Gerenciar API
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>

        <MobileBottomNav items={superAdminNavItems} />
      </div>
    </SuperAdminGuard>
  );
}
