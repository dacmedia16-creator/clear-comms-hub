

# Adicionar Opções de Envio WhatsApp e Email no Formulário de Avisos

## Visão Geral

Adicionar checkboxes para selecionar se deseja enviar notificações via WhatsApp e/ou Email ao criar um aviso. As opções serão habilitadas/desabilitadas baseadas nas configurações do condomínio.

---

## Alterações

### 1. Atualizar Interface Condominium

Adicionar campos de configuração de notificação:

```typescript
interface Condominium {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  notification_whatsapp: boolean;  // Novo
  notification_email: boolean;      // Novo
}
```

### 2. Adicionar Estados de Notificação

```typescript
// Opções de notificação
const [sendWhatsApp, setSendWhatsApp] = useState(false);
const [sendEmail, setSendEmail] = useState(false);
const [sendingNotifications, setSendingNotifications] = useState(false);
```

### 3. Adicionar Seção no Formulário

Após os switches de "Fixar no topo" e "Marcar como urgente", adicionar:

```text
────────────────────────────────────────
Notificar moradores
────────────────────────────────────────

[✓] Enviar via WhatsApp
    Notificar moradores com telefone cadastrado

[ ] Enviar via Email
    Habilite nas configurações do condomínio
```

### 4. Lógica de Envio

Após criar o aviso com sucesso, verificar se as opções foram marcadas e enviar:

```typescript
// Após criação do aviso
if (sendWhatsApp && condominium.notification_whatsapp) {
  await sendToMembersWhatsApp(data, condominium, baseUrl);
}

if (sendEmail && condominium.notification_email) {
  // Preparado para quando API estiver configurada
  await sendToMembersEmail(data, condominium, baseUrl);
}
```

### 5. Atualizar Dialog de Sucesso

Mostrar resumo das notificações enviadas no dialog de confirmação.

---

## Arquivos a Modificar

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/AdminCondominiumPage.tsx` | Adicionar UI de notificação e lógica de envio |
| `src/hooks/useSendEmail.ts` (Novo) | Hook para envio de emails (preparado para API) |

---

## Detalhes Técnicos

### Interface Atualizada

A query já busca `*` do condomínio, então os campos `notification_whatsapp` e `notification_email` já estão disponíveis - só precisa atualizar a interface TypeScript.

### Seção de Notificação (JSX)

```tsx
{/* Seção de Notificações */}
<div className="border-t pt-4 mt-4">
  <Label className="text-sm font-medium mb-3 block">
    Notificar moradores
  </Label>
  
  <div className="space-y-3">
    {/* WhatsApp */}
    <div className="flex items-start gap-3">
      <Checkbox 
        id="send-whatsapp" 
        checked={sendWhatsApp}
        onCheckedChange={(checked) => setSendWhatsApp(!!checked)}
        disabled={!condominium?.notification_whatsapp}
      />
      <div className="flex-1">
        <Label htmlFor="send-whatsapp" className="cursor-pointer flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-green-600" />
          Enviar via WhatsApp
        </Label>
        <p className="text-xs text-muted-foreground">
          {condominium?.notification_whatsapp 
            ? "Notificar moradores com telefone cadastrado"
            : "Habilite nas configurações do condomínio"}
        </p>
      </div>
    </div>
    
    {/* Email */}
    <div className="flex items-start gap-3">
      <Checkbox 
        id="send-email" 
        checked={sendEmail}
        onCheckedChange={(checked) => setSendEmail(!!checked)}
        disabled={!condominium?.notification_email}
      />
      <div className="flex-1">
        <Label htmlFor="send-email" className="cursor-pointer flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-600" />
          Enviar via Email
        </Label>
        <p className="text-xs text-muted-foreground">
          {condominium?.notification_email 
            ? "Notificar moradores com email cadastrado"
            : "Habilite nas configurações do condomínio"}
        </p>
      </div>
    </div>
  </div>
</div>
```

### Importações Adicionais

```typescript
import { Checkbox } from "@/components/ui/checkbox";
import { Mail } from "lucide-react";
import { useSendWhatsApp } from "@/hooks/useSendWhatsApp";
```

### Fluxo de Criação Atualizado

1. Usuário preenche formulário e marca opções de notificação
2. Clica "Publicar aviso"
3. Sistema cria o aviso no banco
4. Se WhatsApp marcado e habilitado: chama `send-whatsapp` edge function
5. Se Email marcado e habilitado: mostra toast informando que API não configurada (por enquanto)
6. Exibe dialog de sucesso com resumo

### Reset do Formulário

Incluir reset das opções de notificação:

```typescript
// Reset form
setSendWhatsApp(false);
setSendEmail(false);
```

---

## Sobre o Email

A funcionalidade de email ficará preparada na UI, mas mostrará mensagem informando que a API precisa ser configurada. Quando você fornecer a chave RESEND_API_KEY, implementaremos a edge function `send-email`.

