
# Envio Segmentado por Bloco/Unidade - Bloco Obrigatório

## Alteração Solicitada

O campo **Bloco/Torre** será obrigatório em todo o sistema, assim como Nome, Telefone, Email e Unidade.

---

## Resumo das Mudanças

| Campo | Obrigatório | Exemplo |
|-------|-------------|---------|
| Nome Completo | Sim | João da Silva |
| Telefone | Sim | 11999999999 |
| Email | Sim | joao@email.com |
| Bloco/Torre | **Sim** | A, Torre 1, Bloco B |
| Unidade/Apt | Sim | 101, 202, Casa 5 |
| Função | Não (default: morador) | morador |

---

## Arquivos a Modificar

### 1. Banco de Dados

```sql
-- Adicionar coluna block (NOT NULL com valor default temporário para permitir migração)
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS block TEXT;

-- Adicionar colunas de segmentação em announcements
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_blocks TEXT[];
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_units TEXT[];
```

### 2. AddMemberDialog.tsx

**Estado atual**: Campo único "Bloco e Unidade"

**Mudança**: Separar em dois campos obrigatórios

| Campo | Label | Placeholder | Validação |
|-------|-------|-------------|-----------|
| block | Bloco/Torre * | A, Torre 1, Bloco B | Não pode ser vazio |
| unit | Unidade/Apt * | 101, 202, Casa 5 | Não pode ser vazio |

**Validação a adicionar**:
```typescript
if (!block.trim()) {
  setError("Bloco/Torre é obrigatório");
  return;
}
```

### 3. ImportMembersDialog.tsx

**Novo formato da planilha** (6 colunas):

| Coluna | Campo | Obrigatório |
|--------|-------|-------------|
| A | Nome Completo | Sim |
| B | Telefone | Sim |
| C | Email | Sim |
| D | Bloco/Torre | **Sim** |
| E | Unidade/Apt | Sim |
| F | Função | Não |

**Validação a adicionar**:
```typescript
if (!block) errors.push("Bloco obrigatório");
```

**Modelo de planilha atualizado**:
```typescript
const ws = XLSX.utils.aoa_to_sheet([
  ["Nome Completo", "Telefone", "Email", "Bloco/Torre", "Unidade/Apt", "Função"],
  ["João da Silva", "11999999999", "joao@email.com", "A", "101", "morador"],
  ["Maria Santos", "11988888888", "maria@email.com", "B", "202", "morador"],
]);
```

### 4. create-member Edge Function

**Payload atualizado**:
```typescript
interface CreateMemberRequest {
  condominiumId: string;
  fullName: string;
  phone: string;
  email: string;
  block: string;  // NOVO - obrigatório
  unit: string;
  role: "admin" | "syndic" | "resident" | "collaborator";
}
```

**Validação a adicionar**:
```typescript
if (!condominiumId || !fullName || !role || !block || !unit) {
  return Response({ error: "Missing required fields" });
}
```

### 5. useCondoMembers Hook

Atualizar interface `CreateMemberData`:
```typescript
interface CreateMemberData {
  fullName: string;
  phone: string;
  email: string;
  block: string;  // NOVO
  unit: string;
  role: Role;
}
```

### 6. Formulário de Criação de Aviso

Adicionar seletor de destinatários com lista de blocos disponíveis:

```text
Destinatários:
● Todos os moradores
○ Blocos específicos → [A] [B] [C] ...
○ Unidades específicas → 101, 102, ...
```

### 7. Edge Functions de Notificação

Adicionar filtro por bloco/unidade na query de membros.

---

## Interface Atualizada do Formulário

```text
┌─────────────────────────────────────────────────────────────┐
│  Nome Completo *                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ João da Silva                                           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  Telefone *                      Email *                     │
│  ┌───────────────────────┐      ┌────────────────────────┐   │
│  │ +55 11 99999-9999     │      │ joao@email.com         │   │
│  └───────────────────────┘      └────────────────────────┘   │
│                                                              │
│  Bloco/Torre *                   Unidade/Apt *               │
│  ┌───────────────────────┐      ┌────────────────────────┐   │
│  │ A                     │      │ 101                    │   │
│  └───────────────────────┘      └────────────────────────┘   │
│                                                              │
│  Função *                                                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Morador                                            ▼    │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Resumo das Tarefas

| # | Tarefa |
|---|--------|
| 1 | Migração SQL: adicionar `block` em `user_roles` e `target_blocks/target_units` em `announcements` |
| 2 | Atualizar `AddMemberDialog.tsx`: separar Bloco e Unidade, ambos obrigatórios |
| 3 | Atualizar `ImportMembersDialog.tsx`: nova coluna "Bloco", validação obrigatória |
| 4 | Atualizar `create-member` Edge Function: aceitar e validar campo `block` |
| 5 | Atualizar `useCondoMembers.ts`: incluir `block` na interface e chamada |
| 6 | Criar hook `useCondoBlocks.ts`: buscar blocos únicos do condomínio |
| 7 | Atualizar `AdminCondominiumPage.tsx`: seletor de destinatários no formulário de aviso |
| 8 | Atualizar Edge Functions de notificação: filtrar por `block` e `unit` |

---

## Resultado

Após implementação:
- Todo morador terá Bloco E Unidade obrigatórios
- Síndico poderá enviar aviso para blocos ou unidades específicas
- Sistema terá dados normalizados para filtragem precisa
