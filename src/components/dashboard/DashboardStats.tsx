import { OrganizationType, OrganizationTerms } from "@/lib/organization-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bell, 
  TrendingUp, 
  Users, 
  Calendar,
  LucideIcon
} from "lucide-react";

interface StatWidget {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  color: string;
}

interface DashboardStatsProps {
  organizationType?: OrganizationType | string | null;
  terms: OrganizationTerms;
  stats: {
    totalAnnouncements: number;
    totalMembers: number;
    pendingApprovals: number;
    thisMonth: number;
  };
}

export function DashboardStats({ 
  organizationType, 
  terms,
  stats 
}: DashboardStatsProps) {
  const widgets: StatWidget[] = [
    {
      icon: Bell,
      label: "Avisos publicados",
      value: stats.totalAnnouncements,
      color: "text-primary",
    },
    {
      icon: Users,
      label: terms.memberPlural,
      value: stats.totalMembers,
      color: "text-blue-600",
    },
    {
      icon: TrendingUp,
      label: "Este mês",
      value: stats.thisMonth,
      trend: stats.thisMonth > 0 ? `+${stats.thisMonth}` : "0",
      color: "text-emerald-600",
    },
    {
      icon: Calendar,
      label: "Aguardando aprovação",
      value: stats.pendingApprovals,
      color: stats.pendingApprovals > 0 ? "text-amber-600" : "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {widgets.map((widget) => (
        <Card key={widget.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <widget.icon className={`w-5 h-5 ${widget.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{widget.value}</p>
                <p className="text-xs text-muted-foreground">{widget.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
