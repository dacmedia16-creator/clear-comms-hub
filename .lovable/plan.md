

## Configurar `visita_prova_envio4` igual ao `visita_prova_envio`

O template `visita_prova_envio` usa apenas 1 botão dinâmico no índice `[1]` (token de opt-out). Atualmente, `visita_prova_envio4` está caindo no bloco `else` (2 botões: `[0]` timeline + `[1]` opt-out), o que pode estar causando a falha de entrega.

### Alterações

#### 1. `supabase/functions/send-whatsapp/index.ts` (linha 281)
Adicionar `'visita_prova_envio4'` à lista `singleButtonIdx1Templates`:
```typescript
const singleButtonIdx1Templates = ['visita_prova_envio', 'visita_prova_envio4', 'vip7_captacao'];
```

#### 2. `supabase/functions/test-whatsapp/index.ts` (linha 126)
Mesma alteração para testes:
```typescript
const singleButtonIdx1Templates = [VISITA_TEMPLATE_IDENTIFIER, VISITA4_TEMPLATE_IDENTIFIER, VIP7_TEMPLATE_IDENTIFIER];
```

Isso faz o `visita_prova_envio4` enviar apenas `buttonUrlDynamicParams[1]` (opt-out), sem o botão `[0]` de timeline — igual ao `visita_prova_envio`.

