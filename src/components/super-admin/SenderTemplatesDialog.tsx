import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Star, Trash2 } from "lucide-react";
import {
  useWhatsAppSenderTemplates,
  WhatsAppSenderTemplate,
} from "@/hooks/useWhatsAppSenderTemplates";
import { WhatsAppSender } from "@/hooks/useWhatsAppSenders";

interface SenderTemplatesDialogProps {
  sender: WhatsAppSender | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BUTTON_CONFIG_OPTIONS = [
  { value: "two_buttons", label: "2 Botões (link + optout)" },
  { value: "single_button_idx0", label: "1 Botão (idx 0)" },
  { value: "single_button_idx1", label: "1 Botão (idx 1)" },
  { value: "no_buttons", label: "Sem botões" },
];

export function SenderTemplatesDialog({ sender, open, onOpenChange }: SenderTemplatesDialogProps) {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } =
    useWhatsAppSenderTemplates(sender?.id);

  const [showForm, setShowForm] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [label, setLabel] = useState("");
  const [buttonConfig, setButtonConfig] = useState("two_buttons");
  const [hasNomeParam, setHasNomeParam] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setIdentifier("");
    setLabel("");
    setButtonConfig("two_buttons");
    setHasNomeParam(true);
    setIsDefault(false);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender || !identifier.trim() || !label.trim()) return;
    setSaving(true);
    const ok = await createTemplate({
      sender_id: sender.id,
      identifier: identifier.trim(),
      label: label.trim(),
      button_config: buttonConfig,
      has_nome_param: hasNomeParam,
      is_default: isDefault,
    });
    setSaving(false);
    if (ok) reset();
  };

  const handleSetDefault = async (t: WhatsAppSenderTemplate) => {
    await updateTemplate(t.id, { sender_id: t.sender_id, is_default: true });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Templates de {sender?.name}</DialogTitle>
          <DialogDescription>
            Gerencie os templates Meta disponíveis para este número. O template padrão será usado quando nenhum for selecionado no envio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum template cadastrado. Adicione um abaixo.
            </p>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{t.label}</span>
                      {t.is_default && (
                        <Badge variant="default" className="gap-1 text-xs">
                          <Star className="w-3 h-3" />
                          Padrão
                        </Badge>
                      )}
                    </div>
                    <code className="text-xs text-muted-foreground font-mono">
                      {t.identifier}
                    </code>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">{t.button_config}</Badge>
                      {!t.has_nome_param && (
                        <Badge variant="secondary" className="text-xs">sem nome</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!t.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(t)}
                      >
                        Definir padrão
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTemplate(t.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showForm ? (
            <Button variant="outline" onClick={() => setShowForm(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar template
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <div className="space-y-2">
                <Label>Identificador (Meta)</Label>
                <Input
                  placeholder="remax_corretor"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Rótulo (exibido na UI)</Label>
                <Input
                  placeholder="Re/Max Corretor"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Configuração de botões</Label>
                <Select value={buttonConfig} onValueChange={setButtonConfig}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BUTTON_CONFIG_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hnp"
                  checked={hasNomeParam}
                  onCheckedChange={(c) => setHasNomeParam(c === true)}
                />
                <Label htmlFor="hnp" className="text-sm font-normal cursor-pointer">
                  Usa variável <code className="text-xs bg-background px-1 rounded">nome</code>
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isd"
                  checked={isDefault}
                  onCheckedChange={(c) => setIsDefault(c === true)}
                />
                <Label htmlFor="isd" className="text-sm font-normal cursor-pointer">
                  Definir como padrão deste número
                </Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={reset} disabled={saving}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving || !identifier.trim() || !label.trim()}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Adicionar"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
