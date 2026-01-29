

# Adicionar Código Numérico Simples aos Condomínios

## Objetivo

Permitir que moradores usem um **código simples** (ex: 101, 102, 103...) para se cadastrar, em vez do slug complexo (ex: "vitrine-esplanada-a05f26"). Isso facilita o cadastro e a comunicação entre síndico e moradores.

---

## Solução

Adicionar um novo campo `code` na tabela `condominiums` com um número sequencial único começando em 101. O morador poderá digitar esse código simples no cadastro.

---

## Alterações Necessárias

### 1. Migração de Banco de Dados

Adicionar coluna `code` com sequência automática:

```sql
-- Adicionar coluna code com sequência iniciando em 101
CREATE SEQUENCE IF NOT EXISTS condominiums_code_seq START WITH 101;

ALTER TABLE public.condominiums 
ADD COLUMN code INTEGER UNIQUE DEFAULT nextval('condominiums_code_seq');

-- Gerar códigos para condomínios existentes
UPDATE public.condominiums 
SET code = nextval('condominiums_code_seq') 
WHERE code IS NULL;

-- Tornar a coluna NOT NULL após popular os existentes
ALTER TABLE public.condominiums 
ALTER COLUMN code SET NOT NULL;
```

### 2. Atualizar Página de Cadastro de Morador

Modificar `src/pages/auth/SignupResidentPage.tsx` para:
- Aceitar tanto o código numérico quanto o slug
- Buscar condomínio por `code` (numérico) OU por `slug`
- Atualizar placeholder: "ex: 101 ou jardins-abc123"

### 3. Exibir Código nas Configurações

Atualizar `src/pages/CondominiumSettingsPage.tsx` para:
- Mostrar o código do condomínio na seção "Informações do Sistema"
- Destacar o código para fácil compartilhamento com moradores

### 4. Exibir Código na Lista de Condomínios (Super Admin)

Atualizar `src/pages/super-admin/SuperAdminCondominiums.tsx` para:
- Mostrar a coluna "Código" na tabela

---

## Interface Visual

### Configurações do Condomínio

```text
Informações do Sistema
┌─────────────────────────────────────────────────────────┐
│ Código do condomínio        101                         │
│ Link da timeline            /c/vitrine-esplanada-a05f26 │
│ Plano atual                 Free                        │
└─────────────────────────────────────────────────────────┘
```

### Cadastro de Morador

```text
Código do Condomínio *
┌─────────────────────────────────────────────────────────┐
│ ex: 101                                                 │
└─────────────────────────────────────────────────────────┘
Solicite ao seu síndico
```

---

## Detalhes Técnicos

### Arquivos a Modificar

**Banco de Dados (Migração SQL)**
- Criar sequência `condominiums_code_seq` iniciando em 101
- Adicionar coluna `code` INTEGER UNIQUE NOT NULL
- Popular códigos para condomínios existentes

**`src/pages/auth/SignupResidentPage.tsx`**
- Modificar query de validação para buscar por `code` (se numérico) ou `slug` (se texto)
- Atualizar placeholder do campo

**`src/pages/CondominiumSettingsPage.tsx`**
- Adicionar `code` na interface e exibição
- Mostrar código destacado na seção de informações do sistema

**`src/pages/super-admin/SuperAdminCondominiums.tsx`**
- Adicionar coluna "Código" na tabela de condomínios

**`src/hooks/useAllCondominiums.ts`**
- Incluir campo `code` na interface Condominium

---

## Fluxo de Funcionamento

1. Síndico acessa configurações do condomínio e vê o código (ex: 101)
2. Síndico compartilha o código com os moradores
3. Morador acessa cadastro e digita "101"
4. Sistema busca condomínio pelo código e valida
5. Morador completa o cadastro normalmente

---

## Benefícios

- Código fácil de memorizar e compartilhar
- Funciona tanto código numérico quanto slug antigo
- Retrocompatível com cadastros existentes
- Geração automática para novos condomínios

