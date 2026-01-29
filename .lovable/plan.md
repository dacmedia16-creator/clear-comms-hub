

# Melhorar Tela de Usuários do Super Admin

## Resumo

Atualizar a página de Usuários (`/super-admin/users`) para:
1. Mostrar os papéis de cada usuário (Morador, Síndico, Colaborador) com os condomínios associados
2. Adicionar opção de editar informações do usuário (nome, email, telefone)
3. Adicionar opção de excluir usuário da plataforma

---

## Estrutura Atual

A página mostra apenas:
- Nome e email
- Status: "Super Admin" ou "Usuário" (genérico)
- Data de criação
- Ações: Promover/Remover Super Admin

---

## O Que Será Implementado

### 1. Mostrar Papéis Reais do Usuário

Na coluna "Status", mostrar badges com os papéis do usuário:
- **Morador** (resident) - badge cinza
- **Síndico** (syndic) - badge azul/accent
- **Administrador** (admin) - badge verde
- **Colaborador** (collaborator) - badge amarelo
- **Super Admin** - badge vermelho (mantido)

Se o usuário tiver papéis em múltiplos condomínios, mostrar um resumo (ex: "Síndico em 2 condos").

### 2. Botão de Editar

- Adicionar ícone de edição (lápis) na coluna de ações
- Abrir um Dialog para editar:
  - Nome completo
  - Email
  - Telefone

### 3. Botão de Excluir

- Adicionar ícone de lixeira na coluna de ações
- Dialog de confirmação antes de excluir
- Remover o perfil e todas as associações (user_roles)

---

## Alterações Necessárias

### 1. Hook `useAllUsers.ts`
- Buscar também os `user_roles` de cada usuário junto com o nome do condomínio
- Estrutura atualizada:

```typescript
interface UserRole {
  role: "admin" | "syndic" | "resident" | "collaborator";
  condominium_name: string;
  condominium_id: string;
}

interface Profile {
  // ...existentes
  roles?: UserRole[];
}
```

### 2. Componente `SuperAdminUsers.tsx`

- Atualizar coluna Status para mostrar os papéis reais
- Adicionar botões de Editar e Excluir
- Criar Dialogs para:
  - Edição de usuário (nome, email, telefone)
  - Confirmação de exclusão

---

## Segurança

### Migração de Banco de Dados

Será necessário adicionar política RLS para permitir que Super Admins:
- Atualizem perfis de outros usuários
- Excluam perfis

```sql
-- Super admins podem atualizar qualquer perfil
CREATE POLICY "Super admins can update any profile"
ON public.profiles
FOR UPDATE
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Super admins podem excluir perfis
CREATE POLICY "Super admins can delete profiles"
ON public.profiles
FOR DELETE
USING (is_super_admin());
```

---

## Interface Visual

| Usuário | Status | Criado em | Ações |
|---------|--------|-----------|-------|
| Denis <br/> dacmedia16@gmail.com | 🔴 Super Admin | 29/01/2026 | — |
| Carlos Silva <br/> sindico@example.com | 🔵 Síndico (Residencial X) | 29/01/2026 | ✏️ 🗑️ 🛡️ |
| Morador Teste <br/> morador@example.com | ⚫ Morador (Residencial X) | 29/01/2026 | ✏️ 🗑️ 🛡️ |

Legenda:
- ✏️ = Editar
- 🗑️ = Excluir
- 🛡️ = Promover a Super Admin

---

## Detalhes Técnicos

### Arquivos a Modificar

1. **`src/hooks/useAllUsers.ts`**
   - Adicionar join com `user_roles` e `condominiums`
   - Retornar array de roles por usuário

2. **`src/pages/super-admin/SuperAdminUsers.tsx`**
   - Importar ícones adicionais (Pencil, Trash2)
   - Adicionar estados para dialogs de editar/excluir
   - Implementar funções de handleEdit e handleDelete
   - Atualizar renderização da coluna Status
   - Adicionar Dialogs de edição e exclusão

3. **Migração SQL**
   - Adicionar políticas RLS para UPDATE e DELETE em profiles

### Fluxo de Exclusão

1. Usuário clica em excluir
2. Dialog de confirmação aparece
3. Ao confirmar:
   - Deletar registros em `user_roles` (cascade automático por FK)
   - Deletar registro em `super_admins` se existir
   - Deletar perfil
4. Refresh da lista

