

## Adicionar seleção por lotes de 50 ao MemberSearchSelect

### Alterações

#### `src/components/MemberSearchSelect.tsx`
- Substituir o "Selecionar todos" por botões de lote que selecionam 50 membros por vez
- Adicionar estado de "página de lote" (`batchPage`) para controlar qual grupo de 50 está visível
- Exibir botões "Selecionar lote 1-50", "Selecionar lote 51-100", etc. no topo da lista
- Adicionar navegação entre lotes (anterior/próximo) quando há mais de 50 membros filtrados
- Manter o "Selecionar todos" como opção separada para selecionar todos os filtrados de uma vez
- A lista exibe apenas os 50 membros do lote atual, com botão para navegar entre lotes

Layout:
```text
[Badge: João ×] [Badge: Maria ×]   (3 selecionados)
🔍 Buscar por nome ou telefone...
┌──────────────────────────────────────────────────┐
│ ☑ Selecionar todos (150)                        │
│ ☑ Selecionar lote (1-50)    ◀ Lote 1/3 ▶       │
│─────────────────────────────────────────────────│
│ ☑ João Silva          11999...                  │
│ ☐ Pedro Santos        11988...                  │
│ ...                                             │
└──────────────────────────────────────────────────┘
```

Nenhuma alteração em outros arquivos — a interface do componente permanece a mesma.

