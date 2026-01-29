

# Correção: Permitir Auto-Cadastro de Morador

## Problema Identificado

O teste revelou que o cadastro de morador falha na etapa final. O profile é criado corretamente, mas a vinculação ao condomínio (`user_roles`) não funciona devido a restrições de RLS.

**Erro no console:** `403 Forbidden` ao tentar inserir em `user_roles`

**Causa raiz:** A política atual de INSERT em `user_roles` exige:
- `can_manage_condominium(condominium_id)` OU
- `is_super_admin()`

Um morador recém-cadastrado não tem nenhuma dessas permissões.

---

## Solução Proposta

Criar uma política RLS adicional que permita auto-cadastro como morador:

```sql
CREATE POLICY "Users can self-register as resident"
ON public.user_roles
FOR INSERT
WITH CHECK (
  role = 'resident'
  AND user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);
```

Esta política permite que:
1. O usuário insira **apenas** registros onde ele mesmo é o `user_id`
2. A role seja **apenas** `resident` (não pode se auto-promover a admin/syndic)
3. O condomínio existe (validado pela FK)

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| Nova migração SQL | Adicionar política de auto-registro |

---

## Resultado Esperado

Após a correção:
1. Morador preenche o formulário com código do condomínio
2. Sistema cria a conta de autenticação
3. Trigger cria o profile automaticamente
4. Sistema vincula o morador ao condomínio com role `resident`
5. Morador é redirecionado ao dashboard com acesso à timeline do condomínio

---

## Segurança

A política proposta é segura porque:
- Limita a role a `resident` apenas (não permite auto-promoção)
- Garante que o usuário só pode criar registros para si mesmo
- Mantém as políticas existentes para outras operações (update/delete)

