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
import { validateLocationOptional, formatBlock } from "@/lib/utils";
import { 
  OrganizationTerms, 
  OrganizationBehavior,
  getOrganizationTerms, 
  getOrganizationBehavior,
  getLocationPlaceholders,
  getRoleLabel 
} from "@/lib/organization-types";

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
  terms?: OrganizationTerms;
  behavior?: OrganizationBehavior;
}

export function AddMemberDialog({
  open,
  onOpenChange,
  availableUsers,
  onAddExisting,
  onCreateNew,
  terms = getOrganizationTerms("condominium"),
  behavior = getOrganizationBehavior("condominium"),
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

  // Get placeholders
  const placeholders = getLocationPlaceholders();

  // Handlers para validação em tempo real
  const handleBlockChange = (value: string, setter: (v: string) => void) => {
    if (behavior.blockValidation === "flexible") {
      // Texto livre - aceita qualquer coisa até 50 chars
      if (value.length <= 50) {
        setter(value);
      }
    } else {
      // Validação estrita - número ou letra única
      if (value === "" || /^[A-Za-z]$/.test(value) || /^[1-9][0-9]*$/.test(value)) {
        setter(formatBlock(value));
      }
    }
  };

  const handleUnitChange = (value: string, setter: (v: string) => void) => {
    if (behavior.unitValidation === "flexible") {
      // Texto livre - aceita qualquer coisa até 50 chars
      if (value.length <= 50) {
        setter(value);
      }
    } else {
      // Validação estrita - apenas números
      if (value === "" || /^[0-9]+$/.test(value)) {
        setter(value);
      }
    }
  };

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

  const validateLocationFields = (blockValue: string, unitValue: string): string | null => {
    const blockValid = validateLocationOptional(
      blockValue,
      "block",
      behavior.blockValidation,
      behavior.requiresLocation
    );
    const unitValid = validateLocationOptional(
      unitValue,
      "unit",
      behavior.unitValidation,
      behavior.requiresLocation
    );

    if (!blockValid) {
      if (behavior.blockValidation === "strict") {
        return `${terms.block} deve ser um número (sem zero inicial) ou uma letra`;
      }
      return `${terms.block} é obrigatório`;
    }
    if (!unitValid) {
      if (behavior.unitValidation === "strict") {
        return `${terms.unit} deve conter apenas números`;
      }
      return `${terms.unit} é obrigatório`;
    }
    return null;
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

    const locationError = validateLocationFields(block, unit);
    if (locationError) {
      setError(locationError);
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

    const locationError = validateLocationFields(existingBlock, existingUnit);
    if (locationError) {
      setError(locationError);
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

  // Helper to render location fields
  const renderLocationFields = (
    blockValue: string,
    unitValue: string,
    onBlockChange: (v: string) => void,
    onUnitChange: (v: string) => void,
    prefix: string = ""
  ) => {
    const blockId = `${prefix}block`;
    const unitId = `${prefix}unit`;
    const isRequired = behavior.requiresLocation;

    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={blockId}>
            {terms.block} {isRequired && "*"}
          </Label>
          <Input
            id={blockId}
            value={blockValue}
            onChange={(e) => handleBlockChange(e.target.value, onBlockChange)}
            placeholder={`Ex: ${placeholders.block}`}
            maxLength={behavior.blockValidation === "flexible" ? 50 : 10}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={unitId}>
            {terms.unit} {isRequired && "*"}
          </Label>
          <Input
            id={unitId}
            value={unitValue}
            onChange={(e) => handleUnitChange(e.target.value, onUnitChange)}
            placeholder={`Ex: ${placeholders.unit}`}
            maxLength={behavior.unitValidation === "flexible" ? 50 : 10}
          />
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar {terms.member}</DialogTitle>
          <DialogDescription>
            Cadastre um novo {terms.member.toLowerCase()} ou selecione um usuário existente
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">Novo {terms.member}</TabsTrigger>
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

              {renderLocationFields(block, unit, setBlock, setUnit)}

              <div className="space-y-2">
                <Label>Função *</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resident">{getRoleLabel("resident", terms)}</SelectItem>
                    <SelectItem value="syndic">{getRoleLabel("syndic", terms)}</SelectItem>
                    <SelectItem value="admin">{getRoleLabel("admin", terms)}</SelectItem>
                    <SelectItem value="collaborator">{getRoleLabel("collaborator", terms)}</SelectItem>
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

              {renderLocationFields(
                existingBlock,
                existingUnit,
                setExistingBlock,
                setExistingUnit,
                "existing"
              )}

              <div className="space-y-2">
                <Label>Função *</Label>
                <Select value={existingRole} onValueChange={(v) => setExistingRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resident">{getRoleLabel("resident", terms)}</SelectItem>
                    <SelectItem value="syndic">{getRoleLabel("syndic", terms)}</SelectItem>
                    <SelectItem value="admin">{getRoleLabel("admin", terms)}</SelectItem>
                    <SelectItem value="collaborator">{getRoleLabel("collaborator", terms)}</SelectItem>
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
