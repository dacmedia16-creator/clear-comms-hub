
# Botao "Indique para seu Sindico" com Envio Automatico

## Objetivo
Criar um fluxo completo onde visitantes indicam o servico para o sindico do condominio. Apos preencher o formulario, o sistema envia automaticamente uma mensagem via WhatsApp e Email para o sindico indicado, informando que o morador X indicou o servico.

---

## Arquitetura da Solucao

### Fluxo do Usuario
1. Visitante clica no link "Indique para seu sindico" na landing page
2. E redirecionado para `/indicar-sindico`
3. Preenche formulario com dados do sindico e condominio
4. Ao enviar:
   - Dados salvos na tabela `syndic_referrals`
   - Edge function envia WhatsApp para o sindico
   - Edge function envia Email para o sindico
5. Exibe mensagem de sucesso

---

## Alteracoes Propostas

### 1. Criar Tabela `syndic_referrals`

Tabela para armazenar as indicacoes recebidas:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico |
| syndic_name | TEXT | Nome do sindico indicado |
| syndic_phone | TEXT | Telefone do sindico |
| syndic_email | TEXT | Email do sindico |
| condominium_name | TEXT | Nome do condominio |
| referrer_name | TEXT | Nome de quem indicou |
| created_at | TIMESTAMP | Data da indicacao |
| status | TEXT | pending, contacted, converted |
| whatsapp_sent | BOOLEAN | Se WhatsApp foi enviado |
| email_sent | BOOLEAN | Se Email foi enviado |
| notes | TEXT | Observacoes internas |

Politicas RLS:
- Permitir INSERT publico (formulario sem autenticacao)
- Permitir SELECT apenas para Super Admins

### 2. Criar Edge Function `send-referral`

Nova edge function que:
- Recebe dados da indicacao
- Salva no banco de dados
- Envia WhatsApp com link para o site
- Envia Email HTML com apresentacao do servico
- Retorna status de sucesso/falha

### 3. Criar Pagina `ReferSyndicPage.tsx`

Nova pagina com formulario de indicacao:

```text
+------------------------------------------+
|  [<- Voltar ao site]           AVISO PRO |
+------------------------------------------+
|                                          |
|   +----------------------------------+   |
|   |     (UserPlus icon)              |   |
|   |                                  |   |
|   |   Indique para seu Sindico       |   |
|   |   Preencha os dados abaixo       |   |
|   |                                  |   |
|   |   Nome do Sindico *              |   |
|   |   [___________________________]  |   |
|   |                                  |   |
|   |   Telefone do Sindico *          |   |
|   |   [___________________________]  |   |
|   |                                  |   |
|   |   Email do Sindico *             |   |
|   |   [___________________________]  |   |
|   |                                  |   |
|   |   Nome do Condominio *           |   |
|   |   [___________________________]  |   |
|   |                                  |   |
|   |   Seu Nome (opcional)            |   |
|   |   [___________________________]  |   |
|   |                                  |   |
|   |   [    Enviar Indicacao    ]     |   |
|   +----------------------------------+   |
|                                          |
+------------------------------------------+
```

### 4. Adicionar Link na Landing Page

**Hero.tsx** - Adicionar link abaixo dos bullets de beneficios:

```tsx
<Link to="/indicar-sindico" className="inline-flex items-center gap-2 text-primary hover:underline">
  <UserPlus className="w-4 h-4" />
  Indique para seu sindico
</Link>
```

**Footer.tsx** - Adicionar na secao Produto:

```tsx
<li>
  <Link to="/indicar-sindico">Indique para seu sindico</Link>
</li>
```

### 5. Adicionar Rota no App.tsx

```typescript
<Route path="/indicar-sindico" element={<ReferSyndicPage />} />
```

---

## Template das Mensagens

### WhatsApp para o Sindico

```text
Ola {nome_sindico}!

O morador {nome_morador} do {nome_condominio} indicou o AVISO PRO para voce!

O AVISO PRO e a plataforma oficial de comunicacao para condominios:
- Avisos centralizados
- Notificacoes via WhatsApp, Email e SMS
- 3 meses gratis para testar

Conheca agora: {link_site}

Atenciosamente,
Equipe AVISO PRO
```

### Email para o Sindico

Template HTML profissional com:
- Logo do AVISO PRO
- Mensagem personalizada mencionando o morador
- Lista de beneficios do servico
- Botao CTA "Conhecer o AVISO PRO"
- Informacao dos 3 meses gratis

---

## Resumo das Alteracoes

| Arquivo/Componente | Alteracao |
|--------------------|-----------|
| Banco de Dados | Criar tabela `syndic_referrals` com RLS |
| `supabase/functions/send-referral/index.ts` | Nova edge function para enviar WhatsApp + Email |
| `src/pages/ReferSyndicPage.tsx` | Nova pagina com formulario de indicacao |
| `src/App.tsx` | Adicionar rota `/indicar-sindico` |
| `src/components/landing/Hero.tsx` | Adicionar link "Indique para seu sindico" |
| `src/components/landing/Footer.tsx` | Adicionar link no footer |

---

## Secao Tecnica

### Schema Zod para Validacao

```typescript
const referralSchema = z.object({
  syndicName: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  syndicPhone: z.string().trim().min(10, "Telefone invalido").max(20),
  syndicEmail: z.string().trim().email("Email invalido").max(255),
  condominiumName: z.string().trim().min(2, "Nome do condominio obrigatorio").max(200),
  referrerName: z.string().trim().max(100).optional(),
});
```

### Edge Function send-referral

```typescript
// Recebe dados do formulario
const { syndicName, syndicPhone, syndicEmail, condominiumName, referrerName } = await req.json();

// 1. Salva no banco
const { data: referral, error } = await supabase
  .from('syndic_referrals')
  .insert({ ... })
  .select()
  .single();

// 2. Envia WhatsApp via ZionTalk
const whatsappResult = await sendWhatsApp(syndicPhone, message);

// 3. Envia Email via SMTP
const emailResult = await sendEmail(syndicEmail, subject, htmlContent);

// 4. Atualiza status no banco
await supabase
  .from('syndic_referrals')
  .update({
    whatsapp_sent: whatsappResult.success,
    email_sent: emailResult.success
  })
  .eq('id', referral.id);
```

### Tratamento de Erros

- Se WhatsApp falhar, ainda tenta enviar Email
- Se Email falhar, ainda salva a indicacao
- Retorna status detalhado de cada envio
- Indicacao e salva mesmo se envios falharem (para acompanhamento manual)

### Seguranca

- Validacao de inputs com Zod no frontend e na edge function
- Sanitizacao de dados antes de salvar
- Rate limiting implicito (pode ser adicionado depois)
- Campos de telefone e email validados
