

## Auditoria: Queries sem paginação que podem exceder 1000 registros

Analisei todas as queries do projeto. Abaixo está a classificação completa.

---

### Queries JA CORRIGIDAS (com paginação ou RPC)

| Arquivo | Tabela | Correção |
|---------|--------|----------|
| `useCondoMembers.ts` | `user_roles` | RPC `get_condominium_user_roles` + batch fetch |
| `useCondoMembers.ts` | `condo_members`, `profiles` | Batch `.in()` com lotes de 1000 |
| `MemberSearchSelect.tsx` | `user_roles` | Loop paginado com `.range()` |
| `MemberListSearchSelect.tsx` | `user_roles` | Loop paginado com `.range()` |

---

### Queries que PRECISAM de correção (podem exceder 1000)

| # | Arquivo | Tabela | Risco | Severidade |
|---|---------|--------|-------|------------|
| 1 | `useAllUsers.ts:48` | `user_roles` | Busca TODOS os roles sem `.range()`. Com 4616+ membros em um condo + outros, facilmente >1000 | **Alta** |
| 2 | `useAllUsers.ts:35` | `profiles` | Busca TODOS os perfis sem `.range()`. Cresce com a base de usuários | **Media** |
| 3 | `useAllAnnouncements.ts:39` | `announcements` | Busca TODOS os avisos sem `.range()`. Cresce linearmente | **Media** |
| 4 | `AdminCondominiumPage.tsx:186` | `announcements` | Avisos de um condo sem limite. Improvável >1000 por condo no curto prazo | **Baixa** |
| 5 | `AdminCondominiumPage.tsx:241` | `user_roles` | Membros por list_id, sem `.range()`. Improvável >1000 por lista | **Baixa** |
| 6 | `TimelinePage.tsx:140` | `announcements` | Avisos de um condo (público). Mesmo cenário do item 4 | **Baixa** |

---

### Queries SEGURAS (sem risco de >1000)

- `useProfile.ts` — filtra por `user_id` (1 registro)
- `useAllCondominiums.ts` — quantidade de condos cresce lentamente
- `useMemberLists.ts` — listas por condo, quantidade baixa
- `CondominiumSettingsPage.tsx` — `.single()`
- `useOrganizationTerms.ts` — `.single()`
- `super_admins` — quantidade inerentemente pequena
- Queries de logs (whatsapp_logs, email_logs, sms_logs) — filtradas por condo, mas podem precisar de atenção futura

---

### Plano de correção (3 itens prioritários)

#### 1. `useAllUsers.ts` — `user_roles` (Alta prioridade)
Adicionar loop paginado com `.range()` na query de `user_roles` (linha 48):
```typescript
const allRoles: any[] = [];
let offset = 0;
const batchSize = 1000;
let hasMore = true;
while (hasMore) {
  const { data } = await supabase
    .from("user_roles")
    .select(`id, user_id, role, condominium_id, is_approved, condominiums (name)`)
    .range(offset, offset + batchSize - 1);
  allRoles.push(...(data || []));
  hasMore = (data?.length || 0) === batchSize;
  offset += batchSize;
}
```

#### 2. `useAllUsers.ts` — `profiles` (Media prioridade)
Mesmo padrão de loop paginado na query de `profiles` (linha 35).

#### 3. `useAllAnnouncements.ts` — `announcements` (Media prioridade)
Mesmo padrão de loop paginado na query de `announcements` (linha 39).

### Arquivos a alterar
- `src/hooks/useAllUsers.ts` — Paginar `profiles` e `user_roles`
- `src/hooks/useAllAnnouncements.ts` — Paginar `announcements`

