
# Síndico pode Editar Cadastro de Moradores

## Objetivo
Permitir que síndicos e gestores de condomínio editem os dados cadastrais dos moradores (nome, telefone, email, bloco e unidade) diretamente pela página de Moradores.

---

## Análise do Sistema Atual

O sistema possui dois tipos de membros:

| Tipo | Tabela de Dados | Tabela de Vínculo |
|------|----------------|-------------------|
| Usuários autenticados | `profiles` | `user_roles` |
| Moradores manuais | `condo_members` | `user_roles` |

### RLS Policies Existentes
- `condo_members`: "Managers can update condo members" - OK
- `user_roles`: "Managers can update user roles" - OK
- `profiles`: Síndicos **NÃO podem** atualizar (apenas o próprio usuário ou Super Admin)

### Conclusão
Síndicos podem editar:
- Dados de `condo_members` (moradores manuais)
- Bloco/Unidade em `user_roles`

Síndicos **NÃO podem** editar:
- Dados de `profiles` (nome/email/telefone de usuários autenticados)

---

## Solução Proposta

### 1. Criar Componente `EditMemberDialog.tsx`

Diálogo para edição de moradores com campos:
- Nome Completo *
- Telefone
- Email
- Bloco/Torre *
- Unidade/Apt *

O diálogo identifica automaticamente se é um `condo_member` (editável) ou `profile` (apenas bloco/unidade editáveis).

### 2. Adicionar Função `updateMember` no Hook

```typescript
// No useCondoMembers.ts
const updateMember = async (
  memberId: string,
  memberType: "profile" | "condo_member",
  data: {
    fullName?: string;
    phone?: string;
    email?: string;
    block: string;
    unit: string;
  }
) => {
  // Atualiza user_roles (block, unit)
  // Se condo_member, atualiza também nome/phone/email
};
```

### 3. Adicionar Botão de Edição na Tabela

Ícone de lápis ao lado do botão de remover em cada linha.

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/EditMemberDialog.tsx` | Criar novo |
| `src/hooks/useCondoMembers.ts` | Adicionar `updateMember` |
| `src/pages/CondoMembersPage.tsx` | Adicionar botão de edição e estado do diálogo |

---

## Detalhes Técnicos

### EditMemberDialog.tsx

```typescript
interface EditMemberDialogProps {
  member: CondoMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UpdateMemberData) => Promise<{ success: boolean; error?: string }>;
}
```

**Comportamento**:
- Se `member.member_id` existe (condo_member): todos os campos editáveis
- Se `member.user_id` existe (profile): apenas Bloco e Unidade editáveis, demais campos desabilitados com tooltip "Este usuário gerencia seus próprios dados"

### updateMember no Hook

```typescript
const updateMember = async (
  roleId: string,
  updates: {
    fullName?: string;
    phone?: string;
    email?: string;
    block: string;
    unit: string;
  }
) => {
  const member = members.find(m => m.id === roleId);
  if (!member) return { success: false, error: "Membro não encontrado" };

  // 1. Atualizar user_roles (block, unit)
  await supabase
    .from("user_roles")
    .update({ block: updates.block, unit: updates.unit })
    .eq("id", roleId);

  // 2. Se for condo_member, atualizar dados pessoais
  if (member.member_id) {
    await supabase
      .from("condo_members")
      .update({
        full_name: updates.fullName,
        phone: updates.phone || null,
        email: updates.email || null,
      })
      .eq("id", member.member_id);
  }

  return { success: true };
};
```

### Interface na Tabela

```text
┌───────────────────────────────────────────────────────────────────┐
│ Usuário        │ Telefone  │ Unidade │ Função  │ Status  │ Ações  │
├───────────────────────────────────────────────────────────────────┤
│ João Silva     │ 1199...   │ A, 101  │ Morador │ Aprovado│ ✏️ 🗑️ │
│ maria@email    │           │         │         │         │        │
└───────────────────────────────────────────────────────────────────┘
```

---

## Fluxo do Usuário

1. Síndico acessa página de Moradores
2. Clica no ícone de edição (lápis) em uma linha
3. Diálogo abre com dados preenchidos
4. Para condo_members: edita todos os campos
5. Para profiles: edita apenas Bloco/Unidade
6. Clica em Salvar
7. Toast de confirmação

---

## Resumo das Tarefas

| # | Tarefa |
|---|--------|
| 1 | Criar `EditMemberDialog.tsx` com campos condicionais |
| 2 | Adicionar função `updateMember` em `useCondoMembers.ts` |
| 3 | Integrar botão de edição e diálogo em `CondoMembersPage.tsx` |
| 4 | Integrar em `SuperAdminCondoMembers.tsx` (super admin também pode editar) |

---

## Resultado Esperado

Após implementação:
- Síndico pode editar todos os dados de moradores manuais (condo_members)
- Síndico pode alterar Bloco/Unidade de qualquer membro
- Dados de perfil de usuários autenticados permanecem protegidos (só o próprio usuário altera)
