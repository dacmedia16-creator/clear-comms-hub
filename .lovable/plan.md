

# Caminho B — Adicionar vertical "Imobiliária" no AVISO PRO

Você confirmou: **Caminho B**, sem clientes em produção, mantendo `avisopro.com.br`, e a lista "Corretores - SP" não é base do novo CRM. Excelente — isso simplifica muito.

## Estratégia

Adicionar `real_estate` como **9º segmento** do AVISO PRO. Imobiliárias viram organizações (`condominiums`), corretores e proprietários viram membros (`condo_members` + `user_roles`). Tudo o mais (imóveis, leads, pipeline, tarefas, interações) vira **tabelas novas** ligadas ao `condominium_id`.

Reaproveita 100%: auth, RLS, super-admin, planos, WhatsApp/SMS/Email, webhooks, terminologia dinâmica, landing pages, integrações.

## Mapeamento conceitual

| CRM Imobiliário | AVISO PRO |
|---|---|
| Imobiliária | `condominiums` (organization_type=`real_estate`) |
| Corretor / Proprietário (contato) | `condo_members` + `user_roles` |
| Imóvel | nova tabela `properties` |
| Lead de captação | nova tabela `capture_leads` |
| Pipeline | novas tabelas `pipelines` + `pipeline_stages` |
| Etapa atual de imóvel/corretor | coluna `stage_id` em `properties`/`user_roles` |
| Interação (call, msg, visita) | nova tabela `interactions` |
| Tarefa / Follow-up | nova tabela `tasks` |
| Template de mensagem | reaproveita `whatsapp_senders` + nova `message_templates` |
| Histórico de envio | reaproveita `whatsapp_logs`, `sms_logs`, `email_logs` |
| Auditoria | nova tabela `audit_logs` |

## Entregas (faseadas)

### Fase 0 — Fundação (esta entrega, MVP)

**Banco:**
1. Adicionar `'real_estate'` ao enum `organization_type`
2. Adicionar config em `src/lib/organization-types.ts` com termos: Imobiliária / Diretor / Contato / Região / Tipo de imóvel
3. Adicionar landing `/imobiliarias` (similar a `/clinicas`)
4. Novas tabelas (todas com RLS via `can_manage_condominium`):
   - `properties` (id, condominium_id, owner_member_id, code, title, type, status, address, city, state, price, area_m2, bedrooms, bathrooms, parking, description, stage_id, listing_agent_id, captured_at, photos jsonb, metadata jsonb)
   - `capture_leads` (id, condominium_id, lead_type ['property'|'broker'], full_name, phone, email, source, stage_id, assigned_to, notes, created_at, converted_at, converted_to)
   - `pipelines` (id, condominium_id, name, lead_type, is_default)
   - `pipeline_stages` (id, pipeline_id, name, position, color, sla_days)
   - `interactions` (id, condominium_id, entity_type ['property'|'lead'|'member'], entity_id, channel ['whatsapp'|'sms'|'email'|'call'|'visit'|'note'], direction, content, created_by, created_at, metadata jsonb)
   - `tasks` (id, condominium_id, entity_type, entity_id, assigned_to, title, description, due_at, completed_at, status, priority, created_by)
   - `message_templates` (id, condominium_id, channel, name, body, variables jsonb, is_active)
   - `audit_logs` (id, condominium_id, actor_id, action, entity_type, entity_id, before jsonb, after jsonb, created_at)
5. Pipelines padrão para o segmento `real_estate` (seed via migração):
   - **Captação de Imóveis**: Lead → Contato feito → Visita agendada → Documentação → Captado → Publicado
   - **Captação de Corretores**: Lead → Contato feito → Entrevista → Aprovado → Onboarding → Ativo

**UI mínima (acessível via `/imobiliaria/:condoId/...`):**
- Dashboard imobiliário (cards: imóveis ativos, leads abertos, tarefas do dia, conversões do mês)
- Lista + cadastro de **imóveis** (tabela com filtros, formulário, upload de fotos no bucket `attachments`)
- Lista + cadastro de **proprietários e corretores** (reusa `condo_members` + role novo `broker`)
- Lista + cadastro de **leads de captação** (tipo: imóvel ou corretor)
- Visualização **Kanban** dos 2 pipelines (drag-and-drop entre etapas)
- Tela de **detalhe** (imóvel/lead/corretor) com aba histórico (interações + tarefas + envios)
- **Envio manual** WhatsApp/SMS/Email a partir do detalhe (reusa edge functions existentes)
- Lista de **tarefas/follow-ups** do usuário
- **Templates de mensagem** (CRUD simples)

