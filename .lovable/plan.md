
# Corrigir Permissões de Visualização para Moradores

## Problema Identificado

O morador (Francisco) está vendo os mesmos botões que um síndico/admin no dashboard:
- "Gerenciar avisos" (não deveria ver)
- "Config" (não deveria ver)
- "Ver timeline" (deveria ver)

A informação do papel (`userRole`) já existe no hook `useProfile`, mas o `DashboardPage` não está usando essa informação para filtrar os botões.

---

## Hierarquia de Permissões

| Papel | Gerenciar Avisos | Configurações | Ver Timeline |
|-------|------------------|---------------|--------------|
| owner | Sim | Sim | Sim |
| admin | Sim | Sim | Sim |
| syndic | Sim | Sim | Sim |
| collaborator | Sim | Nao | Sim |
| resident | Nao | Nao | Sim |

---

## Solucao

Modificar o `DashboardPage` para verificar o `userRole` de cada condomínio e renderizar botões diferentes:

### Para Moradores (resident):
- Apenas botão "Ver timeline"
- Texto de boas-vindas: "Veja os avisos do seu condomínio"

### Para Colaboradores (collaborator):
- Botão "Criar avisos" (não gerenciar)
- Botão "Ver timeline"

### Para Síndicos/Admins/Owners:
- Botão "Gerenciar avisos"
- Botão "Config"
- Botão "Ver timeline"

---

## Arquivos a Modificar

### 1. `src/pages/DashboardPage.tsx`

**Mudanças:**
- Criar funções helper para verificar permissões:
  - `canManageAnnouncements(role)` - owner, admin, syndic, collaborator
  - `canAccessSettings(role)` - owner, admin, syndic
  
- Modificar o card de condomínio para renderizar botões condicionalmente baseado no `condo.userRole`

- Ajustar texto de boas-vindas baseado no papel (evitar "Síndico" para moradores)

### Código exemplo da lógica:

```typescript
// Helper functions
const canManageAnnouncements = (role?: string) => 
  ['owner', 'admin', 'syndic', 'collaborator'].includes(role || '');

const canAccessSettings = (role?: string) => 
  ['owner', 'admin', 'syndic'].includes(role || '');

// No card de cada condomínio:
{canManageAnnouncements(condo.userRole) ? (
  <Button asChild>
    <Link to={`/admin/${condo.id}`}>Gerenciar avisos</Link>
  </Button>
) : null}

{canAccessSettings(condo.userRole) && (
  <Button asChild variant="outline">
    <Link to={`/admin/${condo.id}/settings`}>Config</Link>
  </Button>
)}

{/* Ver timeline sempre visível */}
<Button asChild variant="outline">
  <Link to={`/c/${condo.slug}`}>Ver timeline</Link>
</Button>
```

---

## Resultado Esperado

### Morador (Francisco):

```text
┌─────────────────────────────────────┐
│  Vitrine Esplanada          Free    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │     Ver avisos              │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Síndico/Admin:

```text
┌─────────────────────────────────────┐
│  Vitrine Esplanada          Free    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │     Gerenciar avisos        │    │
│  └─────────────────────────────┘    │
│  ┌────────────┐ ┌──────────────┐    │
│  │   Config   │ │ Ver timeline │    │
│  └────────────┘ └──────────────┘    │
└─────────────────────────────────────┘
```

---

## Benefícios

1. **Segurança**: Moradores não veem botões de funcionalidades que não podem acessar
2. **UX**: Interface limpa e apropriada para cada tipo de usuário
3. **Escalável**: Fácil adicionar novos papéis no futuro

---

## Considerações Técnicas

- A segurança real (RLS) já está implementada no banco - esta mudança é apenas visual
- Mesmo que um morador tentasse acessar `/admin/{id}`, o backend bloquearia as operações
- Esta mudança melhora a experiência do usuário mostrando apenas o que ele pode fazer
