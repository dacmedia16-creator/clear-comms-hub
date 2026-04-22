import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateWhatsAppSender } from "@/hooks/useWhatsAppSenders";

interface AddWhatsAppSenderDialogProps {
  onAdd: (sender: CreateWhatsAppSender) => Promise<boolean>;
}

function formatPhoneBR(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 2) return numbers.length ? `(${numbers}` : "";
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

const BUTTON_CONFIG_OPTIONS = [
  { value: "two_buttons", label: "2 Botões (link + optout)", description: "btn[0]=slug, btn[1]=optout" },
  { value: "single_button_idx0", label: "1 Botão (idx 0)", description: "btn[0]=optout, sem nome" },
  { value: "single_button_idx1", label: "1 Botão (idx 1)", description: "btn[1]=optout" },
  { value: "no_buttons", label: "Sem botões", description: "Nenhum botão dinâmico" },
];

export function AddWhatsAppSenderDialog({ onAdd }: AddWhatsAppSenderDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [templateIdentifier, setTemplateIdentifier] = useState("");
  const [buttonConfig, setButtonConfig] = useState("two_buttons");
  const [hasNomeParam, setHasNomeParam] = useState(true);

  const resetForm = () => {
    setName("");
    setPhone("");
    setApiKey("");
    setIsActive(true);
    setIsDefault(false);
    setTemplateIdentifier("");
    setButtonConfig("two_buttons");
    setHasNomeParam(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim() || !apiKey.trim()) return;

    setSaving(true);
    const success = await onAdd({
      name: name.trim(),
      phone: phone.replace(/\D/g, ""),
      api_key: apiKey.trim(),
      is_active: isActive,
      is_default: isDefault,
      template_identifier: templateIdentifier.trim() || null,
      button_config: buttonConfig,
      has_nome_param: hasNomeParam,
    });

    setSaving(false);
    if (success) {
      resetForm();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Número
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar Número de WhatsApp</DialogTitle>
            <DialogDescription>
              Cadastre um novo número para disparo de mensagens via Zion Talk
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Identificador</Label>
              <Input
                id="name"
                placeholder="Ex: Número Principal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (com DDD)</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(formatPhoneBR(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key do Zion Talk</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Cole a API Key aqui"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                A API Key será armazenada de forma segura no banco de dados
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateIdentifier">Identificador do Template (opcional)</Label>
              <Input
                id="templateIdentifier"
                placeholder="aviso_pro_confirma_3"
                value={templateIdentifier}
                onChange={(e) => setTemplateIdentifier(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Copie o identificador exato do template no painel Zion Talk. Vazio = template padrão.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Configuração de Botões</Label>
              <Select value={buttonConfig} onValueChange={setButtonConfig}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUTTON_CONFIG_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Define como os botões dinâmicos do template são mapeados no payload.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasNomeParam"
                checked={hasNomeParam}
                onCheckedChange={(checked) => setHasNomeParam(checked === true)}
              />
              <Label htmlFor="hasNomeParam" className="text-sm font-normal cursor-pointer">
                Template usa variável <code className="text-xs bg-muted px-1 rounded">nome</code>
              </Label>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Número Ativo</Label>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(checked === true)}
              />
              <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
                Definir como número padrão para disparos
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !name.trim() || !phone.trim() || !apiKey.trim()}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
