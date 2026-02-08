import { 
  Calendar, 
  Wrench, 
  DollarSign, 
  Users,
  Bell,
  Briefcase,
  Clock,
  Store,
  LucideIcon
} from "lucide-react";
import { OrganizationType } from "@/lib/organization-types";
import { Card, CardContent } from "@/components/ui/card";

interface QuickAction {
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
}

// Ações rápidas por tipo de organização
const actionsByType: Record<OrganizationType, QuickAction[]> = {
  condominium: [
    { icon: Calendar, label: "Assembleia", description: "Convocar assembleia", color: "text-blue-600" },
    { icon: Wrench, label: "Manutenção", description: "Avisar manutenção", color: "text-orange-600" },
    { icon: DollarSign, label: "Financeiro", description: "Aviso financeiro", color: "text-emerald-600" },
    { icon: Users, label: "Convivência", description: "Regras e normas", color: "text-purple-600" },
  ],
  healthcare: [
    { icon: Clock, label: "Horários", description: "Alterar horários", color: "text-teal-600" },
    { icon: Bell, label: "Campanha", description: "Campanha de saúde", color: "text-pink-600" },
    { icon: Wrench, label: "Manutenção", description: "Aviso técnico", color: "text-orange-600" },
    { icon: Users, label: "Serviços", description: "Novos serviços", color: "text-blue-600" },
  ],
  company: [
    { icon: Briefcase, label: "RH", description: "Comunicado RH", color: "text-amber-600" },
    { icon: Bell, label: "Treinamento", description: "Convocar treinamento", color: "text-blue-600" },
    { icon: Bell, label: "Compliance", description: "Aviso normativo", color: "text-slate-600" },
    { icon: Calendar, label: "Evento", description: "Evento corporativo", color: "text-fuchsia-600" },
  ],
  community: [
    { icon: Calendar, label: "Reunião", description: "Convocar reunião", color: "text-blue-600" },
    { icon: Bell, label: "Informativo", description: "Comunicado geral", color: "text-blue-600" },
    { icon: Users, label: "Evento", description: "Evento para membros", color: "text-fuchsia-600" },
    { icon: DollarSign, label: "Financeiro", description: "Aviso financeiro", color: "text-emerald-600" },
  ],
  church: [
    { icon: Calendar, label: "Cultos", description: "Programação", color: "text-violet-600" },
    { icon: Bell, label: "Evento", description: "Evento especial", color: "text-fuchsia-600" },
    { icon: Users, label: "Pastoral", description: "Comunicado", color: "text-rose-600" },
    { icon: DollarSign, label: "Ação Social", description: "Campanha", color: "text-emerald-600" },
  ],
  franchise: [
    { icon: Store, label: "Operações", description: "Aviso operacional", color: "text-cyan-600" },
    { icon: Bell, label: "Comunicado", description: "Comunicado da rede", color: "text-blue-600" },
    { icon: Calendar, label: "Evento", description: "Evento da rede", color: "text-fuchsia-600" },
    { icon: DollarSign, label: "Comercial", description: "Aviso comercial", color: "text-emerald-600" },
  ],
};

interface DashboardQuickActionsProps {
  organizationType?: OrganizationType | string | null;
  onActionClick?: (action: QuickAction) => void;
}

export function DashboardQuickActions({ 
  organizationType, 
  onActionClick 
}: DashboardQuickActionsProps) {
  const type = (organizationType as OrganizationType) || "condominium";
  const actions = actionsByType[type] || actionsByType.condominium;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Card
          key={action.label}
          className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
          onClick={() => onActionClick?.(action)}
        >
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className={`w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-2`}>
              <action.icon className={`w-5 h-5 ${action.color}`} />
            </div>
            <span className="font-medium text-sm text-foreground">{action.label}</span>
            <span className="text-xs text-muted-foreground">{action.description}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
