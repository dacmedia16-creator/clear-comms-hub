

## Mover membros importados para a lista Alphaville 1

Os 386 membros que foram importados recentemente (em 2026-02-23 13:55) ficaram sem lista (list_id = NULL) porque o bug foi corrigido depois da importacao. Vamos mover todos eles para a lista "Alphaville 1" via uma migracao SQL.

### Alteracao

**Migracao SQL** (uma unica query):

```text
UPDATE user_roles
SET list_id = '7c759ffa-f300-441a-a60d-d609508f4b9b'
WHERE condominium_id = (
  SELECT condominium_id 
  FROM member_lists 
  WHERE id = '7c759ffa-f300-441a-a60d-d609508f4b9b'
)
AND list_id IS NULL
AND created_at >= '2026-02-23 13:55:00+00';
```

Isso atualiza os 386 registros de uma so vez, movendo-os do "Geral" para a lista "Alphaville 1".

### Detalhes tecnicos

- A query filtra por `list_id IS NULL` (membros sem lista) e `created_at >= '2026-02-23 13:55:00'` (somente os importados recentemente)
- O `list_id` alvo e `7c759ffa-f300-441a-a60d-d609508f4b9b` (Alphaville 1)
- Sera criado um arquivo de migracao em `supabase/migrations/`

### Arquivo criado

- `supabase/migrations/<timestamp>_move_members_to_alphaville1.sql`
