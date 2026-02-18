

## Otimizar importacao de membros com processamento em lote (batch)

Hoje cada membro e criado com uma chamada HTTP individual a Edge Function `create-member`. Para 300+ membros, isso significa 300+ requests sequenciais -- por isso demora.

A solucao e criar uma **nova Edge Function `create-members-batch`** que recebe todos os membros de uma vez e os insere em lote no banco de dados.

---

### Comparacao

| | Atual | Otimizado |
|---|---|---|
| Requests HTTP | 1 por membro | 1 unico para todos |
| Inserts no banco | 1 por membro | Batch (todos de uma vez) |
| Tempo estimado (300 membros) | ~3-5 minutos | ~3-5 segundos |
| Verificacao de permissao | 300x | 1x |

---

### Mudancas

**1. Nova Edge Function: `supabase/functions/create-members-batch/index.ts`**
- Recebe array de membros em uma unica chamada
- Verifica permissao do usuario 1 unica vez
- Busca tipo de organizacao 1 unica vez
- Insere todos os `condo_members` em batch (um unico INSERT)
- Insere todos os `user_roles` em batch (um unico INSERT)
- Retorna contagem de sucesso/falha

**2. Atualizar `src/hooks/useCondoMembers.ts`**
- Alterar funcao `importMembers` para chamar a nova Edge Function `create-members-batch` em vez de iterar membro a membro
- Manter a funcao `createMember` individual para cadastro unitario (sem mudanca)

**3. Atualizar `src/components/ImportMembersDialog.tsx`**
- Ajustar barra de progresso para refletir o novo fluxo (progresso por etapa em vez de por membro)

---

### Detalhes tecnicos

**Edge Function `create-members-batch`:**
- Valida autenticacao e permissao uma unica vez
- Recebe `{ condominiumId, members: [...] }` no body
- Usa `serviceClient.from("condo_members").insert([...array...]).select("id")` para inserir todos de uma vez
- Mapeia os IDs retornados para criar os `user_roles` em batch tambem
- Limite de seguranca: maximo 500 membros por chamada (se necessario, o frontend divide em chunks)

**Frontend:**
- Se a lista tiver mais de 500 membros, divide em chunks de 500 e faz N chamadas (ainda muito mais rapido que 1 por membro)
- Progresso atualizado por chunk processado

