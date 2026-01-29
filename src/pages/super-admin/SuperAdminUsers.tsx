import { useState } from "react";
import { Link } from "react-router-dom";
import { SuperAdminGuard } from "@/components/SuperAdminGuard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, ArrowLeft, Loader2, Shield, ShieldOff, Search, Pencil, Trash2, Settings } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshButton } from "@/components/RefreshButton";
import { EditUserDialog } from "@/components/super-admin/EditUserDialog";
import { UserRoleBadges } from "@/components/super-admin/UserRoleBadges";
import { ManageUserRolesDialog } from "@/components/super-admin/ManageUserRolesDialog";

export default function SuperAdminUsers() {
  const { users, loading, refetch } = useAllUsers();
  const { profile: currentProfile } = useProfile();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [promotingUser, setPromotingUser] = useState<any>(null);
  const [demotingUser, setDemotingUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [managingRolesUser, setManagingRolesUser] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePromote = async () => {
    if (!promotingUser || !currentProfile) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from("super_admins")
        .insert({
          user_id: promotingUser.id,
          created_by: currentProfile.id,
        });

      if (error) throw error;

      toast({ title: "Usuário promovido a Super Admin!" });
      setPromotingUser(null);
      refetch();
    } catch (error: any) {
      console.error("Error promoting user:", error);
      toast({ title: "Erro ao promover", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleDemote = async () => {
    if (!demotingUser) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from("super_admins")
        .delete()
        .eq("user_id", demotingUser.id);

      if (error) throw error;

      toast({ title: "Super Admin removido!" });
      setDemotingUser(null);
      refetch();
    } catch (error: any) {
      console.error("Error demoting user:", error);
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;

    setProcessing(true);
    try {
      // Delete from super_admins if exists
      await supabase
        .from("super_admins")
        .delete()
        .eq("user_id", deletingUser.id);

      // Delete user_roles (cascade should handle this, but being explicit)
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", deletingUser.id);

      // Delete profile
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deletingUser.id);

      if (error) throw error;

      toast({ title: "Usuário excluído com sucesso!" });
      setDeletingUser(null);
      refetch();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SuperAdminGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link to="/super-admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-destructive flex items-center justify-center">
                    <Users className="w-5 h-5 text-destructive-foreground" />
                  </div>
                  <span className="font-display text-xl font-bold text-foreground">Usuários</span>
                </div>
              </div>
              <RefreshButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container px-4 mx-auto py-8">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Papéis</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.full_name || "—"}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            {user.phone && (
                              <div className="text-xs text-muted-foreground">{user.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <UserRoleBadges 
                            isSuperAdmin={user.is_super_admin || false} 
                            roles={user.roles || []} 
                          />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {user.id !== currentProfile?.id && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingUser(user)}
                                  title="Editar perfil"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setManagingRolesUser(user)}
                                  title="Gerenciar papéis"
                                >
                                  <Settings className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeletingUser(user)}
                                  className="text-destructive hover:text-destructive"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                {user.is_super_admin ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDemotingUser(user)}
                                    className="text-destructive hover:text-destructive"
                                    title="Remover Super Admin"
                                  >
                                    <ShieldOff className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setPromotingUser(user)}
                                    title="Promover a Super Admin"
                                  >
                                    <Shield className="w-4 h-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </main>

        {/* Manage User Roles Dialog */}
        <ManageUserRolesDialog
          user={managingRolesUser}
          open={!!managingRolesUser}
          onOpenChange={(open) => !open && setManagingRolesUser(null)}
          onSuccess={refetch}
        />

        {/* Edit User Dialog */}
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onSuccess={refetch}
        />

        {/* Delete User Dialog */}
        <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir <strong>{deletingUser?.full_name || deletingUser?.email}</strong>?
                Esta ação é irreversível e removerá todos os dados associados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={processing} className="bg-destructive hover:bg-destructive/90">
                {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Promote Dialog */}
        <AlertDialog open={!!promotingUser} onOpenChange={(open) => !open && setPromotingUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Promover a Super Admin?</AlertDialogTitle>
              <AlertDialogDescription>
                <strong>{promotingUser?.full_name || promotingUser?.email}</strong> terá acesso completo
                a todos os condomínios e usuários da plataforma.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handlePromote} disabled={processing}>
                {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Demote Dialog */}
        <AlertDialog open={!!demotingUser} onOpenChange={(open) => !open && setDemotingUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover Super Admin?</AlertDialogTitle>
              <AlertDialogDescription>
                <strong>{demotingUser?.full_name || demotingUser?.email}</strong> perderá o acesso
                global à plataforma.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDemote} disabled={processing} className="bg-destructive hover:bg-destructive/90">
                {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SuperAdminGuard>
  );
}
