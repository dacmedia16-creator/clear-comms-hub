
# Analise do Erro 500 no WhatsApp da Edge Function send-referral

## Diagnostico

Analisei os logs e o codigo das edge functions para identificar a causa do erro.

### Evidencias dos Logs

| Teste | Telefone Formatado | Erro |
|-------|-------------------|------|
| 1o teste (18:57) | `5511999998888` (sem +) | `NullPointerException` - formato invalido |
| 2o teste (19:02) | `+5511999887766` (com +) | `500 - Failed to send the message` |

### Causas Identificadas

**1. Numero de Teste Inexistente**
O erro 500 "Failed to send the message" ocorre porque o numero `11999887766` nao existe no WhatsApp. A API ZionTalk valida se o destinatario tem WhatsApp antes de enviar.

**2. Timeout do Email (CPU Time exceeded)**
A conexao SMTP esta demorando muito e causando timeout da edge function (limite de CPU excedido).

### Comparacao com funcoes que funcionam

| Aspecto | send-referral | send-whatsapp/test-whatsapp |
|---------|--------------|------------------------------|
| Endpoint | `app.ziontalk.com/api/send_message/` | Identico |
| Auth | Basic Auth | Identico |
| FormData | `msg` + `mobile_phone` | Identico |
| Formato telefone | `+5511999887766` | Identico |

**Conclusao**: A integracao com ZionTalk esta CORRETA. O erro 500 e esperado para numeros invalidos/inexistentes.

---

## Solucoes Propostas

### 1. Otimizar Edge Function para Evitar Timeout

O principal problema tecnico e o timeout do SMTP. Solucoes:

**Opcao A - Fire-and-forget (Recomendado)**
Usar `EdgeRuntime.waitUntil()` para processar WhatsApp e Email em background, igual a `send-whatsapp`:

```typescript
// Retornar resposta imediata
EdgeRuntime.waitUntil(sendNotificationsInBackground(...));

return new Response(JSON.stringify({ success: true, ... }));
```

**Opcao B - Timeout configuravel**
Adicionar timeout de 10 segundos para conexao SMTP para falhar rapido se o servidor demorar.

### 2. Melhorar Tratamento de Erros

Diferenciar tipos de erro do WhatsApp:
- Numero invalido/inexistente
- Problema de API key
- Rate limiting
- Erro de rede

### 3. Adicionar Validacao de Telefone

Antes de enviar, verificar se o telefone tem formato brasileiro valido (11 digitos apos limpeza).

---

## Plano de Implementacao

### Arquivo: `supabase/functions/send-referral/index.ts`

1. **Adicionar import do EdgeRuntime**
```typescript
declare const EdgeRuntime: {
  waitUntil(promise: Promise<unknown>): void;
};
```

2. **Criar funcao de processamento em background**
```typescript
async function sendNotificationsInBackground(
  referralId: string,
  syndicPhone: string,
  syndicEmail: string,
  whatsappMessage: string,
  emailSubject: string,
  emailHtml: string
) {
  // Enviar WhatsApp
  const whatsappResult = await sendWhatsApp(syndicPhone, whatsappMessage);
  
  // Enviar Email com timeout
  const emailResult = await sendEmail(syndicEmail, emailSubject, emailHtml);
  
  // Atualizar banco
  await updateReferralStatus(referralId, whatsappResult.success, emailResult.success);
}
```

3. **Modificar handler principal**
```typescript
// Salvar no banco
const { data: referral } = await supabase.from("syndic_referrals").insert(...);

// Processar notificacoes em background
EdgeRuntime.waitUntil(
  sendNotificationsInBackground(referral.id, syndicPhone, syndicEmail, ...)
);

// Retornar resposta imediata
return new Response(JSON.stringify({
  success: true,
  referralId: referral.id,
  message: "Indicacao recebida! As notificacoes serao enviadas em instantes."
}));
```

4. **Adicionar timeout para SMTP**
```typescript
const client = new SMTPClient({
  connection: {
    hostname: smtpHost,
    port: 465,
    tls: true,
    auth: { username: smtpUser, password: smtpPassword },
  },
  timeout: 15000, // 15 segundos de timeout
});
```

5. **Melhorar logs de erro**
```typescript
if (!success) {
  const errorText = await response.text();
  // Identificar tipo de erro
  if (response.status === 500 && errorText.includes("Failed to send")) {
    console.error(`WhatsApp: Numero ${formattedPhone} provavelmente nao tem WhatsApp`);
  }
  // ...
}
```

---

## Resultado Esperado

Apos as correcoes:

| Antes | Depois |
|-------|--------|
| Timeout por CPU excedida | Resposta imediata ao usuario |
| Erro 500 bloqueia fluxo | Erro tratado graciosamente |
| Nenhum feedback | Usuario ve mensagem de sucesso |
| Notificacoes bloqueadas | Notificacoes enviadas em background |

## Nota sobre Testes

Para validar que o WhatsApp funciona corretamente, use um numero REAL que tenha WhatsApp cadastrado. Numeros de teste ficticios sempre retornarao erro 500 da API ZionTalk.

---

## Secao Tecnica

### Estrutura da Edge Function Otimizada

```text
+------------------+     +---------------------+
|  Request HTTP    |---->|  Validar dados      |
+------------------+     +---------------------+
                                |
                                v
                         +---------------------+
                         |  Salvar no banco    |
                         +---------------------+
                                |
        +<----------------------+----------------------->+
        |                                                |
        v                                                v
+------------------+                            +------------------+
| EdgeRuntime      |                            | Response HTTP    |
| .waitUntil()     |                            | { success: true }|
+------------------+                            +------------------+
        |
        v
+---------------------------------------+
| Background:                           |
|  1. sendWhatsApp()                    |
|  2. sendEmail() com timeout           |
|  3. updateReferralStatus()            |
+---------------------------------------+
```

### Tratamento de Erros por Tipo

| Status Code | Significado | Acao |
|-------------|-------------|------|
| 201 | Sucesso | Marcar como enviado |
| 400 | Dados invalidos | Log + continuar |
| 401 | API key invalida | Log + alerta |
| 500 | Numero sem WhatsApp | Log + continuar com email |

