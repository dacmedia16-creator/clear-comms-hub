

# Unificar Gestão de APIs de Notificação

## Resumo

Renomear e expandir a página atual de WhatsApp (`SuperAdminWhatsApp`) para se tornar um painel completo de gestão de todas as APIs de notificação (WhatsApp, SMS e Email), consolidando status, configurações por condomínio e logs em um único local.

## Situação Atual

| API | Edge Function | Tabela de Logs | Flag por Condo | Página de Gestão |
|-----|---------------|----------------|----------------|------------------|
| WhatsApp (Zion Talk) | `send-whatsapp` | `whatsapp_logs` | `notification_whatsapp` | SuperAdminWhatsApp |
| SMS (SMSFire) | `send-sms` | `sms_logs` | `notification_sms` | Não existe |
| Email (Zoho) | `send-email` | `email_logs` | `notification_email` | Não existe |

## Solução Proposta

### Nova Estrutura da Página

Transformar `SuperAdminWhatsApp.tsx` em `SuperAdminNotifications.tsx`:

```text
┌─────────────────────────────────────────────────────────────┐
│  🔔 Central de Notificações                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ WhatsApp    │ │ SMS         │ │ Email       │           │
│  │ ✅ Ativo    │ │ ✅ Ativo    │ │ ✅ Ativo    │           │
│  │ Zion Talk   │ │ SMSFire     │ │ Zoho Mail   │           │
│  │ [Testar]    │ │ [Testar]    │ │ [Testar]    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Condomínios                                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Nome        │ Plano │ WhatsApp │ SMS   │ Email │ Ações │ │
│  │ Esplanada   │ PRO   │ ✅       │ ✅    │ ✅    │ ...   │ │
│  │ Jardins     │ FREE  │ ❌       │ ❌    │ ✅    │ ...   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [WhatsApp ▼] [SMS] [Email]   Logs de Envio Recentes        │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Data/Hora │ Condo │ Destino │ Status                  │ │
│  │ 30/01 10h │ Espl. │ 159... │ ✅ Enviado              │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Funcionalidades por Seção

**1. Cards de Status das APIs (Novo)**
- Card para cada API (WhatsApp, SMS, Email)
- Indicador visual de configuração (verde/vermelho)
- Nome do provedor (Zion Talk, SMSFire, Zoho)
- Botão "Enviar Teste Global" para cada API

**2. Tabela de Condomínios (Expandida)**
- Adicionar colunas para SMS e Email (já existe só WhatsApp)
- Switch para ativar/desativar cada tipo de notificação
- Botões de teste para cada API por condomínio

**3. Logs Unificados com Tabs (Novo)**
- Tabs para alternar entre logs de WhatsApp, SMS e Email
- Mesma estrutura de tabela para todos os tipos
- Dados vindos das tabelas `whatsapp_logs`, `sms_logs`, `email_logs`

### Edge Functions de Teste (Novas)

Criar funções de teste para SMS e Email (similar ao `test-whatsapp`):

**`test-sms`** - Envia SMS de teste para um número específico
**`test-email`** - Envia email de teste para um endereço específico

## Detalhes Técnicos

### Arquivos a Modificar

| Arquivo | Alterações |
|---------|------------|
| `SuperAdminWhatsApp.tsx` | Renomear para `SuperAdminNotifications.tsx` e expandir |
| `App.tsx` | Atualizar rota de `/super-admin/whatsapp` para `/super-admin/notifications` |
| Navigation items | Atualizar ícone e label para "Notificações" |

### Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `supabase/functions/test-sms/index.ts` | Edge function para teste de SMS |
| `supabase/functions/test-email/index.ts` | Edge function para teste de Email |

### Queries de Dados

```typescript
// Buscar condomínios com todas as flags
const { data } = await supabase
  .from("condominiums")
  .select("id, name, slug, plan, notification_whatsapp, notification_sms, notification_email")
  .order("name");

// Buscar logs por tipo
const logsQueries = {
  whatsapp: supabase.from("whatsapp_logs").select("*, condominiums(name)").order("sent_at", { ascending: false }).limit(50),
  sms: supabase.from("sms_logs").select("*, condominiums(name)").order("sent_at", { ascending: false }).limit(50),
  email: supabase.from("email_logs").select("*, condominiums(name)").order("sent_at", { ascending: false }).limit(50),
};
```

### Interface dos Cards de Status

```typescript
interface ApiStatus {
  id: 'whatsapp' | 'sms' | 'email';
  name: string;
  provider: string;
  icon: LucideIcon;
  configured: boolean;
  checking: boolean;
  checkFunction: string;
  secretsToCheck: string[];
}

const apis: ApiStatus[] = [
  { id: 'whatsapp', name: 'WhatsApp', provider: 'Zion Talk', icon: MessageSquare, ... },
  { id: 'sms', name: 'SMS', provider: 'SMSFire', icon: Smartphone, ... },
  { id: 'email', name: 'Email', provider: 'Zoho Mail', icon: Mail, ... },
];
```

### Modal de Teste Unificado

O modal de teste será dinâmico, adaptando-se ao tipo de notificação:

```text
WhatsApp/SMS → Input de telefone com máscara BR
Email → Input de email
```

## Resultado Esperado

Super Admins terão uma visão consolidada de todas as integrações de notificação em um único painel, podendo:
- Ver status de cada API em tempo real
- Ativar/desativar canais por condomínio
- Testar cada canal individualmente
- Monitorar logs de envio de todos os canais

