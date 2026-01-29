

# Plano: Cadastro de Morador com Dados Completos

## Resumo

Expandir o formulario de cadastro de membros para incluir todos os dados necessarios: Nome Completo, Telefone, Email e Bloco/Unidade. O fluxo sera alterado para permitir criar um novo usuario diretamente (nao apenas selecionar existentes).

---

## Alteracoes no Banco de Dados

### 1. Adicionar Campo de Unidade na Tabela user_roles

O campo `unit` (Bloco e Unidade) sera adicionado na tabela `user_roles` pois eh especifico por condominio - um mesmo morador pode estar em unidades diferentes em condominios diferentes.

```sql
ALTER TABLE public.user_roles 
ADD COLUMN unit text;

COMMENT ON COLUMN public.user_roles.unit IS 
  'Bloco e Unidade do morador neste condominio (ex: Bloco A, Apt 101)';
```

---

## Fluxo de Cadastro Atualizado

```text
Administrador clica em "Adicionar Membro"
              |
              v
   Dialog com duas opcoes:
   1. "Cadastrar Novo Morador" (form completo)
   2. "Selecionar Usuario Existente" (dropdown atual)
              |
              v
   Se "Cadastrar Novo":
   - Nome Completo *
   - Telefone * (formato E.164)
   - Email *
   - Bloco e Unidade *
   - Funcao (Morador, Sindico, etc)
              |
              v
   Sistema cria profile + user_role
              |
              v
   Sucesso: membro aparece na lista
```

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/super-admin/SuperAdminCondoMembers.tsx` | Novo formulario com campos completos e tabs |
| `src/hooks/useCondoMembers.ts` | Adicionar campo `unit`, nova funcao para criar morador |
| Tabela de membros | Adicionar coluna "Unidade" na visualizacao |

---

## Interface do Usuario

### Dialog de Adicionar Membro (Novo Layout)

O dialog tera duas abas:

**Aba 1: Novo Morador**
```text
+------------------------------------------+
|  Adicionar Membro                        |
+------------------------------------------+
|  [Novo Morador] [Usuario Existente]      |
+------------------------------------------+
|  Nome Completo *                         |
|  [________________________]              |
|                                          |
|  Telefone *                              |
|  [+55 11 99999-9999_______]              |
|                                          |
|  Email *                                 |
|  [________________________]              |
|                                          |
|  Bloco e Unidade *                       |
|  [Bloco A, Apt 101________]              |
|                                          |
|  Funcao *                                |
|  [Morador           v]                   |
|                                          |
|       [Cancelar]  [Adicionar]            |
+------------------------------------------+
```

**Aba 2: Usuario Existente**
```text
+------------------------------------------+
|  [Novo Morador] [Usuario Existente]      |
+------------------------------------------+
|  Usuario *                               |
|  [Selecione um usuario   v]              |
|                                          |
|  Bloco e Unidade                         |
|  [________________________]              |
|                                          |
|  Funcao *                                |
|  [Morador           v]                   |
|                                          |
|       [Cancelar]  [Adicionar]            |
+------------------------------------------+
```

### Tabela de Membros Atualizada

| Usuario | Telefone | Unidade | Funcao | Adicionado em | Acoes |
|---------|----------|---------|--------|---------------|-------|
| Joao Silva | +5511999... | Bloco A, 101 | Morador | 29/01/2026 | [Editar] [Excluir] |

---

## Secao Tecnica

### Novo Hook: createMember

```typescript
const createMember = async (memberData: {
  fullName: string;
  phone: string;
  email: string;
  unit: string;
  role: "admin" | "syndic" | "resident" | "collaborator";
}) => {
  // 1. Criar profile (sem user_id de autenticacao)
  // 2. Criar user_role com o profile_id
  // ...
};
```

### Consideracao Importante: Moradores sem Login

Os moradores cadastrados dessa forma NAO terao acesso ao sistema (nao terao conta de login). Eles serao apenas registros para:
- Receber WhatsApp
- Aparecer na lista de membros
- Ter seus dados organizados

Para que um morador tenha acesso ao sistema, ele precisaria criar uma conta propria.

### Validacao de Dados

```typescript
const memberSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(100),
  phone: z.string().regex(/^\+?[1-9]\d{10,14}$/, "Telefone invalido"),
  email: z.string().email("Email invalido"),
  unit: z.string().min(1, "Unidade eh obrigatoria").max(50),
  role: z.enum(["admin", "syndic", "resident", "collaborator"]),
});
```

---

## Resultado Final

Apos implementacao:
- Formulario completo para cadastro de moradores
- Campos: Nome, Telefone, Email, Bloco/Unidade, Funcao
- Visualizacao da unidade na tabela de membros
- Opcao de selecionar usuario existente mantida
- Validacao de todos os campos

