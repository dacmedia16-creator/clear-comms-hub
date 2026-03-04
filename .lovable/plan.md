

## Expandir listas de membros para seleção individual com lotes

O usuário quer poder "entrar" em cada lista de membros e selecionar contatos individuais dentro dela, com suporte a lotes de 50 — igual ao componente de "Membros específicos".

### Alterações

#### 1. `src/components/MemberListSearchSelect.tsx`
- Adicionar um botão/ícone de expansão ao lado de cada lista selecionada
- Ao expandir uma lista, carregar os membros vinculados a ela (`user_roles` filtrado por `list_id`)
- Exibir os membros da lista expandida com checkboxes individuais, busca e navegação por lotes de 50 (reutilizando a mesma lógica do `MemberSearchSelect`)
- Permitir selecionar/deselecionar membros individuais dentro de cada lista

#### 2. `src/pages/AdminCondominiumPage.tsx`
- Ajustar o estado para suportar tanto listas inteiras quanto membros individuais dentro de listas
- Adicionar `selectedListMemberIds: string[]` para armazenar IDs de membros selecionados individualmente dentro de listas
- Na lógica de envio, combinar: membros de listas inteiras selecionadas + membros individuais selecionados dentro de listas expandidas, deduplicando os IDs

#### Layout esperado
```text
[Badge: Corretores Sorocaba ×]   (1 lista selecionada)
🔍 Buscar lista...
┌──────────────────────────────────────────────────┐
│ ☑ Selecionar todas (2)                          │
│ ☑ Corretores Sorocaba              ▼ expandir   │
│   ┌────────────────────────────────────────────┐ │
│   │ ☑ Selecionar todos (85)                    │ │
│   │ ☑ Selecionar lote (1-50)  ◀ 1/2 ▶         │ │
│   │ ☑ João Silva        11999...               │ │
│   │ ☐ Pedro Santos      11988...               │ │
│   └────────────────────────────────────────────┘ │
│ ☐ Imobiliarias de Sorocaba         ▶ expandir   │
└──────────────────────────────────────────────────┘
```

Quando uma lista inteira está marcada, todos os seus membros são incluídos automaticamente. A expansão permite refinar a seleção, desmarcando membros específicos dentro de uma lista.

