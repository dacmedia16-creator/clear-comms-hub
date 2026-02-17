

## Corrigir URL duplicada no botao de opt-out do WhatsApp

### Problema
A URL do botao de opt-out esta ficando duplicada: `avisopro.com.br/optout?t=optout?t=test-demo`. Isso acontece porque o template na Meta ja inclui `https://avisopro.com.br/optout?t=` como parte fixa da URL do botao, e o parametro dinamico `{{1}}` e apenas o valor do token. Porem, o codigo esta enviando `optout?t=TOKEN` como parametro, causando a duplicacao.

### Solucao
Remover o prefixo `optout?t=` do valor enviado em `buttonUrlDynamicParams[1]`, passando apenas o token puro.

### Arquivos a alterar

| Arquivo | Mudanca |
|---------|---------|
| `supabase/functions/send-whatsapp/index.ts` (linha 122) | `optout?t=${optoutToken}` -> `${optoutToken}` |
| `supabase/functions/test-whatsapp/index.ts` (linha ~107) | `optout?t=test-demo` -> `test-demo` |

### Detalhes tecnicos
- Na `send-whatsapp`, linha 122: mudar `buttonUrlDynamicParams[1]` de `` `optout?t=${optoutToken}` `` para `` `${optoutToken}` ``
- Na `test-whatsapp`, mudar `buttonUrlDynamicParams[1]` de `'optout?t=test-demo'` para `'test-demo'`
- Nenhuma alteracao necessaria no frontend (`OptOutPage.tsx`) pois ele ja le o token corretamente via `searchParams.get("t")`
