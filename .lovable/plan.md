

## Corrigir nome do parâmetro do botão CTA

Trocar `buttonParams[0]` por `buttonUrlDynamicParams[0]` nas duas Edge Functions.

### Alterações

**Arquivo 1: `supabase/functions/test-whatsapp/index.ts`** (linha 105)
- `buttonParams[0]` → `buttonUrlDynamicParams[0]`

**Arquivo 2: `supabase/functions/send-whatsapp/index.ts`** (linha 105)
- `buttonParams[0]` → `buttonUrlDynamicParams[0]`

### Após a correção
- Re-deploy automático das duas edge functions
- Teste de envio para validar entrega

