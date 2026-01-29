

# Correção do Erro de RLS na Criação de Avisos

## Problema Identificado

A função `can_create_announcement` não inclui o role **'syndic'** nas permissões, fazendo com que síndicos não consigam criar avisos.

### Função Atual:
```sql
CREATE OR REPLACE FUNCTION public.can_create_announcement(cond_id uuid)
RETURNS boolean
AS $function$
BEGIN
  RETURN 
    public.can_manage_condominium(cond_id) OR   -- owner/admin
    public.has_condominium_role(cond_id, 'collaborator') OR
    public.is_super_admin();
END;
$function$
```

### O que está permitido atualmente:
- Owner do condomínio (Denis - dacmedia16@gmail.com)
- Usuários com role 'admin'
- Usuários com role 'collaborator'
- Super admins

### O que está faltando:
- **Usuários com role 'syndic'** - Síndicos não conseguem criar avisos!

---

## Dados do Banco

| Condomínio | Owner | Síndico | Residentes |
|------------|-------|---------|------------|
| Vitrine Esplanada | Denis (owner) | Fernanda (syndic) | Francisco (resident) |

O usuário que está tentando criar o aviso provavelmente é Fernanda (síndica), que **deveria** ter permissão mas a função não inclui o role 'syndic'.

---

## Solução

Atualizar a função `can_create_announcement` para incluir o role 'syndic':

```sql
CREATE OR REPLACE FUNCTION public.can_create_announcement(cond_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 
    public.can_manage_condominium(cond_id) OR 
    public.has_condominium_role(cond_id, 'syndic') OR
    public.has_condominium_role(cond_id, 'collaborator') OR
    public.is_super_admin();
END;
$function$
```

---

## Resumo das Mudanças

| Tipo | Descrição |
|------|-----------|
| Migration | Atualizar função `can_create_announcement` para incluir role 'syndic' |

---

## Detalhes Técnicos

### Hierarquia de Permissões (após correção)

```text
Criação de Avisos:
├── Super Admin (qualquer condomínio)
├── Owner do Condomínio
├── Admin do Condomínio
├── Syndic do Condomínio ← ADICIONAR
└── Collaborator do Condomínio
```

### SQL da Migration

```sql
-- Corrigir funcao can_create_announcement para incluir syndic
CREATE OR REPLACE FUNCTION public.can_create_announcement(cond_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 
    public.can_manage_condominium(cond_id) OR 
    public.has_condominium_role(cond_id, 'syndic') OR
    public.has_condominium_role(cond_id, 'collaborator') OR
    public.is_super_admin();
END;
$function$;
```

---

## Após Correção

Com essa correção, o síndico (Fernanda) poderá criar avisos no condomínio "Vitrine Esplanada".

