
# Plano: Permitir que Super Admin Gerencie Qualquer Organização

## Problema Identificado

O Super Admin está recebendo "Acesso negado" ao tentar acessar páginas de gerenciamento de organizações das quais não é owner/admin/syndic.

**Causa Raiz:** A função PostgreSQL `can_manage_condominium()` não inclui a verificação de `is_super_admin()`, diferente da função `can_create_announcement()` que já possui essa verificação.

**Função Atual:**
```sql
CREATE OR REPLACE FUNCTION public.can_manage_condominium(cond_id uuid)
BEGIN
  RETURN 
    public.is_condominium_owner(cond_id) OR 
    public.has_condominium_role(cond_id, 'admin') OR
    public.has_condominium_role(cond_id, 'syndic');
  -- ❌ Falta: is_super_admin()
END;
```

---

## Solução

Atualizar a função `can_manage_condominium` para incluir a verificação de Super Admin, permitindo que esses usuários gerenciem qualquer organização da plataforma.

**Função Corrigida:**
```sql
CREATE OR REPLACE FUNCTION public.can_manage_condominium(cond_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 
    public.is_condominium_owner(cond_id) OR 
    public.has_condominium_role(cond_id, 'admin') OR
    public.has_condominium_role(cond_id, 'syndic') OR
    public.is_super_admin();  -- ✅ Adicionar esta linha
END;
$function$
```

---

## Impacto da Alteração

Com essa mudança, o Super Admin poderá:

| Página | Antes | Depois |
|--------|-------|--------|
| `/admin/:condoId` (Gerenciar avisos) | ❌ Acesso negado | ✅ Acesso permitido |
| `/admin/:condoId/members` (Membros) | ❌ Acesso negado | ✅ Acesso permitido |
| `/admin/:condoId/settings` (Config) | ❌ Acesso negado | ✅ Acesso permitido |
| `/admin/:condoId/integrations` | ❌ Acesso negado | ✅ Acesso permitido |

---

## Diagrama do Fluxo de Permissões

```text
┌─────────────────────────────────────────────────────────────┐
│                  can_manage_condominium()                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────────────┐                                  │
│   │ is_condominium_owner │────► Owner do condomínio         │
│   └──────────────────────┘                                  │
│              OR                                             │
│   ┌──────────────────────┐                                  │
│   │ has_role('admin')    │────► Admin atribuído             │
│   └──────────────────────┘                                  │
│              OR                                             │
│   ┌──────────────────────┐                                  │
│   │ has_role('syndic')   │────► Síndico atribuído           │
│   └──────────────────────┘                                  │
│              OR                                             │
│   ┌──────────────────────┐                                  │
│   │ is_super_admin()     │────► Super Admin (NOVO!)         │
│   └──────────────────────┘                                  │
│                                                             │
│                     ▼                                       │
│              Retorna TRUE                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Alteração no Banco de Dados

### Migração SQL

```sql
-- Atualizar função can_manage_condominium para incluir Super Admin
CREATE OR REPLACE FUNCTION public.can_manage_condominium(cond_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 
    public.is_condominium_owner(cond_id) OR 
    public.has_condominium_role(cond_id, 'admin') OR
    public.has_condominium_role(cond_id, 'syndic') OR
    public.is_super_admin();
END;
$function$;
```

---

## Resumo

| Item | Detalhe |
|------|---------|
| **Tipo de alteração** | Migração de banco de dados (função PostgreSQL) |
| **Arquivos de código** | Nenhuma alteração necessária |
| **Risco** | Baixo - apenas adiciona uma condição OR |
| **Teste** | Acessar `/admin/:condoId/members` como Super Admin |

---

## Resultado Esperado

Após a migração, o Super Admin poderá:
1. Acessar qualquer organização via Dashboard
2. Clicar em "Config", "Membros" ou "Gerenciar avisos"
3. Realizar operações de gestão sem receber "Acesso negado"
