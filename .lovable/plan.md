

# Correção: Síndico não consegue salvar configurações de SMS

## Diagnóstico

O problema foi identificado: a política de segurança (RLS) da tabela `condominiums` não permite que **Síndicos** atualizem as configurações.

### Política atual de UPDATE:
```sql
USING (can_manage_condominium(id) OR is_super_admin())
```

A função `can_manage_condominium()` só verifica:
- Se o usuário é **owner** (dono)
- Se o usuário tem role **admin**

O **Síndico** não está incluído, por isso a atualização falha silenciosamente (o Supabase retorna sucesso sem modificar nenhuma linha).

---

## Solução Proposta

Atualizar a função `can_manage_condominium` para incluir o papel de **síndico**, permitindo que síndicos também possam editar as configurações do condomínio.

### Alteração na função PostgreSQL

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
    public.has_condominium_role(cond_id, 'syndic');  -- ADICIONAR SÍNDICO
END;
$function$;
```

---

## Arquivos Afetados

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| Migration SQL | Novo | Atualizar função `can_manage_condominium` |

---

## Fluxo de Implementação

1. Criar migration para atualizar a função `can_manage_condominium`
2. A função passará a retornar `true` também para usuários com role `syndic`
3. Após a alteração, síndicos poderão:
   - Atualizar configurações do condomínio
   - Habilitar/desabilitar notificações (SMS, WhatsApp, Email)

---

## Impacto

### Antes
- Apenas **Owner** e **Admin** podem editar configurações
- Síndico vê mensagem "Configurações salvas!" mas nada é alterado

### Depois
- **Owner**, **Admin** e **Síndico** podem editar configurações
- Configurações de notificação serão salvas corretamente

---

## Considerações de Segurança

Esta alteração é segura porque:
- O síndico já tem permissão para criar/editar avisos no condomínio
- É esperado que um síndico possa gerenciar as configurações de notificação
- A hierarquia de acesso será: Owner > Admin = Síndico > Colaborador > Morador

