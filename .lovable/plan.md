

# Plano: Botao de Atualizar Sistema

## Resumo

Criar um botao de "Atualizar Sistema" que aparece em todas as paginas logadas, limpa o cache do React Query e recarrega todos os dados.

---

## Estrategia

Criar um componente reutilizavel `RefreshButton` que:
1. Invalida todas as queries do React Query (limpa cache)
2. Executa um reload da pagina para garantir dados frescos
3. Aparece no header de todas as paginas logadas

---

## Paginas que Receberao o Botao

| Pagina | Arquivo | Local |
|--------|---------|-------|
| Dashboard Usuario | `src/pages/DashboardPage.tsx` | Header, ao lado do botao de logout |
| Admin Condominio | `src/pages/AdminCondominiumPage.tsx` | Header, ao lado do botao "Ver timeline" |
| Super Admin Dashboard | `src/pages/super-admin/SuperAdminDashboard.tsx` | Header, ao lado do botao "Sair" |
| Super Admin Condominios | `src/pages/super-admin/SuperAdminCondominiums.tsx` | Header |
| Super Admin Usuarios | `src/pages/super-admin/SuperAdminUsers.tsx` | Header |
| Super Admin Timelines | `src/pages/super-admin/SuperAdminTimelines.tsx` | Header |
| Super Admin Membros | `src/pages/super-admin/SuperAdminCondoMembers.tsx` | Header |

---

## Arquivos a Criar

### 1. src/components/RefreshButton.tsx

Componente reutilizavel com:
- Icone `RefreshCcw` do Lucide
- Animacao de rotacao durante o refresh
- Limpa cache do React Query
- Recarrega a pagina

```typescript
interface RefreshButtonProps {
  variant?: "ghost" | "outline";
  size?: "default" | "sm" | "icon";
}
```

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/DashboardPage.tsx` | Adicionar RefreshButton no header |
| `src/pages/AdminCondominiumPage.tsx` | Adicionar RefreshButton no header |
| `src/pages/super-admin/SuperAdminDashboard.tsx` | Adicionar RefreshButton no header |
| `src/pages/super-admin/SuperAdminCondominiums.tsx` | Adicionar RefreshButton no header |
| `src/pages/super-admin/SuperAdminUsers.tsx` | Adicionar RefreshButton no header |
| `src/pages/super-admin/SuperAdminTimelines.tsx` | Adicionar RefreshButton no header |
| `src/pages/super-admin/SuperAdminCondoMembers.tsx` | Adicionar RefreshButton no header |

---

## Secao Tecnica

### Componente RefreshButton

```typescript
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export function RefreshButton({ 
  variant = "ghost", 
  size = "icon" 
}: RefreshButtonProps) {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Limpar todo o cache do React Query
    await queryClient.invalidateQueries();
    queryClient.clear();
    
    toast({
      title: "Atualizando...",
      description: "Recarregando dados do sistema",
    });
    
    // Recarregar a pagina apos breve delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleRefresh}
      disabled={refreshing}
      title="Atualizar sistema"
    >
      <RefreshCcw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
    </Button>
  );
}
```

### Exemplo de Uso no Header

```tsx
<div className="flex items-center gap-2">
  <RefreshButton />
  <Button variant="ghost" size="icon" onClick={handleSignOut}>
    <LogOut className="w-5 h-5" />
  </Button>
</div>
```

---

## Comportamento do Botao

1. **Clique**: Usuario clica no botao de refresh
2. **Animacao**: Icone comeca a girar
3. **Cache**: React Query invalida todas as queries e limpa o cache
4. **Toast**: Exibe mensagem "Atualizando..."
5. **Reload**: Apos 500ms, recarrega a pagina com `window.location.reload()`

---

## Resultado Final

Apos implementacao:
- Todas as 7 paginas logadas terao o botao de atualizar
- Botao aparece no header com icone de refresh
- Ao clicar, limpa cache e recarrega a pagina
- Animacao visual durante o processo
- Toast confirmando a acao

