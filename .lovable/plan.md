
# Plano: Fase 7 - Integracao com Sistemas Externos

## O Que E Esta Fase?

A Fase 7 visa conectar o AVISO PRO a outros sistemas (ERPs, sistemas escolares, etc.) para que organizacoes possam:

1. **Receber notificacoes automaticas** quando um aviso for criado (Webhooks)
2. **Criar avisos e gerenciar membros** a partir de sistemas externos (API REST)
3. **Importar membros em massa** de planilhas exportadas de outros sistemas (Import CSV/Excel)

---

## Explicacao Simplificada

### 1. Webhooks - O Que Sao?

Imagine que voce quer que o sistema de RH da empresa receba uma mensagem automatica toda vez que um aviso de "Ferias Coletivas" for publicado no AVISO PRO.

**Como funciona:**
- O gestor configura uma URL do sistema externo (ex: `https://sistema-rh.empresa.com/webhooks/avisos`)
- Quando um aviso e criado, o AVISO PRO envia automaticamente os dados do aviso para essa URL
- O sistema externo recebe e processa a informacao

```text
[Gestor cria aviso] --> [AVISO PRO] --> [Envia POST para URL configurada] --> [Sistema RH recebe]
```

### 2. API REST - O Que E?

Uma "porta de entrada" para que sistemas externos possam ler e escrever dados no AVISO PRO programaticamente, sem precisar acessar a interface.

**Exemplos de uso:**
- Sistema escolar SIGEduc sincroniza alunos automaticamente com a lista de membros
- ERP cria avisos de "Fechamento de mes" automaticamente no dia 25
- App de portaria busca lista de moradores atualizada

### 3. Import em Lote - O Que E?

O sistema ja tem import de Excel (ImportMembersDialog.tsx). Vamos aprimora-lo para:
- Aceitar formatos de diferentes sistemas (colunas variadas)
- Detectar automaticamente o layout da planilha
- Atualizar membros existentes (ao inves de duplicar)

---

## Arquitetura Tecnica Proposta

### 2.1 Tabela de Configuracao de Webhooks

Nova tabela `webhooks` para armazenar URLs de destino:

