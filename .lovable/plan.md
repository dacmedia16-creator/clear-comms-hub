

# Integração da API Zoho Mail para Notificações de Avisos

## Objetivo
Configurar a API Zoho Mail para enviar emails aos moradores quando um novo aviso for publicado, similar às notificações existentes de WhatsApp e SMS.

## Pré-requisitos - Configuração no Zoho Developer Console

Antes de implementar, você precisa criar a aplicação OAuth no Zoho. Siga estes passos:

### 1. Registrar Aplicação OAuth

1. Acesse: https://accounts.zoho.com/developerconsole
2. Clique em **GET STARTED**
3. Selecione **Self Client** (aplicação standalone para backend)
4. Preencha:
   - **Client Name**: `ClearComms Email Sender`
   - **Homepage URL**: `https://clear-comms-hub.lovable.app`
5. Clique em **CREATE**
6. Anote o **Client ID** e **Client Secret** gerados

### 2. Gerar Refresh Token

1. Na mesma tela do Developer Console, clique em **Generate Code**
2. Em **Scope**, digite: `ZohoMail.messages.CREATE,ZohoMail.accounts.READ`
3. Em **Time Duration**, selecione: **10 minutes**
4. Em **Scope Description**, digite: `Envio de emails de notificação`
5. Clique em **CREATE**
6. Copie o **code** gerado
7. Faça uma requisição POST (pode usar Postman ou navegador):

```text
https://accounts.zoho.com/oauth/v2/token?code={SEU_CODE}&grant_type=authorization_code&client_id={SEU_CLIENT_ID}&client_secret={SEU_CLIENT_SECRET}
```

8. Anote o **refresh_token** da resposta (não expira)

### 3. Obter Account ID

1. Com o access_token obtido, faça GET para:

```text
https://mail.zoho.com/api/accounts
Authorization: Zoho-oauthtoken {access_token}
```

2. Anote o **accountId** retornado

---

## Alterações no Sistema

| Arquivo/Recurso | Acao | Descricao |
|-----------------|------|-----------|
| Migration SQL | Criar | Tabela `email_logs` para registrar envios |
| Secrets | Adicionar | 4 segredos Zoho OAuth |
| `supabase/functions/send-email/index.ts` | Criar | Edge Function para envio de emails |
| `supabase/config.toml` | Modificar | Registrar nova funcao |
| `src/hooks/useSendEmail.ts` | Criar | Hook para disparar envio |
| UI de Avisos | Modificar | Adicionar botao "Enviar por Email" |

---

## Detalhes Tecnicos

### 1. Tabela email_logs

```sql
CREATE TABLE public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID REFERENCES public.announcements(id),
  condominium_id UUID REFERENCES public.condominiums(id),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
```

### 2. Segredos Necessarios

| Segredo | Descricao |
|---------|-----------|
| `ZOHO_CLIENT_ID` | Client ID da aplicacao OAuth |
| `ZOHO_CLIENT_SECRET` | Client Secret da aplicacao |
| `ZOHO_REFRESH_TOKEN` | Refresh token (nao expira) |
| `ZOHO_ACCOUNT_ID` | ID da conta de email |
| `ZOHO_FROM_EMAIL` | Email remetente (ex: avisos@seudominio.com) |

### 3. Edge Function send-email

A funcao implementara:

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Receber dados do aviso e condominio                      │
├─────────────────────────────────────────────────────────────┤
│ 2. Renovar access_token usando refresh_token                │
│    POST accounts.zoho.com/oauth/v2/token                    │
├─────────────────────────────────────────────────────────────┤
│ 3. Buscar membros aprovados com email cadastrado            │
├─────────────────────────────────────────────────────────────┤
│ 4. Para cada membro (com delay 15-30s):                     │
│    - Montar email HTML com template                         │
│    - POST mail.zoho.com/api/accounts/{id}/messages          │
│    - Registrar em email_logs                                │
├─────────────────────────────────────────────────────────────┤
│ 5. Retornar resposta imediata (background processing)       │
└─────────────────────────────────────────────────────────────┘
```

### 4. Template de Email

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { max-width: 600px; margin: 0 auto; font-family: Arial; }
    .header { background: #1a365d; color: white; padding: 20px; }
    .content { padding: 20px; }
    .category { display: inline-block; padding: 4px 12px; border-radius: 4px; }
    .button { background: #3182ce; color: white; padding: 12px 24px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{nome_condo}</h1>
    </div>
    <div class="content">
      <span class="category">{categoria}</span>
      <h2>{titulo}</h2>
      <p>{resumo}</p>
      <a href="{link}" class="button">Ver Aviso Completo</a>
    </div>
  </div>
</body>
</html>
```

### 5. API Zoho Mail - Enviar Email

```typescript
// Renovar token
const tokenResponse = await fetch(
  `https://accounts.zoho.com/oauth/v2/token?refresh_token=${REFRESH_TOKEN}&grant_type=refresh_token&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
  { method: 'POST' }
);
const { access_token } = await tokenResponse.json();

// Enviar email
const response = await fetch(
  `https://mail.zoho.com/api/accounts/${ACCOUNT_ID}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Zoho-oauthtoken ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fromAddress: FROM_EMAIL,
      toAddress: recipientEmail,
      subject: `[${condoName}] ${announcement.title}`,
      content: htmlContent,
      mailFormat: 'html',
    }),
  }
);
```

---

## Fluxo de Uso

1. Sindico cria novo aviso
2. Marca opcao "Enviar por Email" (se habilitado no condominio)
3. Sistema envia emails em background com intervalo de 15-30s
4. Logs ficam disponiveis para consulta

---

## Proximos Passos Apos Aprovacao

1. Voce configura a aplicacao no Zoho Developer Console
2. Voce me fornece os 5 segredos necessarios
3. Eu implemento a edge function e integracoes

