
# Plano: Filtrar Organizações por Tipo de Segmento

## Problema Identificado

O botão "Ver" de cada segmento navega corretamente para `/super-admin/condominiums?type=<tipo>`, porém a página `SuperAdminCondominiums` não está lendo o parâmetro `type` da URL para filtrar as organizações. Resultado: todas as organizações são exibidas independente do segmento clicado.

---

## Solução

Modificar `SuperAdminCondominiums.tsx` para:
1. Ler o parâmetro `type` da URL usando `useSearchParams`
2. Filtrar as organizações pelo `organization_type` quando o parâmetro estiver presente
3. Exibir um indicador visual mostrando qual segmento está filtrado
4. Adicionar um botão para limpar o filtro e ver todas as organizações

---

## Fluxo Esperado

```text
Página de Segmentos          Página de Condominiums (Filtrada)
┌──────────────────┐         ┌───────────────────────────────────┐
│ [Igrejas]        │ ──────► │  ⛪ Igrejas                       │
│ 0 organizações   │  clique │  Mostrando 0 de 1 organizações   │
│ [Ver] [+Criar]   │  em Ver │  [✕ Limpar filtro]               │
└──────────────────┘         │                                   │
                             │  (lista vazia ou orgs do tipo)   │
                             └───────────────────────────────────┘
```

---

## Arquivo a Modificar

### src/pages/super-admin/SuperAdminCondominiums.tsx

**Alterações:**

1. **Importar** `useSearchParams` do `react-router-dom`

2. **Ler parâmetro da URL:**
```typescript
const [searchParams, setSearchParams] = useSearchParams();
const typeFilter = searchParams.get("type") as OrganizationType | null;
```

3. **Atualizar filtro** para incluir organization_type:
```typescript
const filteredCondos = condominiums.filter(condo => {
  // Filtro por tipo de organização (do parâmetro URL)
  if (typeFilter && (condo.organization_type || "condominium") !== typeFilter) {
    return false;
  }
  // Filtro por texto de busca
  return (
    condo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    condo.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    condo.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );
});
```

4. **Adicionar indicador visual** do filtro ativo:
```typescript
{typeFilter && (
  <div className="flex items-center gap-2 mb-4 p-3 bg-accent rounded-lg">
    <Icon className="w-5 h-5 text-primary" />
    <span className="font-medium">{ORGANIZATION_TYPES[typeFilter].label}</span>
    <Badge variant="secondary">
      {filteredCondos.length} de {condominiums.length}
    </Badge>
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => setSearchParams({})}
    >
      <X className="w-4 h-4 mr-1" />
      Limpar filtro
    </Button>
  </div>
)}
```

5. **Atualizar título do header** para mostrar o tipo filtrado:
```typescript
<span className="font-display text-xl font-bold text-foreground">
  {typeFilter ? ORGANIZATION_TYPES[typeFilter].terms.organizationPlural : "Organizações"}
</span>
```

---

## Imports Adicionais

```typescript
import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { ORGANIZATION_TYPES, ORGANIZATION_TYPE_OPTIONS, getOrganizationIcon, type OrganizationType } from "@/lib/organization-types";
import { Badge } from "@/components/ui/badge";
```

---

## Detalhes Técnicos

### Filtro Combinado

A lógica de filtro combina:
1. **Tipo de organização** (parâmetro `?type=` da URL)
2. **Busca por texto** (campo de busca existente)

### Fallback para Tipo

Organizações sem `organization_type` definido são tratadas como `"condominium"` (valor padrão):
```typescript
(condo.organization_type || "condominium") !== typeFilter
```

### Limpeza do Filtro

O botão "Limpar filtro" remove o parâmetro da URL:
```typescript
setSearchParams({}) // Remove todos os parâmetros
```

---

## Resultado Esperado

| Ação | Resultado |
|------|-----------|
| Clicar "Ver" em Igrejas | URL muda para `/super-admin/condominiums?type=church` |
| Página de Condominiums | Mostra badge "Igrejas" + apenas orgs desse tipo |
| Clicar "Limpar filtro" | Remove filtro, mostra todas as organizações |
| Buscar texto | Funciona em conjunto com o filtro de tipo |

---

## Resumo de Alterações

| Arquivo | Ação |
|---------|------|
| `src/pages/super-admin/SuperAdminCondominiums.tsx` | Ler `?type=` da URL e filtrar lista |
