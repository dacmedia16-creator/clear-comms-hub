
## Correção: Bug "memberRows is not defined" nas Edge Functions

### O que aconteceu
O último envio do Denis 2 falhou com **erro 500** nas 3 funções de notificação (WhatsApp, SMS e Email). O erro é:

```
ReferenceError: memberRows is not defined
```

### Causa raiz
Nas 3 Edge Functions, a query do banco retorna o resultado na variável `rolesData`, mas o código usa `memberRows` (variável inexistente) na linha seguinte:

```typescript
const { data: rolesData, error: membersError } = await supabase
  .from('user_roles')
  .select(...)

// BUG: deveria ser rolesData, não memberRows
let filteredRows = memberRows;
```

### Correção
Trocar `memberRows` por `rolesData` nas 3 funções, adicionando cast de tipo e fallback para array vazio:

- **`supabase/functions/send-whatsapp/index.ts`** (linha 241): `let filteredRows = memberRows` -> `let filteredRows = (rolesData || []) as unknown as MemberRow[]`
- **`supabase/functions/send-sms/index.ts`** (linha 132): mesma correção
- **`supabase/functions/send-email/index.ts`** (linha 310): mesma correção

### Impacto
Correção simples de 1 linha em cada arquivo. Após o deploy, o Denis 2 poderá reenviar as notificações com sucesso.
