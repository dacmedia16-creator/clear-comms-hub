
# Adicionar Botão "Moradores" no Card do Dashboard

## Objetivo
Adicionar um botão "Moradores" diretamente no card do condomínio no Dashboard, ao lado dos botões "Config" e "Ver timeline", para facilitar o acesso dos síndicos à lista de moradores.

## Alteração Necessária

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/pages/DashboardPage.tsx` | Modificar | Adicionar ícone `Users` e botão "Moradores" |

## Detalhes da Implementação

### 1. Adicionar importação do ícone Users
O ícone `Users` do lucide-react será adicionado às importações existentes.

### 2. Adicionar botão "Moradores" na linha de botões
O botão será adicionado na mesma linha do "Config" e "Ver timeline", visível apenas para usuários com permissão de acesso às configurações (owner, admin, syndic).

### Layout Proposto

```text
┌─────────────────────────────────────┐
│  [ícone]                     Free   │
│  Vitrine Esplanada                  │
│  [Síndico]                          │
│                                     │
│  [====== Gerenciar avisos ======]   │
│                                     │
│  [Config] [Moradores] [Ver timeline]│
└─────────────────────────────────────┘
```

### Código a Modificar

**Linha 330-346** - Adicionar botão "Moradores" entre "Config" e "Ver timeline":

```tsx
{canAccessSettings(condo.userRole) && (
  <div className="flex gap-2">
    <Button asChild variant="outline" className="flex-1">
      <Link to={`/admin/${condo.id}/settings`}>
        <Settings className="w-4 h-4 mr-1" />
        Config
      </Link>
    </Button>
    <Button asChild variant="outline" className="flex-1">
      <Link to={`/admin/${condo.id}/members`}>
        <Users className="w-4 h-4 mr-1" />
        Moradores
      </Link>
    </Button>
    <Button asChild variant="outline" className="flex-1">
      <Link to={`/c/${condo.slug}`} target="_blank">
        <ExternalLink className="w-4 h-4 mr-1" />
        Ver timeline
      </Link>
    </Button>
  </div>
)}
```

## Permissões
O botão "Moradores" será visível apenas para:
- **Proprietários** (owner)
- **Administradores** (admin)  
- **Síndicos** (syndic)

Colaboradores e moradores não verão este botão.

## Resultado Esperado
Síndicos poderão acessar a lista de moradores diretamente do Dashboard sem precisar entrar na página de gerenciamento de avisos primeiro.
