
# Gerenciamento de Numeros de WhatsApp para Disparo

## Objetivo
Criar um sistema para adicionar, gerenciar e selecionar multiplos numeros de WhatsApp para disparo de mensagens na Central de Notificacoes do Super Admin.

---

## Arquitetura da Solucao

### 1. Nova Tabela no Banco de Dados

```sql
CREATE TABLE whatsapp_senders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,              -- Nome identificador (ex: "Numero Principal")
  phone TEXT NOT NULL,             -- Numero do WhatsApp
  api_key TEXT NOT NULL,           -- API Key do Zion Talk para este numero
  is_active BOOLEAN DEFAULT true,  -- Se esta ativo para uso
  is_default BOOLEAN DEFAULT false,-- Se e o numero padrao
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. Politicas RLS
- Apenas Super Admins podem visualizar, criar, editar e deletar numeros

---

## Alteracoes no Frontend

### Arquivo: `src/pages/super-admin/SuperAdminNotifications.tsx`

**Novo Card de Numeros de WhatsApp** (apos os cards de status das APIs):
- Tabela listando todos os numeros cadastrados
- Colunas: Nome, Telefone, Status (Ativo/Inativo), Padrao
- Botao "Adicionar Numero" que abre um dialog
- Acoes por linha: Editar, Excluir, Definir como Padrao

**Novo Dialog para Adicionar/Editar Numero**:
- Campo: Nome (identificador)
- Campo: Telefone (com mascara brasileira)
- Campo: API Key do Zion Talk
- Switch: Ativo
- Checkbox: Definir como padrao

---

## Componentes Novos

### 1. `WhatsAppSendersCard.tsx`
Card que exibe a lista de numeros cadastrados com acoes

### 2. `AddWhatsAppSenderDialog.tsx`
Dialog para adicionar novo numero de WhatsApp

### 3. `EditWhatsAppSenderDialog.tsx`
Dialog para editar numero existente

---

## Alteracoes na Edge Function

### `supabase/functions/send-whatsapp/index.ts`
- Buscar o numero padrao (ou o primeiro ativo) da tabela `whatsapp_senders`
- Usar a API Key associada ao numero selecionado
- Logar qual numero foi usado no envio

---

## Fluxo de Uso

```text
+---------------------+
|  Central de         |
|  Notificacoes       |
+----------+----------+
           |
           v
+----------+----------+
|  Card: Numeros      |
|  WhatsApp           |
|  [+ Adicionar]      |
+----------+----------+
           |
           v
+----------+----------+
|  Dialog: Novo       |
|  Numero             |
|  - Nome             |
|  - Telefone         |
|  - API Key          |
|  - Ativo?           |
|  - Padrao?          |
+---------------------+
```

---

## Resumo das Alteracoes

| Tipo | Arquivo/Recurso | Descricao |
|------|-----------------|-----------|
| SQL | Migration | Criar tabela `whatsapp_senders` com RLS |
| React | `SuperAdminNotifications.tsx` | Adicionar secao de gerenciamento de numeros |
| React | `WhatsAppSendersCard.tsx` (novo) | Componente do card de numeros |
| React | `AddWhatsAppSenderDialog.tsx` (novo) | Dialog para adicionar numero |
| Edge | `send-whatsapp/index.ts` | Buscar API Key do numero configurado |

---

## Secao Tecnica

### Estrutura da Tabela

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Identificador unico |
| name | TEXT | Nome amigavel do numero |
| phone | TEXT | Numero de telefone formatado |
| api_key | TEXT | API Key do Zion Talk |
| is_active | BOOLEAN | Se o numero esta ativo |
| is_default | BOOLEAN | Se e o numero padrao para disparos |
| created_at | TIMESTAMPTZ | Data de criacao |
| updated_at | TIMESTAMPTZ | Data de atualizacao |

### Politicas RLS

```sql
-- Apenas Super Admins podem gerenciar
CREATE POLICY "Super admins can manage whatsapp_senders"
ON whatsapp_senders FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());
```

### Logica de Selecao do Numero
1. Buscar numero com `is_default = true` e `is_active = true`
2. Se nao existir, buscar primeiro numero com `is_active = true`
3. Se nenhum, usar a `ZIONTALK_API_KEY` do ambiente (fallback)
