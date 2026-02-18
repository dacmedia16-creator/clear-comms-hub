

## Implementacao: Seletor de Membros Especificos

### Resumo
Permitir que organizacoes sem segmentacao por localizacao (Generico, Clinicas, etc.) possam escolher enviar avisos para membros especificos, buscando por nome ou telefone.

### Etapas

**1. Migracao de banco de dados**
- Adicionar coluna `target_member_ids text[]` (nullable) na tabela `announcements`

**2. Novo componente: `MemberSearchSelect.tsx`**
- Campo de busca com filtragem por nome ou telefone
- Busca membros do condominio via `user_roles` + `condo_members`/`profiles`
- Dropdown com resultados filtrados
- Badges removiveis para membros selecionados
- Retorna array de IDs selecionados

**3. Alteracao em `AdminCondominiumPage.tsx`**
- Na secao de organizacoes sem `showLocationTargeting` (linhas 688-696), substituir o texto fixo por um RadioGroup:
  - "Todos os membros" (padrao)
  - "Membros especificos" (abre o MemberSearchSelect)
- Novo state `selectedMemberIds`
- Passar `target_member_ids` no insert do announcement e nos hooks de notificacao

**4. Hooks de notificacao**
- `useSendWhatsApp.ts`: adicionar `target_member_ids?: string[]` na interface e enviar no body
- `useSendSMS.ts`: idem
- `useSendEmail.ts`: idem

**5. Edge Functions (send-whatsapp, send-sms, send-email)**
- Receber `target_member_ids` no body da request
- Quando presente, filtrar `memberRows` pelo `member_id` ou `user_id` correspondente, antes dos filtros de bloco/unidade/opt-out

### Detalhes Tecnicos

- A filtragem nas Edge Functions sera feita comparando `role.member_id` e `role.user_id` contra `target_member_ids`
- O componente MemberSearchSelect usa filtragem local (client-side) apos carregar todos os membros do condominio
- A coluna `target_member_ids` armazena os IDs dos `user_roles` selecionados (que podem ser `member_id` ou `user_id`)

