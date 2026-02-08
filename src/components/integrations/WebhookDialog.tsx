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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Webhook, useWebhooks } from "@/hooks/useWebhooks";

interface WebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  condominiumId: string;
  webhook?: Webhook | null;
}

const AVAILABLE_EVENTS = [
  { value: "announcement.created", label: "Aviso criado" },
  { value: "announcement.updated", label: "Aviso atualizado" },
  { value: "announcement.deleted", label: "Aviso excluído" },
  { value: "member.created", label: "Membro adicionado" },
  { value: "member.updated", label: "Membro atualizado" },
];

function generateSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let secret = "whsec_";
  for (let i = 0; i < 24; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

export function WebhookDialog({
  open,
  onOpenChange,
  condominiumId,
  webhook,
}: WebhookDialogProps) {
  const { createWebhook, updateWebhook } = useWebhooks(condominiumId);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [events, setEvents] = useState<string[]>(["announcement.created"]);

  const isEditing = !!webhook;

  useEffect(() => {
    if (webhook) {
      setName(webhook.name);
      setUrl(webhook.url);
      setSecret(webhook.secret || "");
      setEvents(webhook.events);
    } else {
      setName("");
      setUrl("");
      setSecret("");
      setEvents(["announcement.created"]);
    }
    setShowSecret(false);
  }, [webhook, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || events.length === 0) return;

    setSaving(true);
    try {
      if (isEditing && webhook) {
        await updateWebhook(webhook.id, {
          name: name.trim(),
          url: url.trim(),
          secret: secret.trim() || null,
          events,
        });
      } else {
        await createWebhook({
          name: name.trim(),
          url: url.trim(),
          secret: secret.trim() || undefined,
          events,
        });
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEventToggle = (eventValue: string) => {
    setEvents((prev) =>
      prev.includes(eventValue)
        ? prev.filter((e) => e !== eventValue)
        : [...prev, eventValue]
    );
  };

  const handleGenerateSecret = () => {
    setSecret(generateSecret());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Editar Webhook" : "Novo Webhook"}
          </DialogTitle>
          <DialogDescription>
            Configure uma URL para receber notificações automáticas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sistema de RH"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL de destino *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://exemplo.com/webhook"
              required
            />
            <p className="text-xs text-muted-foreground">
              Deve ser uma URL HTTPS válida que aceita requisições POST
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret">Chave secreta (opcional)</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="secret"
                  type={showSecret ? "text" : "password"}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Para validação HMAC"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <Button type="button" variant="outline" onClick={handleGenerateSecret}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Usada para assinar requisições com HMAC-SHA256
            </p>
          </div>

          <div className="space-y-2">
            <Label>Eventos *</Label>
            <div className="space-y-2 border rounded-lg p-3">
              {AVAILABLE_EVENTS.map((event) => (
                <div key={event.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={event.value}
                    checked={events.includes(event.value)}
                    onCheckedChange={() => handleEventToggle(event.value)}
                  />
                  <label
                    htmlFor={event.value}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {event.label}
                  </label>
                </div>
              ))}
            </div>
            {events.length === 0 && (
              <p className="text-xs text-destructive">Selecione ao menos um evento</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !name.trim() || !url.trim() || events.length === 0}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Salvar" : "Criar Webhook"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
