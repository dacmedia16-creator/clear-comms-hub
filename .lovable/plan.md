

## Evitar membros duplicados (deduplicacao por telefone)

Atualmente, ao cadastrar ou importar membros, o sistema nao verifica se ja existe um membro com o mesmo telefone na mesma organizacao, resultando em duplicatas. A solucao eh adicionar verificacao de duplicidade em todos os pontos de entrada.

### Mudancas

**1. `supabase/functions/create-member/index.ts`**
- Antes de criar o `condo_member`, verificar se ja existe um `condo_member` com o mesmo telefone vinculado a mesma organizacao (via join `user_roles`)
- Tambem verificar se existe um `profile` com o mesmo telefone vinculado via `user_roles`
- Se ja existir, retornar erro informando que o membro ja esta cadastrado

**2. `supabase/functions/create-members-batch/index.ts`**
- Antes do insert em lote, buscar todos os telefones ja cadastrados na organizacao (tanto `condo_members` quanto `profiles` via `user_roles`)
- Filtrar a lista de membros para remover os que ja existem (por telefone)
- Os duplicados sao contados como "skipped" no retorno, nao como "failed"
- Tambem remover duplicatas internas na propria lista de importacao (se o mesmo telefone aparecer 2x no Excel)

**3. Retorno da API**
- `create-member`: retorna erro 409 (conflict) com mensagem "Membro com este telefone ja esta cadastrado nesta organizacao"
- `create-members-batch`: retorna `{ success: N, failed: N, skipped: N }` onde `skipped` sao os duplicados ignorados

**4. `src/hooks/useCondoMembers.ts`**
- Ajustar `importMembers` para somar e retornar o campo `skipped` vindo da API
- Ajustar `createMember` para tratar erro 409 e exibir mensagem amigavel

**5. `src/components/ImportMembersDialog.tsx`** (se aplicavel)
- Exibir a quantidade de membros ignorados por duplicidade apos a importacao

### Detalhes tecnicos
- A deduplicacao usa o campo `phone` como chave unica por organizacao
- Query de verificacao no batch:
```text
SELECT cm.phone FROM condo_members cm
  JOIN user_roles ur ON ur.member_id = cm.id
  WHERE ur.condominium_id = $condoId AND cm.phone IN (...)
UNION
SELECT p.phone FROM profiles p
  JOIN user_roles ur ON ur.user_id = p.id
  WHERE ur.condominium_id = $condoId AND p.phone IN (...)
```
- Membros sem telefone nao sao verificados por duplicidade (passam direto)
- Duplicatas internas no batch: apenas o primeiro registro com cada telefone eh mantido

