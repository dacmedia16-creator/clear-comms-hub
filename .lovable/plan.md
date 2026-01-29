
# Correção: Recursão Infinita nas Políticas RLS

## Diagnóstico da Causa Raiz

Após investigação detalhada, identifiquei o problema exato. A política RLS criada na última atualização causou **recursão infinita**:

### Cadeia de Recursão
```text
SELECT profiles
    ↓
Política: "Condo managers can view member profiles"
    ↓
Função: can_manage_condominium(ur.condominium_id)
    ↓
Função: is_condominium_owner(cond_id)
    ↓
JOIN public.profiles p ON p.id = c.owner_id ← ACIONA NOVAMENTE SELECT profiles
    ↓
RECURSÃO INFINITA!
```

A função `is_condominium_owner()` faz um JOIN com a tabela `profiles` para verificar se o usuário é dono do condomínio. Quando isso acontece dentro de uma política RLS da própria tabela `profiles`, o PostgreSQL detecta a recursão e retorna erro.

## Os Dados NÃO Foram Perdidos

Os condomínios e usuários ainda existem no banco de dados. O problema é apenas de **permissão de leitura** (RLS). Prova: a timeline pública ainda funciona porque a tabela `announcements` não tem esse problema.

---

## Solução Proposta

### Estratégia: Adicionar auth_owner_id em condominiums

Assim como já foi feito em `super_admins` e `user_roles` (que têm `auth_user_id`), vamos adicionar uma coluna `auth_owner_id` na tabela `condominiums` que referencia diretamente `auth.uid()`, evitando a necessidade de JOIN com `profiles`.

### Alterações Necessárias

| Arquivo/Recurso | Ação | Descrição |
|-----------------|------|-----------|
| Migration SQL | Criar | Adicionar coluna `auth_owner_id` em condominiums |
| Migration SQL | Criar | Atualizar dados existentes com os auth_user_id corretos |
| Migration SQL | Criar | Atualizar função `is_condominium_owner()` |
| Migration SQL | Criar | Atualizar política "Condo managers can view member profiles" |
| Migration SQL | Criar | Corrigir política "Users can view own roles" em user_roles |

---

## Detalhes Técnicos

### 1. Adicionar coluna auth_owner_id

```sql
-- Adicionar coluna que referencia diretamente auth.users
ALTER TABLE public.condominiums 
ADD COLUMN auth_owner_id UUID REFERENCES auth.users(id);

-- Preencher com dados existentes
UPDATE public.condominiums c
SET auth_owner_id = p.user_id
FROM public.profiles p
WHERE c.owner_id = p.id;
```

### 2. Atualizar função is_condominium_owner

```sql
CREATE OR REPLACE FUNCTION public.is_condominium_owner(cond_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.condominiums c
    WHERE c.id = cond_id 
      AND c.auth_owner_id = auth.uid()
  );
$$;
```

**Diferença:** Não faz mais JOIN com `profiles`, usa diretamente `auth_owner_id`.

### 3. Corrigir política "Users can view own roles"

```sql
-- Remover política atual que causa recursão
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Criar nova política usando auth_user_id diretamente
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth_user_id = auth.uid());
```

### 4. Manter política de profiles (agora funciona)

A política "Condo managers can view member profiles" continuará funcionando porque:
- `can_manage_condominium()` → `is_condominium_owner()` agora usa `auth_owner_id`
- Não há mais JOIN com `profiles`

---

## Impacto da Correção

### Antes (Problema)
- Erro 500 em qualquer query que toque `profiles`
- Dashboard vazio para todos os usuários
- Listas de usuários e condomínios vazias

### Depois (Corrigido)
- Super Admin volta a ver todos os condomínios e usuários
- Síndicos podem ver moradores dos seus condomínios
- Todas as funcionalidades restauradas

---

## Passos de Implementação

1. **Migration SQL única** contendo todas as correções:
   - Adicionar `auth_owner_id` em condominiums
   - Preencher dados existentes
   - Atualizar `is_condominium_owner()`
   - Corrigir política de `user_roles`

2. **Nenhuma alteração de código frontend necessária**
   - O problema é 100% no banco de dados

---

## Considerações de Segurança

- A abordagem `auth_user_id` / `auth_owner_id` é o padrão recomendado para evitar recursão
- Todas as funções de segurança continuam usando `SECURITY DEFINER`
- Os dados sensíveis permanecem protegidos pelas políticas RLS
