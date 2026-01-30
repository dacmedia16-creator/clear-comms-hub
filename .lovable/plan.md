
# Integrar Envio de Email via Zoho Mail

## Resumo
Implementar a funcionalidade de envio de emails aos moradores quando um novo aviso for publicado, utilizando a API Zoho Mail com autenticação OAuth 2.0.

## O que sera criado

### 1. Configurar Segredos
Adicionar os 5 segredos coletados ao projeto:
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`
- `ZOHO_ACCOUNT_ID`
- `ZOHO_FROM_EMAIL`

### 2. Edge Function `send-email`
Nova funcao em `supabase/functions/send-email/index.ts` que:
- Renova o access_token usando o refresh_token
- Busca membros aprovados com email cadastrado
- Envia emails em segundo plano com intervalo de 15-30s
- Registra cada envio na tabela `email_logs`

### 3. Hook `useSendEmail`
Novo arquivo `src/hooks/useSendEmail.ts` seguindo o mesmo padrao do `useSendWhatsApp.ts` para invocar a edge function.

### 4. Atualizar AdminCondominiumPage
Integrar o hook de email no envio de avisos (linhas 222-228 ja tem o placeholder para email).

---

## Secao Tecnica

### Arquivos Modificados

| Arquivo | Acao |
|---------|------|
| `supabase/functions/send-email/index.ts` | Criar |
| `supabase/config.toml` | Adicionar funcao |
| `src/hooks/useSendEmail.ts` | Criar |
| `src/pages/AdminCondominiumPage.tsx` | Modificar |

### Edge Function - Fluxo

```text
1. Receber: announcement, condominium, baseUrl
2. Renovar access_token via POST accounts.zoho.com/oauth/v2/token
3. Buscar membros aprovados com email (user_roles + profiles)
4. Para cada membro (com delay 15-30s):
   - Montar HTML do email
   - POST mail.zoho.com/api/accounts/{id}/messages
   - Registrar em email_logs
5. Retornar resposta imediata (background processing)
```

### Template HTML Email

Email responsivo com:
- Cabecalho com nome do condominio
- Badge de categoria
- Titulo e resumo do aviso
- Botao para ver aviso completo
- Rodape

### Renovacao de Token Zoho

```typescript
const tokenResponse = await fetch(
  `https://accounts.zoho.com/oauth/v2/token?` +
  `refresh_token=${ZOHO_REFRESH_TOKEN}&` +
  `grant_type=refresh_token&` +
  `client_id=${ZOHO_CLIENT_ID}&` +
  `client_secret=${ZOHO_CLIENT_SECRET}`,
  { method: 'POST' }
);
const { access_token } = await tokenResponse.json();
```

### Envio via Zoho Mail API

```typescript
await fetch(
  `https://mail.zoho.com/api/accounts/${ZOHO_ACCOUNT_ID}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Zoho-oauthtoken ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fromAddress: ZOHO_FROM_EMAIL,
      toAddress: recipientEmail,
      subject: `[${condoName}] ${title}`,
      content: htmlContent,
      mailFormat: 'html',
    }),
  }
);
```

### Integracao no AdminCondominiumPage

Substituir o bloco atual (linhas 222-228):
```typescript
if (sendEmail && condominium.notification_email) {
  try {
    const result = await sendEmailToMembers(
      { ...data, id: data.id },
      { ...condominium, id: condominium.id },
      baseUrl
    );
    if (result.total > 0) {
      toast({
        title: "Emails em envio",
        description: `Enviando para ${result.total} moradores em segundo plano.`,
      });
    }
  } catch (emailError) {
    console.error("Error sending email:", emailError);
  }
}
```

---

## Resultado Esperado
Ao marcar "Enviar via Email" ao publicar um aviso:
1. Sistema busca moradores com email cadastrado
2. Emails sao enviados em segundo plano (15-30s entre cada)
3. Logs sao registrados em `email_logs` para auditoria
4. Usuario recebe feedback imediato sobre o inicio do processo
