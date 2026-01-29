import { Shield, Clock } from "lucide-react";

interface UserRole {
  role: "admin" | "syndic" | "resident" | "collaborator";
  condominium_name: string;
  condominium_id: string;
  is_approved?: boolean;
}

interface UserRoleBadgesProps {
  isSuperAdmin: boolean;
  roles: UserRole[];
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  syndic: "Síndico",
  resident: "Morador",
  collaborator: "Colaborador",
};

const roleStyles: Record<string, string> = {
  admin: "bg-green-500/10 text-green-600",
  syndic: "bg-accent/10 text-accent-foreground",
  resident: "bg-muted text-muted-foreground",
  collaborator: "bg-yellow-500/10 text-yellow-600",
};

export function UserRoleBadges({ isSuperAdmin, roles }: UserRoleBadgesProps) {
  if (isSuperAdmin) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive">
        <Shield className="w-3 h-3" />
        Super Admin
      </span>
    );
  }

  if (roles.length === 0) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
        Sem papel
      </span>
    );
  }

  // Group approved roles by type
  const approvedRoles = roles.filter(r => r.is_approved !== false);
  const pendingRoles = roles.filter(r => r.is_approved === false);

  const roleGroups: Record<string, string[]> = {};
  for (const r of approvedRoles) {
    if (!roleGroups[r.role]) {
      roleGroups[r.role] = [];
    }
    roleGroups[r.role].push(r.condominium_name);
  }

  const pendingGroups: Record<string, string[]> = {};
  for (const r of pendingRoles) {
    if (!pendingGroups[r.role]) {
      pendingGroups[r.role] = [];
    }
    pendingGroups[r.role].push(r.condominium_name);
  }

  return (
    <div className="flex flex-wrap gap-1">
      {/* Approved roles */}
      {Object.entries(roleGroups).map(([role, condos]) => (
        <span
          key={role}
          className={`text-xs px-2 py-1 rounded-full ${roleStyles[role] || "bg-muted text-muted-foreground"}`}
          title={condos.join(", ")}
        >
          {roleLabels[role] || role}
          {condos.length > 1 ? ` (${condos.length})` : ` (${condos[0]})`}
        </span>
      ))}
      
      {/* Pending roles */}
      {Object.entries(pendingGroups).map(([role, condos]) => (
        <span
          key={`pending-${role}`}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-600"
          title={`Aguardando aprovação: ${condos.join(", ")}`}
        >
          <Clock className="w-3 h-3" />
          {roleLabels[role] || role}
          {condos.length > 1 ? ` (${condos.length})` : ` (${condos[0]})`}
        </span>
      ))}
    </div>
  );
}