**Permissões (novos roles):**
- Adicionar `'broker'` (corretor) e `'operator'` (operador) ao enum `app_role`
- `admin` / `syndic` (=Diretor) → tudo
- `operator` → CRUD imóveis/leads/tarefas, sem deletar
- `broker` → vê só o que é dele (assigned_to = self), atualiza próprias tarefas
- `resident` → leitura (cliente final futuramente)

**Edge Functions:**
- Reaproveita `send-whatsapp`, `send-sms`, `send-email` sem mudanças
- Nova `convert-lead` (transforma um `capture_lead` em `properties` ou `user_roles` com role=broker, registra auditoria)
- Nova `move-pipeline-stage` (atualiza stage, registra interação automática + auditoria)

### Fase 1 — Automações (próxima entrega)

- Trigger: novo lead → cria tarefa "Primeiro contato" automaticamente (24h)
- Cron: leads parados há mais de N dias na mesma etapa → cria tarefa de lembrete
- Trigger: corretor aprovado → dispara template de onboarding (WhatsApp + Email)
- Trigger: mudança de etapa → cria registro em `interactions` com tipo `note`
- Tudo via `pg_cron` + `pg_net` chamando edge functions

### Fase 2 — Avançado (depois)

- Importação de imóveis em massa (CSV)
- Página pública do imóvel (compartilhável)
- Webhooks de saída (já existe infra) para integrar com portais (VivaReal, ZAP)
- App do corretor (mobile-first)
- Relatórios e funis

## Segurança (revisão)

- RLS em todas as novas tabelas usando `can_manage_condominium(condominium_id)` + `is_super_admin()`
- Tabela `audit_logs` só `INSERT` via SECURITY DEFINER, `SELECT` para gestores da org
- Nenhum secret no front; integrações via edge functions (já é o padrão)
- Edge functions críticas (`convert-lead`, `move-pipeline-stage`) validam JWT e role
- Storage `attachments` já público — fotos de imóveis ok lá; arquivos sensíveis (docs de proprietário) → criar bucket privado `property-docs`

## Migração / convivência com AVISO PRO atual

- **Zero quebra**: todas as novas tabelas e rotas são aditivas
- Rotas novas em `/imobiliaria/:condoId/*` (não conflitam com `/condominio/...`)
- Landing `/imobiliarias` adicionada ao `SegmentGrid` da home
- Dashboard principal continua funcionando para todos os segmentos antigos
- Quando entrar numa org com `organization_type='real_estate'`, o menu lateral troca para o do CRM imobiliário (rotas + ícones)
- Renomeação cosmética **só na UI** via `useOrganizationTerms` (já existe) — banco continua com `condo_members`/`condominiums`

## Escopo desta primeira entrega (concreto)

Para não fazer um entregável gigante e arriscado, sugiro **fatiar a Fase 0** em 2 PRs:

**PR 1 — Fundação técnica (esta sprint):**
- Migração: enum `real_estate`, novas tabelas, RLS, novos roles, pipelines seed
- `organization-types.ts` com configuração do segmento
- Landing `/imobiliarias`
- Dashboard imobiliário (read-only, mostra cards zerados)
- CRUD de imóveis (tela de lista + formulário) — sem Kanban ainda

**PR 2 — Operação (sprint seguinte):**
- CRUD de leads + corretores
- Kanban dos 2 pipelines
- Tela de detalhe com histórico + envio manual de mensagens
- Tarefas e templates

## Perguntas antes de começar o PR 1

1. **Confirma o fatiamento PR1 + PR2** ou quer entregar tudo da Fase 0 de uma vez (mais arriscado, mais demorado)?
2. **Terminologia do segmento**: confirmo Diretor (gestor) / Contato (membro genérico) / Região (block) / Tipo de imóvel (unit) — ou prefere outra?
3. **Roles novos**: confirmo `broker` e `operator`, ou só `broker` por enquanto?
4. **Acesso**: o CRM imobiliário deve ser visível no menu apenas quando `organization_type='real_estate'`, ou sempre que o usuário tiver alguma org desse tipo?

