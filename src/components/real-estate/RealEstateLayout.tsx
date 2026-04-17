import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { Button } from "@/components/ui/button";
import {
  Home,
  LayoutDashboard,
  Building,
  UserPlus,
  ListChecks,
  MessageSquareText,
  Settings,
  ArrowLeft,
  Loader2,
} from "lucide-react";

interface Props {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function RealEstateLayout({ children, title, description, actions }: Props) {
  const { condoId } = useParams<{ condoId: string }>();
  const { user } = useAuth();
  const { isSuperAdmin } = useSuperAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [orgName, setOrgName] = useState<string>("");
  const [orgType, setOrgType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function check() {
      if (!condoId) return;
      const { data: cond } = await supabase
        .from("condominiums")
        .select("name, organization_type, auth_owner_id")
        .eq("id", condoId)
        .maybeSingle();
      if (!cond) {
        navigate("/dashboard");
        return;
      }
      setOrgName(cond.name);
      setOrgType(cond.organization_type);

      if (isSuperAdmin) {
        setAuthorized(true);
      } else if (user) {
        if (cond.auth_owner_id === user.id) {
          setAuthorized(true);
        } else {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("condominium_id", condoId)
            .eq("auth_user_id", user.id);
          const ok = (roles || []).some((r) =>
            ["admin", "syndic", "collaborator"].includes(r.role as string)
          );
          setAuthorized(ok);
        }
      }
      setLoading(false);
    }
    check();
  }, [condoId, user, isSuperAdmin, navigate]);

  const navItems = [
    { to: `/imobiliaria/${condoId}`, label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: `/imobiliaria/${condoId}/imoveis`, label: "Imóveis", icon: Building },
    { to: `/imobiliaria/${condoId}/leads`, label: "Leads", icon: UserPlus },
    { to: `/imobiliaria/${condoId}/tarefas`, label: "Tarefas", icon: ListChecks },
    { to: `/imobiliaria/${condoId}/templates`, label: "Templates", icon: MessageSquareText },
  ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-muted-foreground mb-4">Você não tem acesso a esta imobiliária.</p>
          <Button asChild variant="outline">
            <Link to="/dashboard">Voltar</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Button asChild variant="ghost" size="sm" className="shrink-0">
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Home className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground leading-none">CRM Imobiliário</p>
              <p className="font-semibold text-sm truncate">{orgName}</p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to={`/admin/${condoId}/settings`}>
              <Settings className="w-4 h-4" />
            </Link>
          </Button>
        </div>
        {/* Tabs */}
        <nav className="container mx-auto px-4 flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to, item.exact);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-2 text-sm border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Page header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">{title}</h1>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}
