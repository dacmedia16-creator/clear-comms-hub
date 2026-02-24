

## Reverter vip7_captacao3 para usar buttonUrlDynamicParams[0]

O template `vip7_captacao3` deve usar a mesma configuracao do `vip7_captacao2`, ou seja, `buttonUrlDynamicParams[0]` para o token de opt-out.

### Alteracoes

Reverter as duas mudancas feitas anteriormente:

#### 1. `supabase/functions/send-whatsapp/index.ts` (linha 249-250)
- `singleButtonIdx0Templates = ['vip7_captacao2', 'vip7_captacao3']`
- `singleButtonIdx1Templates = ['visita_prova_envio', 'vip7_captacao']`

#### 2. `supabase/functions/test-whatsapp/index.ts` (linha 123-124)
- `singleButtonIdx0Templates = [VIP7_2_TEMPLATE_IDENTIFIER, VIP7_3_TEMPLATE_IDENTIFIER]`
- `singleButtonIdx1Templates = [VISITA_TEMPLATE_IDENTIFIER, VIP7_TEMPLATE_IDENTIFIER]`

Isso restaura a configuracao original onde ambos os templates captacao2 e captacao3 usam indice `[0]`.
