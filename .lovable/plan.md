

# Plano: Criar Organização no Fluxo de Cadastro de Gestor

## Problema Atual

Atualmente, para usar o AVISO PRO, uma organização precisa ser criada previamente pelo Super Admin. Isso impede que novos gestores se cadastrem de forma autônoma.

---

## Solução Proposta

Adicionar uma **terceira opção** na tela de escolha de perfil (`SignupRolePage`):

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Como você quer usar o AVISO PRO?                          │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Membro    │  │   Gestor    │  │   Criar     │         │
│  │             │  │             │  │   Novo      │         │
│  │  Já tenho   │  │  Já existe  │  │             │         │
│  │  um código  │  │  um código  │  │  Criar uma  │         │
│  │             │  │             │  │  nova org.  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Novo Fluxo

```
/auth/signup/:type → Escolher perfil
       ↓
       ├── /auth/signup/:type/member   → Cadastro com código existente
       ├── /auth/signup/:type/manager  → Solicitar acesso a org existente
       └── /auth/signup/:type/create   → NOVO: Criar organização + conta
```

---

## Arquivos a Criar/Modificar

### 1. NOVA PÁGINA: src/pages/auth/SignupCreateOrgPage.tsx

Formulário completo para criar uma nova organização:

**Campos da Organização:**
- Nome da organização (ex: "Clínica São Lucas")
- Endereço (opcional)

**Campos do Gestor:**
- Nome completo
- Email
- Telefone
- Senha

**Comportamento:**
1. Cria a organização na tabela `condominiums` com o tipo já definido pela URL
2. Gera automaticamente um código numérico único
3. Cria a conta do gestor
4. Vincula o gestor como `syndic` com `is_approved = true` (já aprovado, pois é o criador)

### 2. MODIFICAR: src/pages/auth/SignupRolePage.tsx

Adicionar terceira opção: "Criar Nova Organização"
- Card com ícone de adição (Plus ou PlusCircle)
- Texto: "Quero criar uma nova [organização]"
- Link para `/auth/signup/:type/create`

### 3. MODIFICAR: src/App.tsx

Adicionar rota:
```typescript
<Route path="/auth/signup/:type/create" element={<SignupCreateOrgPage />} />
```

---

## Campos do Formulário de Criação

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| Nome da Organização | Sim | Nome exibido no sistema |
| Endereço | Não | Localização física |
| Nome do Gestor | Sim | Nome completo |
| Email | Sim | Para login e notificações |
| Telefone | Sim | Para contato e WhatsApp |
| Senha | Sim | Mínimo 6 caracteres |

---

## Lógica de Criação

```typescript
// 1. Gerar código único
const code = await generateUniqueCode();

// 2. Criar organização
const { data: org } = await supabase
  .from("condominiums")
  .insert({
    name: orgName,
    address: address,
    organization_type: type, // da URL
    code: code,
    slug: slugify(orgName),
  })
  .select()
  .single();

// 3. Criar usuário
const { data: authData } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { full_name, phone } }
});

// 4. Vincular como gestor (já aprovado)
await supabase.from("user_roles").insert({
  user_id: profile.id,
  condominium_id: org.id,
  role: "syndic",
  is_approved: true, // Criador já aprovado
});
```

---

## Interface Visual

### Card "Criar Nova Organização"

```
┌─────────────────────────────────────────┐
│                                         │
│          ┌───────────────┐              │
│          │      ➕       │              │
│          │    (ícone)    │              │
│          └───────────────┘              │
│                                         │
│       Criar Nova Igreja                 │
│                                         │
│    Quero criar um canal oficial         │
│    para minha organização               │
│                                         │
└─────────────────────────────────────────┘
```

### Formulário de Criação

```
┌─────────────────────────────────────────┐
│  ⬅ Voltar                               │
│                                         │
│         ⛪ Igreja                        │
│                                         │
│       Criar Nova Igreja                 │
│    Configure seu canal oficial          │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Dados da Igreja                        │
│  ┌─────────────────────────────────┐    │
│  │ Nome da Igreja *                │    │
│  │ ex: Igreja Batista Central      │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ Endereço                        │    │
│  │ Rua, número, bairro             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Seus Dados (Pastor)                    │
│  ┌─────────────────────────────────┐    │
│  │ Nome Completo *                 │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ Email *                         │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ Telefone *                      │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ Senha *                         │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ Confirmar Senha *               │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │        Criar Igreja             │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

---

## Terminologia Dinâmica

O formulário usará os termos corretos baseados no tipo:

| Tipo | Título | Label Gestor |
|------|--------|--------------|
| condominium | Criar Novo Condomínio | Seus Dados (Síndico) |
| healthcare | Criar Nova Instituição | Seus Dados (Administrador) |
| company | Criar Nova Empresa | Seus Dados (Gestor) |
| community | Criar Nova Comunidade | Seus Dados (Presidente) |
| church | Criar Nova Igreja | Seus Dados (Pastor) |
| franchise | Criar Nova Rede | Seus Dados (Franqueador) |

---

## Resumo de Alterações

| Arquivo | Ação |
|---------|------|
| `src/pages/auth/SignupCreateOrgPage.tsx` | CRIAR - Formulário completo |
| `src/pages/auth/SignupRolePage.tsx` | Adicionar terceira opção |
| `src/App.tsx` | Adicionar rota `/auth/signup/:type/create` |

