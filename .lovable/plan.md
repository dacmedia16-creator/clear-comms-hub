
# Corrigir Visualização de Vínculo para Moradores

## Problema Identificado

O Francisco **foi vinculado corretamente** ao condomínio (código 101) - o registro existe no banco de dados:

```
user_roles:
- user_id: 5c59c323-ab55-4b8c-b540-c181ff70a310 (Francisco)
- role: resident
- unit: Bloco 7 Ap 103
- condominium_id: Vitrine Esplanada (código 101)
```

O problema é que o morador **não consegue ver** seu próprio vínculo devido às políticas de segurança (RLS) restritivas na tabela `user_roles`.

### Causa Raiz

A política de leitura atual na tabela `user_roles` permite apenas:
- Managers do condomínio (`can_manage_condominium`)
- Super Admins

Um **morador comum não consegue ver seu próprio registro**, então o dashboard aparece vazio.

---

## Solução

Adicionar uma política RLS que permita aos usuários verem seus **próprios registros** na tabela `user_roles`.

### Migração SQL

```sql
-- Permitir que usuários vejam seus próprios registros em user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (
  user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);
```

---

## Arquivos a Modificar

### Migração de Banco de Dados

Criar nova política RLS que permite ao usuário ver seus próprios vínculos, complementando a política existente para managers.

---

## Resultado Esperado

Após a correção:
1. Francisco faz login
2. O hook `useProfile` busca seus registros em `user_roles`
3. Agora a query retorna o registro do Francisco (porque ele é o dono do registro)
4. O dashboard mostra o condomínio "Vitrine Esplanada" corretamente

---

## Impacto

- **Zero impacto** para síndicos e super admins (continuam com as mesmas permissões)
- **Corrige** a visualização para todos os moradores já cadastrados
- **Seguro**: usuários só podem ver seus próprios registros
