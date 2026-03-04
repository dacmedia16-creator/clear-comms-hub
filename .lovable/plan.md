

## Adicionar campo `phone_secondary` à tabela `condo_members`

### Resumo
Adicionar um segundo campo de telefone (`phone_secondary`) para membros manuais, permitindo armazenar um número alternativo. O sistema de notificações (WhatsApp, SMS) enviará para ambos os números.

### Alterações

#### 1. Migração de banco de dados
Adicionar coluna `phone_secondary text` (nullable) à tabela `condo_members`.

#### 2. `src/hooks/useCondoMembers.ts`
- Adicionar `phone_secondary` à interface `CondoMember.condo_member`
- Incluir `phone_secondary` na query select
- Incluir `phone_secondary` no `updateMember`
- Adicionar helper `getMemberPhoneSecondary()`

#### 3. `src/components/EditMemberDialog.tsx`
- Adicionar campo "Telefone Secundário" no formulário (apenas para `condo_members`, não para `profiles`)

#### 4. `src/components/super-admin/AddMemberDialog.tsx`
- Adicionar campo opcional "Telefone Secundário" no formulário de criação

#### 5. `src/components/ImportMembersDialog.tsx`
- Adicionar coluna "Telefone 2" (índice `[6]`) na planilha modelo e no parsing
- Exibir na tabela de preview

#### 6. Edge Functions — `create-member` e `create-members-batch`
- Aceitar `phoneSecondary` no body
- Inserir `phone_secondary` no `condo_members`

#### 7. Edge Functions — `send-whatsapp` e `send-sms`
- Incluir `phone_secondary` na query de membros
- Para cada membro com `phone_secondary`, gerar uma entrada adicional na lista de envio (mesmo nome, segundo número)
- A deduplicação por telefone existente já garante que não haverá envio duplicado se o secundário for igual a outro primário

#### 8. `src/pages/CondoMembersPage.tsx`
- Exibir `phone_secondary` na tabela/cards quando presente (ex: "Tel 2: ...")

#### 9. Deduplicação (`create-member` e `create-members-batch`)
- Verificar `phone_secondary` contra phones existentes (primários e secundários) para evitar duplicatas

