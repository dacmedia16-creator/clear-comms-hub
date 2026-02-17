

## Corrigir identificador do template WhatsApp

O template na Zion Talk/Meta se chama **`aviso_pro_confirma_3`** (com underscores separando as palavras), mas no codigo esta como `avisopro_confirma_3` (sem underscores).

### Mudanca

Substituir `avisopro_confirma_3` por `aviso_pro_confirma_3` nos 3 arquivos:

| Arquivo | Mudanca |
|---------|---------|
| `src/lib/whatsapp-templates.ts` | `'avisopro_confirma_3'` -> `'aviso_pro_confirma_3'` |
| `supabase/functions/send-whatsapp/index.ts` | `'avisopro_confirma_3'` -> `'aviso_pro_confirma_3'` |
| `supabase/functions/test-whatsapp/index.ts` | `'avisopro_confirma_3'` -> `'aviso_pro_confirma_3'` |

Apos essa correcao, o envio de teste deve funcionar normalmente.
