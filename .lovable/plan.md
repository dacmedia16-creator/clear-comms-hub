

# Tornar Email Opcional no Formulário de Indicação

## Objetivo

Alterar o formulário de indicação para que o email do síndico seja opcional, permitindo indicações apenas com telefone.

---

## Situação Atual

| Campo | Status Atual | Status Desejado |
|-------|--------------|-----------------|
| Nome do Síndico | Obrigatório | Obrigatório |
| Telefone | Obrigatório | Obrigatório |
| Email | Obrigatório | **Opcional** |
| Nome do Condomínio | Obrigatório | Obrigatório |
| Seu Nome | Opcional | Opcional |

---

## Mudanças Necessárias

### 1. Formulário Frontend (`src/pages/ReferSyndicPage.tsx`)

**Schema de validação:**

```typescript
// De:
syndicEmail: z.string().trim().email("Email inválido").max(255, "Email muito longo"),

// Para:
syndicEmail: z.string().trim().email("Email inválido").max(255, "Email muito longo").optional().or(z.literal("")),
```

**Label do campo:**
- De: "Email do Síndico *"
- Para: "Email do Síndico (opcional)"

**Mensagem de sucesso:**
- De: "O síndico receberá sua indicação via WhatsApp e Email."
- Para: "O síndico receberá sua indicação via WhatsApp." (ou mencionar email se fornecido)

---

### 2. Edge Function (`supabase/functions/send-referral/index.ts`)

**Validação:**
- Remover email da validação de campos obrigatórios (linha 411)
- Tornar validação de formato de email condicional (apenas se preenchido)

**Envio de email:**
- Só chamar `sendEmail()` se o email foi fornecido
- Ajustar log e status de acordo

---

## Layout do Campo Atualizado

```text
+------------------------------------------+
|  Email do Síndico (opcional)             |
|  [sindico@email.com_________________]    |
|  Deixe em branco se não souber           |
+------------------------------------------+
```

---

## Seção Técnica

### Mudanças no Schema Zod (ReferSyndicPage.tsx)

```typescript
const referralSchema = z.object({
  syndicName: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  syndicPhone: z.string().trim().min(10, "Telefone inválido").max(20, "Telefone muito longo"),
  // Email agora é opcional - aceita string vazia ou email válido
  syndicEmail: z.string().trim().max(255, "Email muito longo")
    .refine((val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Email inválido"
    })
    .optional(),
  condominiumName: z.string().trim().min(2, "Nome do condomínio obrigatório").max(200, "Nome muito longo"),
  referrerName: z.string().trim().max(100, "Nome muito longo").optional(),
});
```

### Mudanças na Edge Function (send-referral/index.ts)

```typescript
// Validação - email não é mais obrigatório
if (!syndicName || !syndicPhone || !condominiumName) {
  return new Response(
    JSON.stringify({ error: "Campos obrigatórios não preenchidos" }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Validar formato do email apenas se fornecido
if (syndicEmail && syndicEmail.trim()) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(syndicEmail)) {
    return new Response(
      JSON.stringify({ error: "Email inválido" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// No sendNotificationsInBackground - só enviar email se fornecido
let emailResult = { success: false, error: "Email não fornecido" };
if (syndicEmail && syndicEmail.trim()) {
  emailResult = await sendEmail(syndicEmail, emailSubject, emailHtml);
}
```

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/ReferSyndicPage.tsx` | Schema Zod, label do campo, mensagens |
| `supabase/functions/send-referral/index.ts` | Validação e lógica condicional de envio |

