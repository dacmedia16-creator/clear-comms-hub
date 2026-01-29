

# Fluxo de Cadastro de Síndico com Aprovação

## Visão Geral

Modificar o cadastro de síndico para:
1. Exigir vínculo a um condomínio existente (usando código numérico ou slug)
2. Criar o registro com status "pendente" até aprovação do Super Admin
3. Bloquear acesso do síndico até a aprovação

---

## Alterações de Banco de Dados

### 1. Adicionar coluna `is_approved` na tabela `user_roles`

Nova coluna para controlar se o vínculo foi aprovado pelo Super Admin:

```sql
ALTER TABLE public.user_roles 
ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT true;

-- Síndicos que se auto-cadastram precisam de aprovação
-- Residentes continuam com aprovação automática
```

**Lógica:**
- `is_approved = true` (padrão): Aprovado automaticamente
- `is_approved = false`: Aguardando aprovação do Super Admin

### 2. Atualizar política RLS para auto-registro de síndico

Criar política que permite síndicos se auto-registrarem como "pendente":

```sql
CREATE POLICY "Syndics can self-register as pending"
ON public.user_roles FOR INSERT
WITH CHECK (
  role = 'syndic'::app_role 
  AND is_approved = false
  AND user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);
```

---

## Arquivos a Modificar

### 1. `src/pages/auth/SignupSyndicPage.tsx`

**Mudanças:**
- Adicionar campo de código do condomínio (similar ao SignupResidentPage)
- Validação em tempo real do código do condomínio
- Criar registro em `user_roles` com `role: 'syndic'` e `is_approved: false`
- Exibir mensagem informando que o cadastro aguarda aprovação

**Novo fluxo:**
1. Síndico digita código do condomínio
2. Sistema valida se o condomínio existe
3. Cria conta + profile + user_role (pendente)
4. Exibe tela de "aguardando aprovação"

### 2. `src/hooks/useProfile.ts`

**Mudanças:**
- Incluir `is_approved` na busca de roles
- Filtrar apenas roles aprovados para exibição no dashboard
- Expor lista de roles pendentes para exibir aviso

### 3. `src/pages/DashboardPage.tsx`

**Mudanças:**
- Verificar se usuário tem apenas roles pendentes
- Exibir mensagem de "aguardando aprovação" se necessário
- Bloquear acesso a funcionalidades enquanto pendente

### 4. `src/pages/super-admin/SuperAdminUsers.tsx`

**Mudanças:**
- Mostrar badge "Pendente" para usuários com `is_approved = false`
- Adicionar ação "Aprovar" para vínculos pendentes
- Filtro para ver apenas cadastros pendentes

### 5. `src/hooks/useAllUsers.ts`

**Mudanças:**
- Incluir `is_approved` nos dados de roles dos usuários
- Permitir identificar quais vínculos estão pendentes

### 6. `src/components/super-admin/UserRoleBadges.tsx`

**Mudanças:**
- Exibir indicador visual para roles pendentes (ex: badge amarelo "Pendente")

### 7. `src/components/super-admin/ManageUserRolesDialog.tsx`

**Mudanças:**
- Adicionar botão "Aprovar" para roles pendentes
- Permitir rejeitar (deletar) cadastros pendentes

---

## Fluxo Visual

### Cadastro do Síndico

```text
Cadastro de Síndico
┌─────────────────────────────────────────────────────────┐
│ Código do Condomínio *                                  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ex: 101                                     ✓       │ │
│ └─────────────────────────────────────────────────────┘ │
│ Vitrine Esplanada                                       │
│                                                         │
│ Nome Completo *                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Seu nome                                            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [... demais campos ...]                                 │
│                                                         │
│ ℹ️ Após o cadastro, você precisará aguardar a           │
│    aprovação do administrador do sistema.               │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │              Criar minha conta                       │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Tela de Aguardando Aprovação

```text
┌─────────────────────────────────────────────────────────┐
│                     ⏳                                   │
│                                                         │
│         Aguardando aprovação                            │
│                                                         │
│  Seu cadastro como síndico do condomínio                │
│  "Vitrine Esplanada" está sendo analisado.              │
│                                                         │
│  Você receberá um email quando for aprovado.            │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │    Sair      │  │  Atualizar   │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

### Super Admin - Lista de Usuários

```text
| Usuário           | Papéis                              | Ações      |
|-------------------|-------------------------------------|------------|
| João Silva        | 🟡 Síndico (Pendente) - Jardins     | ✓ ✗ ✏️ 🗑️  |
| Maria Santos      | 🟢 Síndico - Vitrine                | ✏️ ⚙️ 🗑️   |
```

---

## Considerações Técnicas

### Segurança
- Síndico só consegue criar role com `is_approved = false`
- Apenas Super Admin pode alterar `is_approved` para `true`
- Dashboard bloqueia funcionalidades até aprovação

### Retrocompatibilidade
- Registros existentes continuam com `is_approved = true` (padrão)
- Não afeta moradores (continuam com aprovação automática)

### Notificações (Futura implementação)
- Email para Super Admin quando novo síndico se cadastra
- Email para síndico quando aprovado

