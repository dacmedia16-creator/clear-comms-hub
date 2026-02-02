

# Plano: Migrar Email de SMTP para ZeptoMail API REST

## Resumo da Mudança

Vamos substituir a implementação SMTP manual (que usa conexão TLS com múltiplos comandos) por uma simples chamada HTTP à API REST do ZeptoMail.

## Comparação Visual

```text
┌────────────────────────────────────────────────────────────────┐
│                     IMPLEMENTAÇÃO ATUAL                        │
├────────────────────────────────────────────────────────────────┤
│  Edge Function                                                 │
│      ↓                                                         │
│  Deno.connectTls (porta 465)                                   │
│      ↓                                                         │
│  EHLO → AUTH LOGIN → base64(user) → base64(pass)             │
│      ↓                                                         │
│  MAIL FROM → RCPT TO → DATA → conteúdo → QUIT                 │
│                                                                │
│  Linhas de código: ~130                                        │
│  Problemas: timeout, conexões longas, complexidade             │
└────────────────────────────────────────────────────────────────┘

                              ↓

┌────────────────────────────────────────────────────────────────┐
│                     IMPLEMENTAÇÃO NOVA                         │
├────────────────────────────────────────────────────────────────┤
│  Edge Function                                                 │
│      ↓                                                         │
│  fetch("https://api.zeptomail.com/v1.1/email", {               │
│    method: "POST",                                             │
│    headers: { Authorization: ZEPTOMAIL_API_KEY },              │
│    body: { from, to, subject, htmlbody }                       │
│  })                                                            │
│                                                                │
│  Linhas de código: ~25                                         │
│  Benefícios: simples, rápido, confiável                        │
└────────────────────────────────────────────────────────────────┘
```

## Passo a Passo

### 1. Adicionar Novo Secret

**Secret**: `ZEPTOMAIL_API_KEY`

**Valor**: O token completo que aparece na sua tela como "Token de envio de correio 1"
- Começa com: `Zoho-enczapikey wSsVR60j/hXwBvsrmmGrJek/z1tVA12if00r0Fih...`
- Copie o valor completo clicando no ícone de copiar ao lado do campo

### 2. Atualizar Edge Function `send-email`

**Arquivo**: `supabase/functions/send-email/index.ts`

Mudanças:
- Remover função `sendSmtpEmail()` (~130 linhas)
- Criar função `sendZeptoEmail()` (~25 linhas)
- Trocar referência de `ZOHO_SMTP_*` para `ZEPTOMAIL_API_KEY`
- Email de envio fixo: `noreply@avisopro.com.br`

Nova função de envio:
```typescript
async function sendZeptoEmail(
  to: string,
  toName: string,
  subject: string,
  htmlBody: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get('ZEPTOMAIL_API_KEY');
  
  const response = await fetch('https://api.zeptomail.com/v1.1/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': apiKey!,
    },
    body: JSON.stringify({
      from: { address: 'noreply@avisopro.com.br', name: 'AvisoPro' },
      to: [{ email_address: { address: to, name: toName || to } }],
      subject: subject,
      htmlbody: htmlBody,
    }),
  });

  if (response.ok) {
    return { success: true };
  } else {
    const errorData = await response.text();
    return { success: false, error: errorData };
  }
}
```

### 3. Atualizar Edge Function `test-email`

**Arquivo**: `supabase/functions/test-email/index.ts`

Mesmas mudanças:
- Remover função `sendSmtpEmail()`
- Criar função `sendZeptoEmail()`
- Atualizar validação de credenciais para `ZEPTOMAIL_API_KEY`

### 4. Testar o Envio

Após as mudanças:
1. Enviar email de teste via painel Super Admin
2. Verificar logs da Edge Function
3. Confirmar recebimento do email

### 5. Limpeza (Opcional - Depois de Confirmar)

Secrets que podem ser removidos após confirmar funcionamento:
- `ZOHO_SMTP_USER`
- `ZOHO_SMTP_PASSWORD`
- `ZOHO_SMTP_HOST`
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`
- `ZOHO_ACCOUNT_ID`

## Arquivos que Serão Modificados

| Arquivo | Ação |
|---------|------|
| `supabase/functions/send-email/index.ts` | Substituir SMTP por API REST |
| `supabase/functions/test-email/index.ts` | Substituir SMTP por API REST |

## Benefícios da Migração

| Aspecto | SMTP Atual | API REST Nova |
|---------|------------|---------------|
| Código | ~130 linhas | ~25 linhas |
| Conexões | TLS + 8 comandos | 1 requisição HTTP |
| Timeout | Alto risco | Baixo risco |
| Autenticação | Senha | API Key |
| Erro handling | Complexo | Simples |
| Manutenção | Difícil | Fácil |

## Próximo Passo

Preciso que você forneça o **token completo** da API do ZeptoMail. Na sua tela, clique no ícone de copiar ao lado do campo "Token de envio de correio 1" e cole aqui para eu adicionar como secret.

