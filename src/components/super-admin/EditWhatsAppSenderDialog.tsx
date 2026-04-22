import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WhatsAppSender, CreateWhatsAppSender } from "@/hooks/useWhatsAppSenders";

interface EditWhatsAppSenderDialogProps {
  sender: WhatsAppSender | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<CreateWhatsAppSender>) => Promise<boolean>;
}

function formatPhoneBR(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 2) return numbers.length ? `(${numbers}` : "";
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

const BUTTON_CONFIG_OPTIONS = [
  { value: "two_buttons", label: "2 Botões (link + optout)" },
  { value: "single_button_idx0", label: "1 Botão (idx 0)" },
  { value: "single_button_idx1", label: "1 Botão (idx 1)" },
  { value: "no_buttons", label: "Sem botões" },
];

const PARAM_STYLE_OPTIONS = [
  { value: "named", label: "Parâmetros nomeados" },
  { value: "positional", label: "Parâmetros posicionais" },
];

export function EditWhatsAppSenderDialog({ sender, open, onOpenChange, onUpdate }: EditWhatsAppSenderDialogProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [templateIdentifier, setTemplateIdentifier] = useState("");
  const [buttonConfig, setButtonConfig] = useState("two_buttons");
  const [hasNomeParam, setHasNomeParam] = useState(true);
  const [paramStyle, setParamStyle] = useState("named");

  useEffect(() => {
    if (sender) {
      setName(sender.name);
      setPhone(formatPhoneBR(sender.phone));
      setApiKey(""); // Don't show existing API key for security
      setIsActive(sender.is_active);
      setIsDefault(sender.is_default);
      setTemplateIdentifier(sender.template_identifier ?? "");
      setButtonConfig(sender.button_config ?? "two_buttons");
      setHasNomeParam(sender.has_nome_param ?? true);
      setParamStyle(sender.param_style ?? "named");
    }
  }, [sender]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sender || !name.trim() || !phone.trim()) return;

    setSaving(true);
    
    const updates: Partial<CreateWhatsAppSender> = {
      name: name.trim(),
      phone: phone.replace(/\D/g, ""),
      is_active: isActive,
      is_default: isDefault,
      template_identifier: templateIdentifier.trim() || null,
      button_config: buttonConfig,
      has_nome_param: hasNomeParam,
      param_style: paramStyle,
    };

    // Only update API key if provided
    if (apiKey.trim()) {
      updates.api_key = apiKey.trim();
    }

    const success = await onUpdate(sender.id, updates);

    setSaving(false);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Número de WhatsApp</DialogTitle>
            <DialogDescription>
              Atualize as informações do número cadastrado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Nome Identificador</Label>
              <Input
                id="editName"
                placeholder="Ex: Número Principal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPhone">Telefone (com DDD)</Label>
              <Input
                id="editPhone"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(formatPhoneBR(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editApiKey">Nova API Key (opcional)</Label>
              <Input
                id="editApiKey"
                type="password"
                placeholder="Deixe vazio para manter a atual"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Preencha apenas se desejar alterar a API Key
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editTemplateIdentifier">Identificador do Template (opcional)</Label>
              <Input
                id="editTemplateIdentifier"
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

            <div className="space-y-2">
              <Label>Estilo dos parâmetros</Label>
              <Select value={paramStyle} onValueChange={setParamStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PARAM_STYLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="editHasNomeParam"
                checked={hasNomeParam}
                onCheckedChange={(checked) => setHasNomeParam(checked === true)}
              />
              <Label htmlFor="editHasNomeParam" className="text-sm font-normal cursor-pointer">
                Template usa variável <code className="text-xs bg-muted px-1 rounded">nome</code>
              </Label>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="editIsActive">Número Ativo</Label>
              <Switch
                id="editIsActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="editIsDefault"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(checked === true)}
              />
              <Label htmlFor="editIsDefault" className="text-sm font-normal cursor-pointer">
                Definir como número padrão para disparos
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !name.trim() || !phone.trim()}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
