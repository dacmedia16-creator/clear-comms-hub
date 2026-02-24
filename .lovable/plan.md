

## Corrigir indice do botao do vip7_captacao3 para [1]

### Resumo
O template `vip7_captacao3` deve usar `buttonUrlDynamicParams[1]` (e nao `[0]`) para o token de opt-out. O `vip7_captacao2` continua usando `[0]`.

### Alteracoes

#### 1. `supabase/functions/send-whatsapp/index.ts`
- Remover `vip7_captacao3` da lista `singleButtonIdx0Templates`
- Adicionar `vip7_captacao3` na lista `singleButtonIdx1Templates` (junto com `visita_prova_envio` e `vip7_captacao`)

Resultado:
- `singleButtonIdx0Templates = ['vip7_captacao2']`
- `singleButtonIdx1Templates = ['visita_prova_envio', 'vip7_captacao', 'vip7_captacao3']`

#### 2. `supabase/functions/test-whatsapp/index.ts`
- Mesma alteracao: mover `VIP7_3_TEMPLATE_IDENTIFIER` de `singleButtonIdx0Templates` para `singleButtonIdx1Templates`

Resultado:
- `singleButtonIdx0Templates = [VIP7_2_TEMPLATE_IDENTIFIER]`
- `singleButtonIdx1Templates = [VISITA_TEMPLATE_IDENTIFIER, VIP7_TEMPLATE_IDENTIFIER, VIP7_3_TEMPLATE_IDENTIFIER]`

### Sem alteracao
- A omissao do parametro `nome` para `vip7_captacao3` permanece igual (correto)
- O template `vip7_captacao2` continua usando indice `[0]` (sem mudanca)
