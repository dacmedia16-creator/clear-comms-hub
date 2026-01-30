import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CondoMember, getMemberDisplayName, getMemberEmail, getMemberPhone } from "@/hooks/useCondoMembers";
import { isValidBlock, isValidUnit, formatBlock } from "@/lib/utils";

export interface UpdateMemberData {
  fullName?: string;
  phone?: string;
  email?: string;
  block: string;
  unit: string;
}

interface EditMemberDialogProps {
  member: CondoMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (roleId: string, data: UpdateMemberData) => Promise<{ success: boolean; error?: string }>;
}

export function EditMemberDialog({
  member,
  open,
  onOpenChange,
  onSave,
}: EditMemberDialogProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [block, setBlock] = useState("");
  const [unit, setUnit] = useState("");
  const [saving, setSaving] = useState(false);

  // Is this a manual condo_member (editable) or authenticated profile (read-only personal data)
  const isCondoMember = !!member?.member_id;
  const isProfile = !!member?.user_id && !member?.member_id;

  useEffect(() => {
    if (member && open) {
      setFullName(getMemberDisplayName(member));
      setPhone(getMemberPhone(member) || "");
      setEmail(getMemberEmail(member) || "");
      setBlock(member.block || "");
      setUnit(member.unit || "");
    }
  }, [member, open]);

  // Handler para Bloco - aceita numeros ou uma letra
  const handleBlockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir vazio, letra unica ou numero sem zero inicial
    if (value === "" || /^[A-Za-z]$/.test(value) || /^[1-9][0-9]*$/.test(value)) {
      setBlock(formatBlock(value));
    }
  };

  // Handler para Unidade - aceita apenas numeros
  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir apenas numeros
    if (value === "" || /^[0-9]+$/.test(value)) {
      setUnit(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    if (!isValidBlock(block)) {
      return;
    }
    if (!isValidUnit(unit)) {
      return;
    }

    setSaving(true);
    try {
      const data: UpdateMemberData = {
        block: block.trim(),
        unit: unit.trim(),
      };

      // Only include personal data for condo_members
      if (isCondoMember) {
        data.fullName = fullName.trim();
        data.phone = phone.trim() || undefined;
        data.email = email.trim() || undefined;
      }

      const result = await onSave(member.id, data);
      if (result.success) {
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const ReadOnlyTooltip = ({ children }: { children: React.ReactNode }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>Este usuário gerencia seus próprios dados</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Morador</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Info Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="fullName">Nome Completo *</Label>
                {isProfile && (
                  <ReadOnlyTooltip>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </ReadOnlyTooltip>
                )}
              </div>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={isCondoMember}
                disabled={isProfile}
                className={isProfile ? "bg-muted" : ""}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="phone">Telefone</Label>
                {isProfile && (
                  <ReadOnlyTooltip>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </ReadOnlyTooltip>
                )}
              </div>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                disabled={isProfile}
                className={isProfile ? "bg-muted" : ""}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="email">Email</Label>
                {isProfile && (
                  <ReadOnlyTooltip>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </ReadOnlyTooltip>
                )}
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                disabled={isProfile}
                className={isProfile ? "bg-muted" : ""}
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="block">Bloco/Torre *</Label>
              <Input
                id="block"
                value={block}
                onChange={handleBlockChange}
                placeholder="Ex: 1, A"
                maxLength={10}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unidade/Apt *</Label>
              <Input
                id="unit"
                value={unit}
                onChange={handleUnitChange}
                placeholder="Ex: 101"
                maxLength={10}
                required
              />
            </div>
          </div>

          {isProfile && (
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              Dados pessoais de usuários autenticados só podem ser alterados pelo próprio usuário.
              Você pode editar apenas o Bloco/Torre e Unidade/Apt.
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !isValidBlock(block) || !isValidUnit(unit)}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
