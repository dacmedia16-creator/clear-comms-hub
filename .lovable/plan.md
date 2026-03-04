

## Adicionar lista de seleção com checkboxes ao "Membros específicos"

Atualmente, o componente `MemberSearchSelect` funciona apenas como autocomplete (busca + clique). O objetivo é transformá-lo para exibir a lista completa de membros com checkboxes, mantendo o campo de busca como filtro.

### Alterações

#### `src/components/MemberSearchSelect.tsx`
- Remover o comportamento de dropdown que aparece/desaparece — a lista fica sempre visível
- Substituir os botões de seleção por `Checkbox` do Radix para cada membro
- Manter o campo de busca no topo como filtro da lista
- Exibir todos os membros com checkbox (marcado = selecionado), filtrados pela busca
- Adicionar um "Selecionar todos" no topo da lista (seleciona/deseleciona todos os filtrados)
- Manter os badges dos selecionados acima do campo de busca para fácil remoção
- Limitar a altura da lista com scroll (`max-h-60 overflow-y-auto`)

Layout final:
```text
[Badge: João ×] [Badge: Maria ×]
🔍 Buscar por nome ou telefone...
┌──────────────────────────────────┐
│ ☑ Selecionar todos (3)          │
│ ☑ João Silva       11999...     │
│ ☐ Pedro Santos     11988...     │
│ ☑ Maria Lima       11977...     │
└──────────────────────────────────┘
```

Nenhuma outra alteração necessária — o componente já é usado em `AdminCondominiumPage.tsx` com a mesma interface (`selectedIds` / `onSelectionChange`).

