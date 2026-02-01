
# Corrigir Edge Function send-referral para ZionTalk

## Problema Identificado

A funcao `send-referral` esta usando uma API incorreta para envio de WhatsApp:

| Aspecto | Atual (ERRADO) | Correto (ZionTalk) |
|---------|----------------|---------------------|
| Endpoint | `api.z-api.io/instances/send-text` | `app.ziontalk.com/api/send_message/` |
| Autenticacao | Header `Client-Token` | Basic Auth (API Key como username) |
| Formato do Body | JSON | FormData |
| Campo do telefone | `phone` | `mobile_phone` |
| Campo da mensagem | `message` | `msg` |
| Status de sucesso | `response.ok` | `response.status === 201` |

---

## Alteracoes Necessarias

### Arquivo: `supabase/functions/send-referral/index.ts`

### 1. Adicionar import do encode para Base64

```typescript
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
```

### 2. Corrigir funcao formatPhoneForWhatsApp

Adicionar o prefixo `+` no telefone formatado:

```typescript
function formatPhoneForWhatsApp(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("55")) {
    return `+${cleanPhone}`;
  }
  return `+55${cleanPhone}`;
}
```

### 3. Reescrever funcao sendWhatsApp

Usar a API ZionTalk correta com Basic Auth e FormData:

```typescript
async function sendWhatsApp(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let apiKey = Deno.env.get("ZIONTALK_API_KEY");

    // Buscar remetente ativo do banco
    const { data: senders } = await supabaseAdmin
      .from("whatsapp_senders")
      .select("api_key")
      .eq("is_active", true)
      .order("is_default", { ascending: false })
      .limit(1);

    if (senders && senders.length > 0) {
      apiKey = senders[0].api_key;
    }

    if (!apiKey) {
      console.log("No WhatsApp API key configured");
      return { success: false, error: "WhatsApp nao configurado" };
    }

    const formattedPhone = formatPhoneForWhatsApp(phone);
    console.log(`Sending WhatsApp to ${formattedPhone}`);

    // Basic Auth: API Key como username, senha vazia
    const authHeader = 'Basic ' + encode(`${apiKey}:`);

    // FormData para ZionTalk
    const formData = new FormData();
    formData.append('msg', message);
    formData.append('mobile_phone', formattedPhone);

    const response = await fetch(
      'https://app.ziontalk.com/api/send_message/',
      {
        method: 'POST',
        headers: { 'Authorization': authHeader },
        body: formData,
      }
    );

    const success = response.status === 201;
    
    if (!success) {
      const errorText = await response.text();
      console.error(`WhatsApp API error: ${response.status} - ${errorText}`);
      return { success: false, error: errorText };
    }

    console.log("WhatsApp sent successfully");
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("WhatsApp send error:", error);
    return { success: false, error: errorMessage };
  }
}
```

---

## Resumo das Correcoes

| Item | Mudanca |
|------|---------|
| Import | Adicionar `encode` de `https://deno.land/std@0.168.0/encoding/base64.ts` |
| Endpoint | `api.z-api.io` -> `app.ziontalk.com/api/send_message/` |
| Auth | `Client-Token` header -> Basic Auth com `encode(apiKey + ':')` |
| Body | JSON -> FormData |
| Campos | `phone`/`message` -> `mobile_phone`/`msg` |
| Sucesso | `response.ok` -> `response.status === 201` |
| Busca sender | Adicionar ordenacao por `is_default` |

---

## Resultado Esperado

Apos a correcao:
- WhatsApp sera enviado corretamente via ZionTalk
- Usando a mesma logica que ja funciona em `send-whatsapp`
- Reutilizando os remetentes cadastrados no banco de dados
