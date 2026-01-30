
# Correção: Erro ao criar morador - Foreign Key Violation

## Problema Identificado

O erro nos logs é claro:

```
Key (user_id)=(7f40a1d3-9eac-4273-89cc-6743c2fe3714) is not present in table "users"
insert or update on table "profiles" violates foreign key constraint "profiles_user_id_fkey"
```

### Causa Raiz

| Tabela | Campo | Constraint | Problema |
|--------|-------|------------|----------|
| `profiles` | `user_id` | FK para `auth.users(id)` | **Obriga** que exista conta no Auth |
| Edge Function | `placeholderUserId` | UUID aleatório | **Não existe** em `auth.users` |

A tabela `profiles` foi projetada para usuários autenticados - cada profile DEVE ter um `auth.users` correspondente.

### Observação importante

A tabela `user_roles` tem dois campos:
- `user_id` - referencia `profiles.id` (obrigatório)
- `auth_user_id` - referencia `auth.users` (nullable) - para casos sem conta

---

## Solução Proposta

Criar uma nova tabela `condo_members` para moradores cadastrados manualmente (sem conta de autenticação), separada de `profiles`.

---

## Arquitetura Proposta

```text
Moradores COM conta (autenticados):
  auth.users --> profiles --> user_roles

Moradores SEM conta (cadastrados manualmente):
  condo_members --> user_roles (via campo separado)
```

---

## Alterações no Banco de Dados

### 1. Criar nova tabela `condo_members`

```sql
CREATE TABLE public.condo_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.condo_members ENABLE ROW LEVEL SECURITY;
```

### 2. Adicionar campo em `user_roles` para referenciar `condo_members`

```sql
ALTER TABLE public.user_roles
ADD COLUMN member_id UUID REFERENCES public.condo_members(id) ON DELETE CASCADE;

-- Constraint: deve ter OU user_id (profile) OU member_id, mas não ambos
ALTER TABLE public.user_roles
ADD CONSTRAINT user_or_member_required
CHECK (
  (user_id IS NOT NULL AND member_id IS NULL) OR
  (user_id IS NULL AND member_id IS NOT NULL)
);
```

### 3. Policies RLS para `condo_members`

```sql
-- Gestores podem ver membros de seus condomínios
CREATE POLICY "Managers can view condo members"
ON public.condo_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.member_id = condo_members.id
    AND can_manage_condominium(ur.condominium_id)
  )
);
```

---

## Modificações na Edge Function

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/create-member/index.ts` | Inserir em `condo_members` ao invés de `profiles` |

A edge function passa a:
1. Criar registro em `condo_members` (sem FK para auth.users)
2. Criar `user_role` com `member_id` ao invés de `user_id`

---

## Modificações no Frontend

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useCondoMembers.ts` | Ajustar query para incluir `condo_members` |
| `src/pages/CondoMembersPage.tsx` | Exibir tanto profiles quanto condo_members |

---

## Diagrama do Novo Modelo

```text
                    ┌──────────────────┐
                    │   auth.users     │
                    │   (Supabase)     │
                    └────────┬─────────┘
                             │ 1:1
                    ┌────────▼─────────┐
                    │    profiles      │
                    │  (autenticados)  │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                                     │
┌─────────▼──────────┐               ┌──────────▼─────────┐
│   condo_members    │               │     user_roles     │
│ (sem autenticacao) │◄──────────────│                    │
└────────────────────┘  member_id    └────────────────────┘
```

---

## Benefícios da Solução

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Moradores sem conta | Impossível (FK obriga auth.users) | Funciona via `condo_members` |
| Integridade de dados | FK violation | Separação clara |
| Moradores autenticados | Funciona | Continua funcionando |
| Migração futura | N/A | Morador pode criar conta e vincular |

---

## Resumo das Mudanças

1. **Migração SQL**: Criar tabela `condo_members` e modificar `user_roles`
2. **Edge Function**: Alterar para inserir em `condo_members`
3. **Frontend**: Ajustar queries para listar ambos tipos de membros
