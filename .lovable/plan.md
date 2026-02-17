

## Atualizar template para `avisopro_confirma_3`

Preciso trocar o identificador do template em 3 arquivos onde ele esta definido:

| Arquivo | Linha | Mudanca |
|---------|-------|---------|
| `src/lib/whatsapp-templates.ts` | 5 | `avisopro_confirma_2` -> `avisopro_confirma_3` |
| `supabase/functions/send-whatsapp/index.ts` | 14 | `avisopro_confirma_2` -> `avisopro_confirma_3` |
| `supabase/functions/test-whatsapp/index.ts` | 10 | `avisopro_confirma_2` -> `avisopro_confirma_3` |

Mudanca simples: apenas substituir a string do identificador nos 3 locais. Nenhuma outra alteracao necessaria.