```sql
CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] NOT NULL DEFAULT ARRAY['announcement.created'],
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Campos explicados:**
- `name`: Nome amigavel (ex: "Sistema RH", "Integracao ERP")
- `url`: Onde enviar os dados
- `secret`: Chave secreta para validar autenticidade (HMAC)
- `events`: Quais eventos disparam o webhook

### 2.2 Tabela de Tokens de API

Para autenticar chamadas da API REST:

```sql
CREATE TABLE public.api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  permissions TEXT[] DEFAULT ARRAY['read:announcements', 'read:members'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Permissoes disponiveis:**
- `read:announcements` - Ler avisos
- `write:announcements` - Criar/editar avisos
- `read:members` - Ler lista de membros
- `write:members` - Adicionar/editar membros

### 2.3 Tabela de Logs de Webhook

Para rastrear sucesso/falha dos envios:

```sql
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  success BOOLEAN DEFAULT false
);
```

---

## 3. Edge Functions a Criar

### 3.1 `trigger-webhook` - Disparar Webhooks

Chamada internamente quando um aviso e criado:

```typescript
// Fluxo:
// 1. Recebe dados do aviso
// 2. Busca webhooks configurados para o condominio
// 3. Para cada webhook ativo, envia POST com payload
// 4. Registra resultado no webhook_logs
```

**Payload enviado:**
```json
{
  "event": "announcement.created",
  "timestamp": "2026-02-08T10:30:00Z",
  "data": {
    "id": "uuid-do-aviso",
    "title": "Reuniao de Condominio",
    "summary": "Assembleia extraordinaria...",
    "category": "informativo",
    "published_at": "2026-02-08T10:30:00Z",
    "organization": {
      "id": "uuid-do-condo",
      "name": "Residencial Jardins",
      "type": "condominium"
    }
  }
}
```

### 3.2 `public-api` - Endpoints REST

Endpoint publico para integracao externa:

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/announcements` | Lista avisos |
| POST | `/api/announcements` | Cria aviso |
| GET | `/api/members` | Lista membros |
| POST | `/api/members` | Adiciona membro |
| POST | `/api/members/bulk` | Adiciona membros em lote |

**Autenticacao:**
```http
Authorization: Bearer avp_xxxxxxxxxxxxxx
```

### 3.3 `validate-webhook` - Gerar/Validar Assinaturas

Para garantir que webhooks recebidos sao autenticos:

```typescript
// Gera assinatura HMAC-SHA256
const signature = crypto.createHmac('sha256', secret)
  .update(JSON.stringify(payload))
  .digest('hex');

// Header enviado: X-AVISO-Signature: sha256=abc123...
```

---

## 4. Interface do Usuario

### 4.1 Nova Aba em Configuracoes: "Integracoes"

Adicionar em `/admin/:condoId/settings`:

```text
+------------------------------------------+
|  Integracoes                             |
+------------------------------------------+
|                                          |
|  [Webhooks]  [Tokens de API]             |
|                                          |
|  Webhooks Configurados                   |
|  +------------------------------------+  |
|  | Sistema RH                          | |
|  | https://rh.empresa.com/hook         | |
|  | Eventos: announcement.created       | |
|  | Status: Ativo                    [X] ||
|  +------------------------------------+  |
|                                          |
|  [+ Adicionar Webhook]                   |
|                                          |
+------------------------------------------+
```

### 4.2 Dialog: Criar Webhook

```text
+------------------------------------------+
|  Novo Webhook                            |
+------------------------------------------+
|                                          |
|  Nome *                                  |
|  [ Sistema de RH da Empresa           ]  |
|                                          |
|  URL de Destino *                        |
|  [ https://exemplo.com/webhook        ]  |
|                                          |
|  Eventos                                 |
|  [x] Aviso criado                        |
|  [x] Aviso atualizado                    |
|  [ ] Aviso excluido                      |
|  [ ] Membro adicionado                   |
|                                          |
|  Chave Secreta (opcional)                |
|  [ gerar-automaticamente-ou-digitar   ]  |
|                                          |
|        [Cancelar]  [Criar Webhook]       |
+------------------------------------------+
```

### 4.3 Dialog: Gerenciar Tokens de API

```text
+------------------------------------------+
|  Tokens de API                           |
+------------------------------------------+
|                                          |
|  Seus tokens:                            |
|  +------------------------------------+  |
|  | Integracao ERP                      | |
|  | avp_xxxx...xxxx (copiado!)          | |
|  | Permissoes: Ler avisos, Ler membros | |
|  | Ultimo uso: 08/02/2026 10:30       [X]|
|  +------------------------------------+  |
|                                          |
|  [+ Gerar Novo Token]                    |
|                                          |
|  Documentacao da API                     |
|  [Ver exemplos de integracao ->]         |
+------------------------------------------+
```

---

## 5. Componentes React a Criar

| Arquivo | Proposito |
|---------|-----------|
| `src/components/integrations/WebhookList.tsx` | Lista de webhooks configurados |
| `src/components/integrations/WebhookDialog.tsx` | Criar/editar webhook |
| `src/components/integrations/ApiTokenList.tsx` | Lista de tokens de API |
| `src/components/integrations/ApiTokenDialog.tsx` | Criar novo token |
| `src/components/integrations/WebhookLogs.tsx` | Historico de envios |
| `src/pages/IntegrationsPage.tsx` | Pagina de integracoes |

---

## 6. Fluxo de Criacao de Aviso (Atualizado)

```text
1. Gestor cria aviso
   |
2. INSERT na tabela announcements
   |
3. Trigger PostgreSQL dispara funcao
   |
4. Funcao chama Edge Function trigger-webhook
   |
5. Edge Function:
   a. Busca webhooks ativos para o condominio_id
   b. Para cada webhook, envia POST com payload
   c. Registra resultado em webhook_logs
   |
6. Sistema externo recebe dados
```

---

## 7. Casos de Uso por Segmento

### 7.1 Escola (SIGEduc, Totvs Educacional)

**Entrada:**
- Importar alunos em lote do sistema escolar
- Formato CSV: Nome, Matricula, Turma, Email Responsavel

**Saida:**
- Webhook quando aviso de "Reuniao de Pais" e criado
- Sistema escolar pode atualizar calendario automaticamente

### 7.2 Empresa (SAP, Totvs Protheus, Gupy)

**Entrada:**
- API cria avisos de RH automaticamente (ferias, beneficios)
- Import de funcionarios via CSV do sistema de RH

**Saida:**
- Webhook envia avisos urgentes para sistema de comunicacao interna

### 7.3 Condominio (SuperLogica, CondoMaster)

**Entrada:**
- Import de moradores da base do sistema de gestao
- API cria avisos de cobranca/financeiro

**Saida:**
- Webhook notifica sistema de portaria sobre avisos de seguranca

---

## 8. Seguranca

### 8.1 Autenticacao de API

- Tokens prefixados com `avp_` para identificacao
- Hash SHA-256 armazenado no banco (nunca o token em texto claro)
- Expiracao opcional configuravel
- Rate limiting: 100 req/min por token

### 8.2 Validacao de Webhooks

- Assinatura HMAC-SHA256 em cada request
- Header `X-AVISO-Signature: sha256=abc123...`
- Timeout de 10 segundos para resposta
- Retry automatico em caso de falha (3x com backoff)

### 8.3 RLS Policies

```sql
-- Webhooks: apenas gestores do condominio podem ver/editar
CREATE POLICY "webhooks_manage" ON webhooks
  FOR ALL USING (can_manage_condominium(condominium_id));

-- API Tokens: apenas gestores do condominio
CREATE POLICY "api_tokens_manage" ON api_tokens
  FOR ALL USING (can_manage_condominium(condominium_id));
```

---

## 9. Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `supabase/functions/trigger-webhook/index.ts` | **CRIAR** | Dispara webhooks quando aviso e criado |
| `supabase/functions/public-api/index.ts` | **CRIAR** | Endpoints REST para integracao |
| `src/pages/IntegrationsPage.tsx` | **CRIAR** | Pagina de gerenciamento de integracoes |
| `src/components/integrations/WebhookList.tsx` | **CRIAR** | Listagem de webhooks |
| `src/components/integrations/WebhookDialog.tsx` | **CRIAR** | Dialog para criar/editar webhook |
| `src/components/integrations/ApiTokenList.tsx` | **CRIAR** | Listagem de tokens |
| `src/components/integrations/ApiTokenDialog.tsx` | **CRIAR** | Dialog para gerar token |
| `src/hooks/useWebhooks.ts` | **CRIAR** | Hook para CRUD de webhooks |
| `src/hooks/useApiTokens.ts` | **CRIAR** | Hook para gerenciar tokens |
| `src/App.tsx` | Modificar | Adicionar rota /admin/:condoId/integrations |
| `src/pages/AdminCondominiumPage.tsx` | Modificar | Adicionar link para Integracoes no nav |
| `.lovable/plan.md` | Modificar | Marcar Fase 7 como concluida |

---

## 10. Ordem de Implementacao

1. **Migracao SQL** - Criar tabelas webhooks, api_tokens, webhook_logs com RLS
2. **Edge Function trigger-webhook** - Logica de disparo de webhooks
3. **Edge Function public-api** - Endpoints REST autenticados
4. **Hooks React** - useWebhooks e useApiTokens
5. **Componentes de UI** - Dialogs e listas
6. **Pagina IntegrationsPage** - Tela principal de integracoes
7. **Integracao no Admin** - Adicionar link no menu de navegacao
8. **Trigger PostgreSQL** - Disparar webhook automaticamente ao criar aviso
9. **Testes** - Verificar fluxo completo

---

## 11. Resultado Esperado

- Gestores podem configurar webhooks para notificar sistemas externos
- Sistemas externos podem criar avisos e membros via API REST
- Logs de webhook permitem debug de integracoes
- Import de membros funciona com formatos variados de planilha
- Documentacao inline ajuda desenvolvedores a integrar

