
# Fluxo de Aprovação de Moradores pelo Síndico

## Objetivo
Implementar um sistema onde moradores que se cadastram ficam com status "pendente" até serem aprovados pelo síndico. Durante o período pendente:
- O painel do morador fica travado (mostra tela de "Aguardando aprovação")
- O morador NÃO recebe notificações de avisos (WhatsApp/SMS)

## Alterações Necessárias

| Arquivo/Recurso | Ação | Descrição |
|-----------------|------|-----------|
| Migration SQL | Criar | Atualizar política RLS para moradores incluir `is_approved = false` |
| `src/pages/auth/SignupResidentPage.tsx` | Modificar | Adicionar `is_approved: false` no insert |
| `src/hooks/useCondoMembers.ts` | Modificar | Incluir campo `is_approved` na busca e interface |
| `src/pages/CondoMembersPage.tsx` | Modificar | Adicionar coluna de status e botão de aprovar |
| `supabase/functions/send-whatsapp/index.ts` | Modificar | Filtrar apenas membros aprovados |
| `supabase/functions/send-sms/index.ts` | Modificar | Filtrar apenas membros aprovados |

---

## Detalhes Técnicos

### 1. Migration SQL - Atualizar Política RLS

Modificar a política de auto-registro de moradores para exigir `is_approved = false`:

```sql
-- Remover política atual
DROP POLICY IF EXISTS "Users can self-register as resident" ON public.user_roles;

-- Criar nova política que exige is_approved = false
CREATE POLICY "Users can self-register as resident"
ON public.user_roles FOR INSERT
WITH CHECK (
  (role = 'resident'::app_role) 
  AND (is_approved = false)
  AND (user_id = (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
);
```

### 2. Cadastro de Moradores - Adicionar is_approved: false

No arquivo `src/pages/auth/SignupResidentPage.tsx`, linha 188-195:

```tsx
// ANTES
const { error: roleError } = await supabase
  .from("user_roles")
  .insert({
    user_id: profile.id,
    condominium_id: validCondo.id,
    role: "resident",
    unit: unit,
  });

// DEPOIS
const { error: roleError } = await supabase
  .from("user_roles")
  .insert({
    user_id: profile.id,
    condominium_id: validCondo.id,
    role: "resident",
    unit: unit,
    is_approved: false, // Pendente de aprovação
  });
```

Também atualizar a mensagem de sucesso para informar que aguarda aprovação.

### 3. Hook useCondoMembers - Incluir is_approved

Adicionar `is_approved` na interface e na query:

```typescript
export interface CondoMember {
  id: string;
  user_id: string;
  role: "admin" | "syndic" | "resident" | "collaborator";
  unit: string | null;
  is_approved: boolean; // NOVO
  created_at: string;
  profile: { ... } | null;
}
```

Adicionar função `approveMember`:

```typescript
const approveMember = async (memberId: string) => {
  const { error } = await supabase
    .from("user_roles")
    .update({ is_approved: true })
    .eq("id", memberId);
  // ...
};
```

### 4. Página de Moradores - UI de Aprovação

Adicionar coluna "Status" na tabela e botão de aprovar:

```text
┌─────────────────────────────────────────────────────────────────┐
│ Usuário     │ Telefone    │ Unidade │ Função  │ Status  │ Ações │
├─────────────────────────────────────────────────────────────────┤
│ João Silva  │ 11999...    │ A-101   │ Morador │ [Pend.] │ ✓ 🗑  │
│ Maria Lima  │ 11888...    │ B-202   │ Morador │ [Aprov] │   🗑  │
└─────────────────────────────────────────────────────────────────┘

[Pend.] = Badge amarelo com botão de aprovar (✓)
[Aprov] = Badge verde "Aprovado"
```

### 5. Edge Functions - Filtrar Membros Aprovados

No `send-whatsapp/index.ts` e `send-sms/index.ts`, adicionar filtro:

```typescript
// ANTES
const { data: membersData } = await supabase
  .from('user_roles')
  .select('user_id, profiles!inner(id, phone, full_name)')
  .eq('condominium_id', condominium.id)
  .not('profiles.phone', 'is', null);

// DEPOIS
const { data: membersData } = await supabase
  .from('user_roles')
  .select('user_id, is_approved, profiles!inner(id, phone, full_name)')
  .eq('condominium_id', condominium.id)
  .eq('is_approved', true) // NOVO: apenas membros aprovados
  .not('profiles.phone', 'is', null);
```

---

## Fluxo do Usuário

### Morador se cadastra:
1. Preenche formulário com código do condomínio
2. Conta é criada com `is_approved = false`
3. Dashboard mostra tela "Aguardando aprovação" (já existe: `PendingApprovalScreen`)

### Síndico aprova:
1. Acessa Dashboard → clica em "Moradores"
2. Vê lista com moradores pendentes destacados em amarelo
3. Clica no botão ✓ para aprovar
4. Status muda para "Aprovado" (verde)

### Após aprovação:
1. Morador atualiza a página (ou clica "Verificar status")
2. Dashboard carrega normalmente
3. Passa a receber notificações de novos avisos

---

## Mensagens de Feedback

| Ação | Mensagem |
|------|----------|
| Cadastro do morador | "Sua conta foi criada! Aguarde a aprovação do síndico para acessar o condomínio." |
| Síndico aprova | "Morador aprovado com sucesso!" |
| Morador pendente | Tela com ícone de relógio e texto "Aguardando aprovação do síndico" |

---

## Resultado Esperado

- Moradores novos entram no sistema como "pendentes"
- Síndico tem controle sobre quem pode acessar o condomínio
- Apenas moradores aprovados recebem notificações
- O fluxo já existente para síndicos pendentes é reutilizado para moradores
