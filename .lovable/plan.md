

## Transformar seleção de "Lista de membros" em checkboxes com multi-seleção

Atualmente, o campo "Lista de membros" usa um dropdown `Select` que permite escolher apenas **uma** lista. O objetivo é transformá-lo em uma lista com checkboxes (igual ao que foi feito em "Membros específicos"), permitindo selecionar **múltiplas listas** de uma vez.

### Alterações

#### 1. `src/pages/AdminCondominiumPage.tsx`
- Trocar `selectedListId: string | null` para `selectedListIds: string[]`
- Substituir o `<Select>` por uma lista de checkboxes com as listas disponíveis, com busca e badges dos selecionados
- Atualizar a lógica de envio: ao invés de buscar membros de uma única lista, buscar membros de todas as listas selecionadas (`.in("list_id", selectedListIds)`) e deduplicar os IDs
- Atualizar resets e condições que usavam `selectedListId`

#### 2. Criar `src/components/MemberListSearchSelect.tsx`
- Componente similar ao `MemberSearchSelect`, mas para listas (não membros individuais)
- Props: `lists: MemberList[]`, `selectedIds: string[]`, `onSelectionChange: (ids: string[]) => void`
- Exibe checkboxes para cada lista, campo de busca por nome, badges dos selecionados
- Como listas são tipicamente poucas (dezenas), não precisa de paginação por lotes — mas inclui o "Selecionar todos" e busca

Layout:
```text
[Badge: Lista A ×] [Badge: Lista B ×]   (2 selecionadas)
🔍 Buscar lista...
┌──────────────────────────────────────┐
│ ☑ Selecionar todas (5)              │
│ ☑ Lista A                           │
│ ☐ Lista B                           │
│ ☑ Lista C                           │
└──────────────────────────────────────┘
```

