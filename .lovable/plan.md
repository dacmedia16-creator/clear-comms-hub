

## Corrigir URL do botão CTA do WhatsApp

### Problema
O template da Meta tem a URL base como `https://avisopro.com.br/{{1}}`, e o parâmetro dinâmico envia apenas o slug (ex: `vitrine-esplanada-a3abc5`). Resultado: `avisopro.com.br/vitrine-esplanada-a3abc5` (404). O correto seria `avisopro.com.br/c/vitrine-esplanada-a3abc5`.

### Solucao
Adicionar o prefixo `c/` ao valor enviado no `buttonUrlDynamicParams[0]`.

### Alteracoes

**Arquivo 1: `supabase/functions/send-whatsapp/index.ts`**
- Trocar `condominium.slug` por `` `c/${condominium.slug}` ``

**Arquivo 2: `supabase/functions/test-whatsapp/index.ts`**
- Trocar `'demo'` por `'c/demo'`

### Resultado esperado
- URL final: `https://avisopro.com.br/c/{slug}` -- que corresponde a rota `/c/:slug` do app
