
# Plano: Adicionar Card de Segmentos no Dashboard

## Objetivo

Adicionar um card "Segmentos de Organização" no `DashboardPage` (página `/dashboard`) que será visível apenas para Super Admins. O card seguirá o design da imagem de referência com:
- Fundo laranja claro/accent
- Ícone de grid (Grid3X3)
- Badges com estatísticas (6 categorias, X organizações)
- Botão laranja "Ver Segmentos"

---

## Design do Card

```text
┌─────────────────────────────────────────────────────────┐
│  ┌──────────┐                                           │
│  │   ⊞⊞     │  (ícone grid em fundo accent)            │
│  │   ⊞⊞     │                                           │
│  └──────────┘                                           │
│                                                         │
│  Segmentos de Organização                               │
│  Visualize e crie organizações por categoria:           │
│  Condomínios, Clínicas, Empresas, etc.                 │
│                                                         │
│  ┌────────────┐  ┌────────────────┐                    │
│  │ 6 categorias│  │ X organizações │                    │
│  └────────────┘  └────────────────┘                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │        ⊞⊞  Ver Segmentos                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Arquivo a Modificar

### src/pages/DashboardPage.tsx

**Alterações:**
1. Importar `Grid3X3` do lucide-react
2. Importar `useAllCondominiums` para obter a contagem total de organizações
3. Adicionar o card de Segmentos antes do grid de condomínios (visível apenas para `isSuperAdmin`)
4. Estilizar com cores accent/primary para combinar com o design da imagem

---

## Detalhes Técnicos

### Dados Necessários

```typescript
// Já disponível via useSuperAdmin
const { isSuperAdmin } = useSuperAdmin();

// Novo: para obter contagem total de organizações
const { condominiums: allCondominiums } = useAllCondominiums();
const totalOrganizations = allCondominiums.length;
```

### Estrutura do Card

```tsx
{isSuperAdmin && (
  <Card className="mb-8 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
    <CardContent className="p-6">
      <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
        <Grid3X3 className="w-6 h-6 text-primary" />
      </div>
      
      <h3 className="font-display text-xl font-bold mb-1">
        Segmentos de Organização
      </h3>
      <p className="text-muted-foreground mb-4">
        Visualize e crie organizações por categoria: Condomínios, Clínicas, Empresas, etc.
      </p>
      
      <div className="flex gap-2 mb-4">
        <Badge variant="secondary" className="bg-muted">6 categorias</Badge>
        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
          {totalOrganizations} organizações
        </Badge>
      </div>
      
      <Button asChild className="w-full">
        <Link to="/super-admin/segments">
          <Grid3X3 className="w-4 h-4 mr-2" />
          Ver Segmentos
        </Link>
      </Button>
    </CardContent>
  </Card>
)}
```

---

## Posicionamento

O card será exibido:
- **Após** o título de boas-vindas
- **Antes** do grid de condomínios
- **Apenas** quando `isSuperAdmin === true`

---

## Resumo de Alterações

| Arquivo | Ação |
|---------|------|
| `src/pages/DashboardPage.tsx` | Adicionar card de Segmentos para Super Admin |

---

## Imports Adicionais

```typescript
import { Grid3X3 } from "lucide-react";
import { useAllCondominiums } from "@/hooks/useAllCondominiums";
```
