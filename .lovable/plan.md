

# Alterar Papel de Usuário por Condomínio

## Resumo

Permitir que o Super Admin altere o papel (role) de um usuário em um condomínio específico diretamente na tela de Usuários. O usuário poderá clicar no badge do papel e alterá-lo para outro tipo (Síndico, Morador, Administrador ou Colaborador).

---

## Abordagem

Vamos adicionar um dialog que mostra todos os papéis do usuário em diferentes condomínios, permitindo:
1. Alterar o papel em cada condomínio
2. Remover a associação do usuário de um condomínio específico
3. Adicionar o usuário a um novo condomínio com um papel

---

## Alterações Necessárias

### 1. Migração de Banco de Dados

Adicionar política RLS para permitir que Super Admins atualizem `user_roles`:

```sql
CREATE POLICY "Super admins can update user roles"
ON public.user_roles
FOR UPDATE
USING (is_super_admin())
WITH CHECK (is_super_admin());
```

### 2. Novo Componente: `ManageUserRolesDialog.tsx`

Um dialog que:
- Lista todos os papéis do usuário em cada condomínio
- Permite alterar o papel via select
- Permite remover a associação
- Permite adicionar nova associação (opcional)

### 3. Atualizar `UserRoleBadges.tsx`

Tornar os badges clicáveis (ou adicionar ícone de edição) para abrir o dialog de gerenciamento de papéis.

### 4. Atualizar `SuperAdminUsers.tsx`

- Integrar o novo dialog de gerenciamento de papéis
- Adicionar estado para controlar qual usuário está sendo editado

---

## Interface Visual

### Dialog de Gerenciar Papéis

```text
┌──────────────────────────────────────────────────────────┐
│  Gerenciar Papéis de "João da Silva"                     │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Condomínio          Papel               Ação        │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │ Vitrine Esplanada   [Síndico     ▼]    🗑️           │ │
│  │ Residencial Sol     [Morador     ▼]    🗑️           │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  [+ Adicionar a outro condomínio]                        │
│                                                          │
│                              [Cancelar]  [Salvar]        │
└──────────────────────────────────────────────────────────┘
```

---

## Fluxo de Funcionamento

1. Super Admin clica no ícone de edição de papéis (novo botão) na linha do usuário
2. Dialog abre mostrando todos os papéis atuais do usuário
3. Super Admin pode:
   - Alterar o papel via dropdown (Síndico, Morador, Admin, Colaborador)
   - Remover a associação clicando no ícone de lixeira
   - Adicionar nova associação selecionando condomínio e papel
4. Ao clicar em "Salvar", as alterações são aplicadas
5. Lista de usuários é atualizada

---

## Detalhes Técnicos

### Arquivos a Criar

**`src/components/super-admin/ManageUserRolesDialog.tsx`**
- Props: user, roles, open, onOpenChange, onSuccess
- Estado: lista editável de roles com mudanças pendentes
- Funções: updateRole, removeRole, addRole, saveChanges

### Arquivos a Modificar

**`src/pages/super-admin/SuperAdminUsers.tsx`**
- Adicionar estado `managingRolesUser`
- Adicionar botão de gerenciar papéis (ícone Users ou Settings)
- Integrar o ManageUserRolesDialog

**`src/hooks/useAllUsers.ts`**
- Adicionar `role_id` na interface UserRole para poder atualizar/deletar

### Migração SQL

```sql
-- Permitir que super admins atualizem user_roles
CREATE POLICY "Super admins can update user roles"
ON public.user_roles
FOR UPDATE
USING (is_super_admin())
WITH CHECK (is_super_admin());
```

### Estrutura de Dados Atualizada

```typescript
interface UserRole {
  id: string;  // Novo: ID do registro em user_roles
  role: "admin" | "syndic" | "resident" | "collaborator";
  condominium_name: string;
  condominium_id: string;
}
```

---

## Considerações de Segurança

- Apenas Super Admins podem alterar papéis
- Validação no banco via RLS
- Não é possível alterar o próprio papel (proteção na UI)

