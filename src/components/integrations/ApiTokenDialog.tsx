import { useState } from "react";
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
import { Loader2, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { AVAILABLE_PERMISSIONS, useApiTokens } from "@/hooks/useApiTokens";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  condominiumId: string;
}

export function ApiTokenDialog({ open, onOpenChange, condominiumId }: ApiTokenDialogProps) {
  const { createToken } = useApiTokens(condominiumId);
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["read:announcements", "read:members"]);
  const [expiresIn, setExpiresIn] = useState<string>("never");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || permissions.length === 0) return;

    setSaving(true);
    try {
      let expiresAt: Date | null = null;
      if (expiresIn !== "never") {
        expiresAt = new Date();
        const days = parseInt(expiresIn);
        expiresAt.setDate(expiresAt.getDate() + days);
      }

      const result = await createToken({
        name: name.trim(),
        permissions,
        expiresAt,
      });

      if (result) {
        setCreatedToken(result.plainToken);
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionToggle = (permValue: string) => {
    setPermissions((prev) =>
      prev.includes(permValue)
        ? prev.filter((p) => p !== permValue)
        : [...prev, permValue]
    );
  };

  const handleCopyToken = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken);
      setCopied(true);
      toast({
        title: "Token copiado!",
        description: "O token foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setCreatedToken(null);
    setName("");
    setPermissions(["read:announcements", "read:members"]);
    setExpiresIn("never");
    setCopied(false);
    onOpenChange(false);
  };

  // Show token created view
  if (createdToken) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Token Criado
            </DialogTitle>
            <DialogDescription>
              Copie o token agora - ele não será mostrado novamente
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive" className="border-amber-500 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              <strong>Importante:</strong> Este é o único momento em que você verá o token completo.
              Copie-o agora e guarde em um local seguro.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Seu token de API</Label>
            <div className="flex gap-2">
              <Input
                value={createdToken}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={handleCopyToken} variant={copied ? "default" : "outline"}>
                {copied ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Como usar:</p>
            <pre className="text-xs overflow-x-auto">
{`curl -H "Authorization: Bearer ${createdToken.substring(0, 20)}..." \\
  https://jiqbgxtgzpdosbmydfcw.supabase.co/functions/v1/public-api/announcements`}
            </pre>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Gerar Token de API</DialogTitle>
          <DialogDescription>
            Crie um token para autenticar integrações externas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do token *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Integração com ERP"
              required
            />
            <p className="text-xs text-muted-foreground">
              Um nome descritivo para identificar o uso deste token
            </p>
          </div>

          <div className="space-y-2">
            <Label>Permissões *</Label>
            <div className="space-y-2 border rounded-lg p-3">
              {AVAILABLE_PERMISSIONS.map((perm) => (
                <div key={perm.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={perm.value}
                    checked={permissions.includes(perm.value)}
                    onCheckedChange={() => handlePermissionToggle(perm.value)}
                  />
                  <label
                    htmlFor={perm.value}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {perm.label}
                  </label>
                </div>
              ))}
            </div>
            {permissions.length === 0 && (
              <p className="text-xs text-destructive">Selecione ao menos uma permissão</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires">Expiração</Label>
            <select
              id="expires"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="never">Nunca expira</option>
              <option value="30">30 dias</option>
              <option value="90">90 dias</option>
              <option value="180">180 dias</option>
              <option value="365">1 ano</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !name.trim() || permissions.length === 0}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Gerar Token
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
