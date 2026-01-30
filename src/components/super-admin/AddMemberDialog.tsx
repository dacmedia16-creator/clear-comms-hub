import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  full_name: string | null;
  email: string | null;
}

type Role = "admin" | "syndic" | "resident" | "collaborator";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableUsers: User[];
  onAddExisting: (userId: string, role: Role, block: string, unit: string) => Promise<{ success: boolean; error?: string }>;
  onCreateNew: (data: {
    fullName: string;
    phone: string;
    email: string;
    block: string;
    unit: string;
    role: Role;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function AddMemberDialog({
  open,
  onOpenChange,
  availableUsers,
  onAddExisting,
  onCreateNew,
}: AddMemberDialogProps) {
  const [activeTab, setActiveTab] = useState("new");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for new member
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [block, setBlock] = useState("");
  const [unit, setUnit] = useState("");
  const [role, setRole] = useState<Role>("resident");

  // Form state for existing user
  const [selectedUserId, setSelectedUserId] = useState("");
  const [existingBlock, setExistingBlock] = useState("");
  const [existingUnit, setExistingUnit] = useState("");
  const [existingRole, setExistingRole] = useState<Role>("resident");

  const resetForm = () => {
    setFullName("");
    setPhone("");
    setEmail("");
    setBlock("");
    setUnit("");
    setRole("resident");
    setSelectedUserId("");
    setExistingBlock("");
    setExistingUnit("");
    setExistingRole("resident");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim() || fullName.length < 2) {
      setError("Nome deve ter ao menos 2 caracteres");
      return;
    }
    if (!phone.trim()) {
      setError("Telefone é obrigatório");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Email inválido");
      return;
    }
    if (!block.trim()) {
      setError("Bloco/Torre é obrigatório");
      return;
    }
    if (!unit.trim()) {
      setError("Unidade/Apt é obrigatório");
      return;
    }

    setSaving(true);
    const result = await onCreateNew({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      block: block.trim(),
      unit: unit.trim(),
      role,
    });
    setSaving(false);

    if (result.success) {
      handleClose();
    } else {
      setError(result.error || "Erro ao adicionar membro");
    }
  };

  const handleSubmitExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedUserId) {
      setError("Selecione um usuário");
      return;
    }
    if (!existingBlock.trim()) {
      setError("Bloco/Torre é obrigatório");
      return;
    }
    if (!existingUnit.trim()) {
      setError("Unidade/Apt é obrigatório");
      return;
    }

    setSaving(true);
    const result = await onAddExisting(selectedUserId, existingRole, existingBlock.trim(), existingUnit.trim());
    setSaving(false);

    if (result.success) {
      handleClose();
    } else {
      setError(result.error || "Erro ao adicionar membro");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Membro</DialogTitle>
          <DialogDescription>
            Cadastre um novo morador ou selecione um usuário existente
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">Novo Morador</TabsTrigger>
            <TabsTrigger value="existing">Usuário Existente</TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <form onSubmit={handleSubmitNew} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="João da Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+55 11 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="joao@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="block">Bloco/Torre *</Label>
                  <Input
                    id="block"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    placeholder="A, Torre 1, Bloco B"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade/Apt *</Label>
                  <Input
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="101, 202, Casa 5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Função *</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resident">Morador</SelectItem>
                    <SelectItem value="syndic">Síndico</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="collaborator">Colaborador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Adicionar
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="existing">
            <form onSubmit={handleSubmitExisting} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Usuário *</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        Nenhum usuário disponível
                      </div>
                    ) : (
                      availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email || "Sem nome"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="existingBlock">Bloco/Torre *</Label>
                  <Input
                    id="existingBlock"
                    value={existingBlock}
                    onChange={(e) => setExistingBlock(e.target.value)}
                    placeholder="A, Torre 1, Bloco B"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="existingUnit">Unidade/Apt *</Label>
                  <Input
                    id="existingUnit"
                    value={existingUnit}
                    onChange={(e) => setExistingUnit(e.target.value)}
                    placeholder="101, 202, Casa 5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Função *</Label>
                <Select value={existingRole} onValueChange={(v) => setExistingRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resident">Morador</SelectItem>
                    <SelectItem value="syndic">Síndico</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="collaborator">Colaborador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving || !selectedUserId}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Adicionar
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
