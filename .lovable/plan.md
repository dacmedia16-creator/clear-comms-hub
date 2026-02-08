# AVISO PRO - Sistema Multi-Segmento de Comunicação

## Status: Fase 7 Concluída ✅

---

## Fases Implementadas

### ✅ Fase 1-5: Base do Sistema
- Arquitetura multi-condomínio com Supabase
- Autenticação e perfis de usuário
- Sistema de avisos com categorias
- Notificações via WhatsApp, SMS e Email
- Timeline pública por organização

### ✅ Fase 6: Dashboard Personalizado por Segmento
- Templates de avisos específicos por tipo de organização
- Ações rápidas contextuais no painel admin
- Categorias dinâmicas baseadas no segmento

### ✅ Fase 7: Integração com Sistemas Externos

**Implementado:**

1. **Tabelas de Banco de Dados**
   - `webhooks` - Configuração de webhooks por organização
   - `api_tokens` - Tokens de autenticação para API REST
   - `webhook_logs` - Histórico de entregas de webhooks

2. **Edge Functions**
   - `trigger-webhook` - Dispara webhooks quando eventos ocorrem
   - `public-api` - API REST para integração externa
     - GET/POST `/announcements` - Listar/criar avisos
     - GET/POST `/members` - Listar/criar membros
     - POST `/members/bulk` - Import em lote
     - GET `/info` - Informações da organização

3. **Interface de Usuário**
   - `IntegrationsPage.tsx` - Página de gerenciamento de integrações
   - `WebhookList.tsx` - Lista e gerenciamento de webhooks
   - `WebhookDialog.tsx` - Criar/editar webhooks
   - `WebhookLogs.tsx` - Visualizar histórico de entregas
   - `ApiTokenList.tsx` - Lista e gerenciamento de tokens
   - `ApiTokenDialog.tsx` - Gerar novos tokens de API

4. **Hooks React**
   - `useWebhooks.ts` - CRUD de webhooks
   - `useApiTokens.ts` - Gerenciamento de tokens

5. **Segurança**
   - Tokens prefixados com `avp_` 
   - Hash SHA-256 armazenado (nunca texto claro)
   - Assinatura HMAC-SHA256 para webhooks
   - RLS policies para controle de acesso

6. **Documentação**
   - Documentação inline na aba "Documentação" da página de integrações
   - Exemplos de uso com cURL
   - Referência completa dos endpoints

---

## Próximas Fases

### Fase 8: Melhorias de UX e Mobile
- PWA com notificações push
- Modo offline para leitura
- Melhorias de performance

### Fase 9: Analytics e Relatórios
- Dashboard de métricas
- Relatórios de engajamento
- Exportação de dados

### Fase 10: Multi-idioma
- Internacionalização (i18n)
- Suporte a português e espanhol

---

## Arquitetura Atual

```
AVISO PRO
├── Frontend (React + Vite + Tailwind)
│   ├── Páginas públicas (landing, timeline)
│   ├── Dashboard de gestão
│   ├── Super Admin
│   └── Integrações
│
├── Backend (Supabase)
│   ├── PostgreSQL com RLS
│   ├── Edge Functions
│   │   ├── Notificações (WhatsApp, SMS, Email)
│   │   ├── Webhooks
│   │   └── API REST pública
│   └── Storage (avatares, anexos)
│
└── Integrações
    ├── ZionTalk (WhatsApp)
    ├── SMSFire (SMS)
    ├── ZeptoMail (Email)
    └── API REST para sistemas externos
```

---

## Tipos de Organização Suportados

| Tipo | Terminologia | Categorias Específicas |
|------|--------------|----------------------|
| Condomínio | Morador, Síndico | Manutenção, Convivência, Financeiro |
| Escola | Aluno, Coordenador | Pedagógico, Calendário, Eventos |
| Empresa | Colaborador, Gestor | RH, Compliance |
| Clínica | Paciente, Administrador | Atendimento, Horários |
| Associação | Associado, Presidente | Eventos, Assembleias |
| Academia | Aluno, Instrutor | Treinos, Horários |
| Igreja | Membro, Pastor | Cultos, Pastoral |
| Clube | Sócio, Administrador | Eventos, Esportes |

---

## Endpoints da API REST

Base URL: `https://jiqbgxtgzpdosbmydfcw.supabase.co/functions/v1/public-api`

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| GET | /announcements | read:announcements | Lista avisos |
| POST | /announcements | write:announcements | Cria aviso |
| GET | /members | read:members | Lista membros |
| POST | /members | write:members | Adiciona membro |
| POST | /members/bulk | write:members | Import em lote |
| GET | /info | - | Info da organização |

---

## Eventos de Webhook

| Evento | Descrição |
|--------|-----------|
| announcement.created | Aviso criado |
| announcement.updated | Aviso atualizado |
| announcement.deleted | Aviso excluído |
| member.created | Membro adicionado |
| member.updated | Membro atualizado |
