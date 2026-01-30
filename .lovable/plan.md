
# Correção: Moradores manuais não recebem notificações

## Problema Identificado

O morador "Francisco de Souza" criado pela síndica Fernanda foi cadastrado na tabela `condo_members`, mas as Edge Functions de notificação só buscam dados de `profiles`.

| Tipo de Membro | Tabela de Dados | Incluído nos Envios? |
|----------------|-----------------|----------------------|
| Com conta (autenticado) | `profiles` | Sim |
| Sem conta (manual) | `condo_members` | Não |

---

## Causa Raiz

A query nas 3 Edge Functions (`send-whatsapp`, `send-sms`, `send-email`) usa:

```sql
SELECT user_id, profiles!inner(id, phone, full_name)
FROM user_roles
WHERE is_approved = true
```

O `profiles!inner` faz INNER JOIN - exclui registros onde `user_id IS NULL`.

---

## Solução Proposta

Modificar as 3 Edge Functions para buscar membros de AMBAS as fontes:
1. `profiles` (usuários autenticados)
2. `condo_members` (cadastrados manualmente)

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/send-whatsapp/index.ts` | Incluir `condo_members` na query |
| `supabase/functions/send-sms/index.ts` | Incluir `condo_members` na query |
| `supabase/functions/send-email/index.ts` | Incluir `condo_members` na query |

---

## Nova Query Proposta

```typescript
// Buscar membros de AMBAS as fontes
const { data: rolesData, error } = await supabase
  .from('user_roles')
  .select(`
    id, user_id, member_id, is_approved,
    profiles:user_id (id, phone, full_name, email),
    condo_members:member_id (id, phone, full_name, email)
  `)
  .eq('condominium_id', condominium.id)
  .eq('is_approved', true);

// Processar resultados unificando as duas fontes
const members = rolesData
  .map(role => {
    const profile = role.profiles;
    const condoMember = role.condo_members;
    
    // Prioriza profile se existir, senão usa condo_member
    const source = profile || condoMember;
    if (!source) return null;
    
    return {
      phone: source.phone,
      email: source.email,
      full_name: source.full_name
    };
  })
  .filter(m => m !== null && m.phone); // para WhatsApp/SMS
  // .filter(m => m !== null && m.email); // para Email
```

---

## Diagrama do Fluxo Corrigido

```text
┌─────────────────────────────────────────────────────────────────┐
│                       user_roles                                 │
│  ┌──────────────┐              ┌──────────────┐                 │
│  │ user_id ──────────────────▶ │   profiles   │ (autenticados)  │
│  └──────────────┘              └──────────────┘                 │
│  ┌──────────────┐              ┌──────────────┐                 │
│  │ member_id ───────────────▶  │condo_members │ (manuais)       │
│  └──────────────┘              └──────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │   Edge Function de Notificação   │
            │                                  │
            │  Unifica phone/email de ambas    │
            │  as fontes e envia notificação   │
            └─────────────────────────────────┘
```

---

## Modificações Específicas

### send-whatsapp/index.ts

1. Alterar interface `MemberRow` para suportar ambas fontes
2. Modificar query para usar LEFT JOIN em ambas tabelas
3. Filtrar membros com telefone de qualquer fonte

### send-sms/index.ts

1. Mesma lógica do WhatsApp
2. Filtrar por `phone` não nulo

### send-email/index.ts

1. Mesma lógica
2. Filtrar por `email` não nulo

---

## Resultado Esperado

Após a correção:

| Membro | Tipo | Telefone | Receberá Notificação? |
|--------|------|----------|----------------------|
| Francisco de Souza (novo) | `condo_member` | 15 98182-3092 | Sim |
| Rafael | `profile` | 15981888214 | Sim |
| Francisco de Souza (auth) | `profile` | 15981788214 | Sim |

---

## Detalhes Técnicos

A mudança principal é substituir o INNER JOIN (`profiles!inner`) por dois LEFT JOINs e unificar os resultados no código:

```typescript
// Antes (exclui condo_members)
.select('user_id, profiles!inner(id, phone, full_name)')

// Depois (inclui ambos)
.select(`
  user_id, member_id,
  profiles:user_id (id, phone, full_name),
  condo_members:member_id (id, phone, full_name)
`)
```

Depois processamos para extrair os dados de contato de qualquer uma das fontes disponíveis.
