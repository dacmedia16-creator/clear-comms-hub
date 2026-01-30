
# Correção: Síndico não consegue criar novo morador

## Problema Identificado

O erro "new row violates row-level security policy for table 'profiles'" ocorre porque:

| Situação | Resultado |
|----------|-----------|
| Código atual | `createMember()` tenta inserir diretamente na tabela `profiles` |
| Política RLS | INSERT em `profiles` só permite `is_super_admin()` |
| Síndico | Não é super admin, então a inserção é **bloqueada** |

---

## Solução Proposta

Criar uma **Edge Function** que use `service_role` para criar o perfil e o vínculo com o condomínio. Isso contorna a restrição RLS de forma segura, pois a edge function:

1. Verifica se o usuário logado pode gerenciar o condomínio
2. Só então cria o profile e user_role usando privilégios elevados

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `supabase/functions/create-member/index.ts` | Edge function para criar morador |

---

## Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/hooks/useCondoMembers.ts` | Alterar `createMember()` para chamar a edge function |

---

## Implementação da Edge Function

A função irá:

1. Receber: `condominiumId`, `fullName`, `phone`, `email`, `unit`, `role`
2. Validar se o usuário autenticado pode gerenciar o condomínio
3. Criar um profile na tabela `profiles` usando service role
4. Criar o `user_role` vinculando ao condomínio
5. Retornar sucesso ou erro

```text
Fluxo:
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  Edge Function   │────▶│  Database       │
│  (Síndico)      │     │  (service_role)  │     │  (RLS bypass)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
    JWT Token           Verifica permissão          INSERT profiles
                        via can_manage_condo        INSERT user_roles
```

---

## Modificação no Hook

No `useCondoMembers.ts`, a função `createMember` passará a chamar:

```typescript
const { data, error } = await supabase.functions.invoke('create-member', {
  body: {
    condominiumId: condoId,
    fullName: memberData.fullName,
    phone: memberData.phone,
    email: memberData.email,
    unit: memberData.unit,
    role: memberData.role,
  }
});
```

---

## Por que esta solução é segura?

1. **Autenticação**: A edge function recebe o token JWT do usuário
2. **Autorização**: Verifica `can_manage_condominium()` antes de criar
3. **Service Role**: Só é usado após validação de permissão
4. **Auditoria**: O profile criado fica vinculado ao condomínio

---

## Resumo das Mudanças

| Componente | Estado Atual | Estado Novo |
|------------|--------------|-------------|
| `createMember()` | INSERT direto via cliente | Chamada à edge function |
| Edge Function | Não existe | `create-member` com service_role |
| Síndico | ❌ Erro RLS | ✅ Consegue criar moradores |
