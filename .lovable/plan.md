

# Restringir Criação de Condomínios para Super Admins

## Resumo

Atualmente, qualquer usuário autenticado pode criar condomínios no dashboard. Vamos restringir essa funcionalidade para que **apenas super admins** possam criar condomínios.

---

## Alterações Necessárias

### 1. Política RLS no Banco de Dados

Modificar a política de INSERT na tabela `condominiums`:

**De (atual):**
```sql
WITH CHECK (
  (owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())) 
  OR is_super_admin()
)
```

**Para (nova):**
```sql
WITH CHECK (is_super_admin())
```

### 2. Interface do Dashboard

Atualizar `src/pages/DashboardPage.tsx`:
- Ocultar o botão "Novo Condomínio" para usuários que não são super admin
- Remover a opção de criar condomínio quando a lista está vazia (para não-super-admins)
- Manter a funcionalidade para super admins

---

## Fluxo Atualizado

| Tipo de Usuário | Pode Criar Condomínio? |
|-----------------|------------------------|
| Super Admin | Sim |
| Síndico | Nao (apenas gerencia se for owner) |
| Morador | Nao |

---

## Impacto

- **Síndicos existentes**: Continuam podendo gerenciar seus condomínios existentes
- **Novos síndicos**: Precisam que um super admin crie o condomínio e os atribua como owner
- **Segurança**: Maior controle sobre quais condomínios são criados na plataforma

---

## Detalhes Técnicos

### Migração SQL

```sql
-- Remove a política antiga
DROP POLICY IF EXISTS "Users can create condominiums" ON public.condominiums;

-- Cria nova política restritiva
CREATE POLICY "Only super admins can create condominiums"
ON public.condominiums
FOR INSERT
WITH CHECK (is_super_admin());
```

### Alterações no Código

No arquivo `DashboardPage.tsx`:
- Condicionar renderização do Dialog de criação ao estado `isSuperAdmin`
- Mostrar mensagem apropriada para síndicos sem condomínios

