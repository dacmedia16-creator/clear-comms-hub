import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAllCondominiums } from "@/hooks/useAllCondominiums";
import { Loader2, Trash2, Plus, Check, Clock } from "lucide-react";

interface UserRole {
  id: string;
  role: "admin" | "syndic" | "resident" | "collaborator";
  condominium_name: string;
  condominium_id: string;
  is_approved?: boolean;
}

interface ManageUserRolesDialogProps {
  user: {
    id: string;
    full_name: string | null;
    email: string | null;
    roles?: UserRole[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface EditableRole extends UserRole {
  _action?: "update" | "delete" | "create" | "approve";
  _originalRole?: UserRole["role"];
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  syndic: "Síndico",
  resident: "Morador",
  collaborator: "Colaborador",
};

export function ManageUserRolesDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ManageUserRolesDialogProps) {
  const { toast } = useToast();
  const { condominiums } = useAllCondominiums();
  const [roles, setRoles] = useState<EditableRole[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCondoId, setNewCondoId] = useState("");
  const [newRole, setNewRole] = useState<UserRole["role"]>("resident");

  useEffect(() => {
    if (user?.roles) {
      setRoles(user.roles.map(r => ({ ...r })));
    } else {
      setRoles([]);
    }
    setShowAddForm(false);
    setNewCondoId("");
    setNewRole("resident");
  }, [user]);

  const handleRoleChange = (roleId: string, newRoleValue: UserRole["role"]) => {
    setRoles(prev =>
      prev.map(r => {
        if (r.id === roleId) {
          const isOriginalRole = r._originalRole === undefined 
            ? r.role === newRoleValue 
            : r._originalRole === newRoleValue;
          return {
            ...r,
            role: newRoleValue,
            _action: isOriginalRole ? undefined : "update",
            _originalRole: r._originalRole ?? r.role,
          };
        }
        return r;
      })
    );
  };

  const handleApproveRole = (roleId: string) => {
    setRoles(prev =>
      prev.map(r =>
        r.id === roleId ? { ...r, is_approved: true, _action: "approve" as const } : r
      )
    );
  };

  const handleRemoveRole = (roleId: string) => {
    setRoles(prev =>
      prev.map(r =>
        r.id === roleId ? { ...r, _action: "delete" as const } : r
      )
    );
  };

  const handleUndoRemove = (roleId: string) => {
    setRoles(prev =>
      prev.map(r =>
        r.id === roleId ? { ...r, _action: undefined } : r
      )
    );
  };

  const handleAddRole = () => {
    if (!newCondoId || !user) return;

    const condo = condominiums.find(c => c.id === newCondoId);
    if (!condo) return;

    // Check if already exists
    if (roles.some(r => r.condominium_id === newCondoId && r._action !== "delete")) {
      toast({
        title: "Usuário já está neste condomínio",
        variant: "destructive",
      });
      return;
    }

    const tempId = `temp-${Date.now()}`;
    setRoles(prev => [
      ...prev,
      {
        id: tempId,
        role: newRole,
        condominium_id: newCondoId,
        condominium_name: condo.name,
        is_approved: true, // Super admin creates as approved
        _action: "create",
      },
    ]);

    setShowAddForm(false);
    setNewCondoId("");
    setNewRole("resident");
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const toUpdate = roles.filter(r => r._action === "update");
      const toDelete = roles.filter(r => r._action === "delete");
      const toCreate = roles.filter(r => r._action === "create");
      const toApprove = roles.filter(r => r._action === "approve");

      // Update roles
      for (const role of toUpdate) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: role.role })
          .eq("id", role.id);
        if (error) throw error;
      }

      // Approve roles
      for (const role of toApprove) {
        const { error } = await supabase
          .from("user_roles")
          .update({ is_approved: true })
          .eq("id", role.id);
        if (error) throw error;
      }

      // Delete roles
      for (const role of toDelete) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("id", role.id);
        if (error) throw error;
      }

      // Create roles
      for (const role of toCreate) {
        const { error } = await supabase
          .from("user_roles")
          .insert({
            user_id: user.id,
            condominium_id: role.condominium_id,
            role: role.role,
            is_approved: true,
          });
        if (error) throw error;
      }

      toast({ title: "Papéis atualizados com sucesso!" });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving roles:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = roles.some(r => r._action);
  const activeRoles = roles.filter(r => r._action !== "delete");
  const deletedRoles = roles.filter(r => r._action === "delete");

  // Condos not yet assigned
  const availableCondos = condominiums.filter(
    c => !roles.some(r => r.condominium_id === c.id && r._action !== "delete")
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerenciar Papéis</DialogTitle>
          <DialogDescription>
            {user?.full_name || user?.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {activeRoles.length === 0 && !showAddForm && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Este usuário não está associado a nenhum condomínio.
            </p>
          )}

          {activeRoles.map(role => (
            <div
              key={role.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                role.is_approved === false ? "bg-amber-500/10 border border-amber-500/20" : "bg-muted/50"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {role.condominium_name}
                  </p>
                  {role.is_approved === false && (
                    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600">
                      <Clock className="w-3 h-3" />
                      Pendente
                    </span>
                  )}
                </div>
              </div>
              <Select
                value={role.role}
                onValueChange={(value) =>
                  handleRoleChange(role.id, value as UserRole["role"])
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{roleLabels.admin}</SelectItem>
                  <SelectItem value="syndic">{roleLabels.syndic}</SelectItem>
                  <SelectItem value="resident">{roleLabels.resident}</SelectItem>
                  <SelectItem value="collaborator">{roleLabels.collaborator}</SelectItem>
                </SelectContent>
              </Select>
              {role.is_approved === false && role._action !== "approve" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleApproveRole(role.id)}
                  className="text-green-600 hover:text-green-600 hover:bg-green-500/10"
                  title="Aprovar"
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}
              {role._action === "approve" && (
                <span className="text-xs text-green-600 font-medium">Aprovar</span>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRole(role.id)}
                className="text-destructive hover:text-destructive"
                title={role.is_approved === false ? "Rejeitar" : "Remover"}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {deletedRoles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">A remover:</p>
              {deletedRoles.map(role => (
                <div
                  key={role.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 text-muted-foreground line-through"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{role.condominium_name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUndoRemove(role.id)}
                  >
                    Desfazer
                  </Button>
                </div>
              ))}
            </div>
          )}

          {showAddForm ? (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed">
              <Select value={newCondoId} onValueChange={setNewCondoId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione o condomínio" />
                </SelectTrigger>
                <SelectContent>
                  {availableCondos.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newRole}
                onValueChange={(v) => setNewRole(v as UserRole["role"])}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{roleLabels.admin}</SelectItem>
                  <SelectItem value="syndic">{roleLabels.syndic}</SelectItem>
                  <SelectItem value="resident">{roleLabels.resident}</SelectItem>
                  <SelectItem value="collaborator">{roleLabels.collaborator}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleAddRole}
                disabled={!newCondoId}
              >
                Adicionar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            availableCondos.length > 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar a outro condomínio
              </Button>
            )
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
