

# Otimizacao da Edge Function resend-referral

## Problema Atual

A edge function `resend-referral` esta processando o envio de WhatsApp e Email de forma **sincrona**, aguardando a conclusao de ambos antes de retornar resposta ao usuario. Isso causa:

- **Timeout de CPU** quando o servidor SMTP demora para responder
- **Experiencia ruim para o usuario** que fica aguardando a resposta
- **Falha silenciosa** quando o email nao consegue ser enviado a tempo

## Solucao Proposta

Aplicar o mesmo padrao usado na `send-referral`: processar as notificacoes em **background** usando `EdgeRuntime.waitUntil()`, retornando resposta imediata ao usuario.

---

## Fluxo Atual vs Proposto

| Aspecto | Atual (Sincrono) | Proposto (Assincrono) |
|---------|------------------|----------------------|
| Tempo de resposta | 5-30 segundos | Imediato (<500ms) |
| Risco de timeout | Alto | Baixo |
| Experiencia usuario | Espera longa | Feedback instantaneo |
| Atualizacao no banco | Antes da resposta | Apos a resposta (background) |

---

## Estrutura do Novo Fluxo

```text
+------------------+     +---------------------+
|  Request HTTP    |---->|  Validar dados      |
+------------------+     +---------------------+
                                |
                                v
                         +---------------------+
                         | Buscar indicacao    |
                         | no banco            |
                         +---------------------+
                                |
        +<----------------------+----------------------->+
        |                                                |
        v                                                v
+------------------+                            +------------------+
| EdgeRuntime      |                            | Response HTTP    |
| .waitUntil()     |                            | { success: true, |
|                  |                            |   processing... }|
+------------------+                            +------------------+
        |
        v
+---------------------------------------+
| Background:                           |
|  1. sendWhatsApp() se solicitado      |
|  2. sendEmail() se solicitado         |
|  3. Atualizar whatsapp_sent/email_sent|
+---------------------------------------+
```

---

## Arquivos a Modificar

### 1. `supabase/functions/resend-referral/index.ts`

**Adicionar:**
1. Declaracao do `EdgeRuntime` (igual a `send-referral`)
2. Funcao `resendNotificationsInBackground()` para processar em background
3. Modificar o handler para usar `EdgeRuntime.waitUntil()`

---

## Secao Tecnica

### Mudancas no Codigo

**1. Adicionar declaracao do EdgeRuntime (apos imports):**
```typescript
declare const EdgeRuntime: {
  waitUntil(promise: Promise<unknown>): void;
};
```

**2. Criar funcao de processamento em background:**
```typescript
async function resendNotificationsInBackground(
  referralId: string,
  referral: SyndicReferral,
  channel: "whatsapp" | "email" | "both"
): Promise<void> {
  console.log(`[Resend Background] Starting for ${referralId}, channel: ${channel}`);

  let whatsappSent = referral.whatsapp_sent;
  let emailSent = referral.email_sent;

  // Reenviar WhatsApp se solicitado
  if (channel === "whatsapp" || channel === "both") {
    const whatsappMessage = getWhatsAppMessage(
      referral.syndic_name,
      referral.referrer_name || "",
      referral.condominium_name
    );
    const result = await sendWhatsApp(referral.syndic_phone, whatsappMessage);
    whatsappSent = result.success;
    console.log(`[Resend Background] WhatsApp: ${result.success ? 'success' : 'failed'}`);
  }

  // Reenviar Email se solicitado
  if (channel === "email" || channel === "both") {
    const emailSubject = `${referral.referrer_name || "Um morador"} do ${referral.condominium_name} indicou o AVISO PRO para você!`;
    const emailHtml = getEmailHtml(
      referral.syndic_name,
      referral.referrer_name || "",
      referral.condominium_name
    );
    const result = await sendEmail(referral.syndic_email, emailSubject, emailHtml);
    emailSent = result.success;
    console.log(`[Resend Background] Email: ${result.success ? 'success' : 'failed'}`);
  }

  // Atualizar status no banco
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  await supabaseAdmin
    .from("syndic_referrals")
    .update({ whatsapp_sent: whatsappSent, email_sent: emailSent })
    .eq("id", referralId);

  console.log(`[Resend Background] Completed for ${referralId}`);
}
```

**3. Modificar handler principal:**
```typescript
// Apos buscar a indicacao do banco com sucesso...

// Processar em background
EdgeRuntime.waitUntil(
  resendNotificationsInBackground(referralId, referral, channel)
);

// Retornar resposta imediata
return new Response(
  JSON.stringify({
    success: true,
    processing: true,
    message: "Reenvio iniciado. As notificacoes serao processadas em instantes.",
  }),
  { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
);
```

---

## Interface Adicional

Adicionar interface para tipar a indicacao:

```typescript
interface SyndicReferral {
  id: string;
  syndic_name: string;
  syndic_phone: string;
  syndic_email: string;
  condominium_name: string;
  referrer_name: string | null;
  whatsapp_sent: boolean | null;
  email_sent: boolean | null;
}
```

---

## Atualizacao no Frontend

Apos a mudanca, a resposta da funcao nao retornara mais `whatsappSent` e `emailSent` imediatamente (esses valores serao atualizados em background). 

O hook `useSyndicReferrals` devera:
1. Mostrar toast de "Reenvio iniciado"
2. Fazer refresh da lista apos alguns segundos para atualizar os status

**Modificacao em `src/hooks/useSyndicReferrals.ts`:**
```typescript
const resendNotification = async (id: string, channel: "whatsapp" | "email" | "both") => {
  // ... chamada da funcao
  
  if (!error && data?.success) {
    toast.success("Reenvio iniciado! Aguarde alguns segundos...");
    // Refresh apos 5 segundos para atualizar status
    setTimeout(() => refetch(), 5000);
  }
};
```

---

## Resultado Esperado

Apos implementacao:

| Metrica | Antes | Depois |
|---------|-------|--------|
| Tempo de resposta | 5-30s | <500ms |
| Timeout de CPU | Frequente | Eliminado |
| Status no banco | Atualizado antes da resposta | Atualizado em background |
| Feedback usuario | Aguardando... | "Reenvio iniciado!" |

O painel de indicacoes mostrara o status atualizado apos o refresh automatico.

