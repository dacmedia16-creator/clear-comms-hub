

## Seletor de Membros Individuais para Segmentos sem Localização

### Problema Atual
Organizações do tipo Genérico (e outros segmentos sem localização como Clínicas, Empresas, Igrejas, Escolas e Comunidades) não possuem opção de segmentação. O aviso é sempre enviado para todos os membros, sem possibilidade de escolher destinatários específicos.

### Solução
Adicionar uma nova opção de destinatários para essas organizações: **"Membros específicos"**, onde o gestor pode buscar e selecionar membros individuais digitando nome ou telefone, com um campo de busca autocomplete.

### Como vai funcionar

1. Na seção de destinatários (onde hoje aparece apenas "Este aviso sera enviado para todos os membros"), exibir um RadioGroup com duas opcoes:
   - **Todos os membros** (padrao)
   - **Membros especificos** (novo)

2. Ao selecionar "Membros especificos", exibir um campo de busca que:
   - Filtra membros do condominio atual por nome ou telefone enquanto digita
   - Mostra resultados em um dropdown
   - Permite selecionar multiplos membros
   - Exibe os selecionados como badges removiveis

3. Os IDs dos membros selecionados sao enviados para as Edge Functions como um novo campo `target_member_ids`.

4. As Edge Functions (WhatsApp, SMS, Email) filtram os membros usando esses IDs quando presentes.

---

### Detalhes Tecnicos

**1. Novo componente: `src/components/MemberSearchSelect.tsx`**
- Recebe `condominiumId` como prop
- Busca membros via query em `user_roles` + `condo_members`/`profiles`
- Campo de input com filtragem local por nome ou telefone
- Lista dropdown com resultados filtrados
- Badges dos membros selecionados com botao de remover
- Retorna array de `{ id: string, name: string, phone: string }` selecionados

**2. Alteracao em `src/pages/AdminCondominiumPage.tsx`**
- Para organizacoes sem `showLocationTargeting`, substituir o texto fixo "enviado para todos os membros" por um RadioGroup com:
  - `all` - Todos os membros
  - `specific` - Membros especificos (abre o MemberSearchSelect)
- Novo state: `selectedMemberIds: string[]`
- Passar `target_member_ids` no payload do aviso e das notificacoes

**3. Alteracao nas interfaces dos hooks (`useSendWhatsApp`, `useSendSMS`, `useSendEmail`)**
- Adicionar campo opcional `target_member_ids?: string[]` nas interfaces de Announcement

**4. Alteracao nas 3 Edge Functions (`send-whatsapp`, `send-sms`, `send-email`)**
- Receber `target_member_ids` no body
- Quando presente, filtrar membros pelo `member_id` ou `user_id` correspondente, em vez de enviar para todos
- Aplicar apos a busca de membros e antes dos filtros de opt-out

**5. Tabela `announcements`**
- Adicionar coluna `target_member_ids text[]` (nullable) via migracao SQL para persistir a segmentacao

