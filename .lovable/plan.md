

# Badge de Papel + Perfil de Usuário

## Visão Geral

Adicionar duas funcionalidades ao dashboard:
1. **Badge visual** mostrando o papel do usuário em cada card de condomínio
2. **Página de Perfil** para o usuário visualizar e editar seus dados

---

## 1. Badge de Papel no Card de Condomínio

### Mapeamento de Papéis para Labels

| Role | Label | Cor |
|------|-------|-----|
| owner | Proprietário | Verde |
| admin | Administrador | Verde |
| syndic | Síndico | Azul/Accent |
| collaborator | Colaborador | Amarelo |
| resident | Morador | Cinza |

### Localização no Card

O badge será adicionado logo abaixo do título do condomínio, antes da descrição:

```text
┌─────────────────────────────────────┐
│  🏢                          Free   │
│                                     │
│  Vitrine Esplanada                  │
│  🟢 Síndico                         │  ← Badge do papel
│  Descrição do condomínio...         │
│                                     │
│  [ Gerenciar avisos ]               │
│  [ Config ] [ Ver timeline ]        │
└─────────────────────────────────────┘
```

### Arquivo: `src/pages/DashboardPage.tsx`

- Adicionar mapeamento de `roleLabels` e `roleStyles`
- Inserir badge após o `CardTitle` com o papel do usuário
- Reutilizar estilos já existentes em `UserRoleBadges.tsx`

---

## 2. Página de Perfil do Usuário

### Nova Rota: `/profile`

### Funcionalidades:
- Visualizar dados do perfil (nome, email, telefone)
- Editar nome e telefone
- Upload de avatar (opcional, fase futura)
- Listar condomínios vinculados com seus papéis
- Botão para alterar senha (redireciona para reset)

### Arquivo: `src/pages/ProfilePage.tsx` (novo)

```text
┌─────────────────────────────────────────────────────────┐
│  AVISO PRO                            [←] Voltar        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────┐                                               │
│  │ 👤   │  João Silva                                   │
│  └──────┘  joao@email.com                               │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Informações Pessoais                      [ Editar ]   │
│                                                         │
│  Nome: João Silva                                       │
│  Email: joao@email.com                                  │
│  Telefone: (11) 99999-9999                              │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Meus Condomínios                                       │
│                                                         │
│  • Vitrine Esplanada     🟢 Síndico                     │
│  • Residencial Jardins   ⚪ Morador                     │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  [ Alterar senha ]                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Acesso à Página de Perfil

- Adicionar link no header do `DashboardPage`
- Clicar no nome do usuário ou em um ícone de usuário abre dropdown com "Meu Perfil"

---

## Arquivos a Criar/Modificar

### Novos Arquivos:
1. `src/pages/ProfilePage.tsx` - Página de perfil completa

### Arquivos Modificados:
1. `src/pages/DashboardPage.tsx`
   - Adicionar badge de papel em cada card
   - Adicionar dropdown no header com link para perfil
   
2. `src/App.tsx`
   - Adicionar rota `/profile` → `ProfilePage`

---

## Detalhes Técnicos

### Badge de Papel (DashboardPage)

```typescript
// Mapeamento de labels
const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  syndic: "Síndico",
  collaborator: "Colaborador",
  resident: "Morador",
};

// Estilos por papel
const roleStyles: Record<string, string> = {
  owner: "bg-green-100 text-green-700",
  admin: "bg-green-100 text-green-700",
  syndic: "bg-blue-100 text-blue-700",
  collaborator: "bg-yellow-100 text-yellow-700",
  resident: "bg-gray-100 text-gray-600",
};
```

### ProfilePage

- Usar `useProfile()` para obter dados do perfil e condomínios
- Formulário de edição com `useState` para modo de edição
- Atualizar perfil via `supabase.from("profiles").update()`
- Lista de condomínios com badges de papel

---

## Resumo das Mudanças

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/pages/DashboardPage.tsx` | Modificar | Badge de papel + dropdown de perfil no header |
| `src/pages/ProfilePage.tsx` | Criar | Página completa de perfil |
| `src/App.tsx` | Modificar | Adicionar rota `/profile` |

