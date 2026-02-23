

## Selecionar Todos os Membros

Adicionar um checkbox "Selecionar todos" na tabela de membros, com checkboxes individuais em cada linha, permitindo selecao em massa para acoes futuras (remover, mover entre listas, etc).

### Alteracoes

**`src/pages/CondoMembersPage.tsx`**

1. Novo state: `selectedMemberIds` (Set de strings)
2. Adicionar coluna de checkbox no header da tabela com logica de "selecionar todos" (toggle entre selecionar todos os filtrados da pagina atual e desmarcar todos)
3. Adicionar checkbox em cada linha da tabela
4. Barra de acoes em massa que aparece quando ha membros selecionados, com:
   - Contagem de selecionados (ex: "5 selecionados")
   - Botao "Remover selecionados" (com confirmacao)
   - Limpar selecao ao mudar de pagina, lista ou busca
5. No mobile (cards), adicionar checkbox tambem em cada card

### Detalhes tecnicos

- O checkbox "Selecionar todos" no header seleciona/desmarca apenas os membros da pagina atual (`paginatedMembers`)
- Estado intermediario (indeterminate) quando apenas alguns da pagina estao selecionados
- Ao remover membros em massa, chamar `removeMember` para cada selecionado e depois limpar selecao
- Resetar selecao ao mudar pagina, filtro de busca ou lista selecionada
- Usar o componente `Checkbox` do Radix UI ja existente no projeto

### Arquivo modificado

- `src/pages/CondoMembersPage.tsx`

