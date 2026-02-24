

## Corrigir indice do botao dinamico para vip7_captacao2

### Problema
O template `vip7_captacao2` tem apenas 1 botao dinamico ("Bloquear Contato") com `{{1}}`. O codigo atual envia `buttonUrlDynamicParams[1]`, mas como este template tem um unico botao, o Zion Talk provavelmente espera o parametro no indice `[0]`.

### Solucao
Separar o `vip7_captacao2` dos outros templates de botao unico e usar `buttonUrlDynamicParams[0]` em vez de `[1]`.

### Alteracoes

#### 1. `supabase/functions/send-whatsapp/index.ts`
- Alterar a logica de botoes para que `vip7_captacao2` use `buttonUrlDynamicParams[0]` com o token de opt-out
- Manter `visita_prova_envio` e `vip7_captacao` usando `buttonUrlDynamicParams[1]` como antes

#### 2. `supabase/functions/test-whatsapp/index.ts`
- Mesma alteracao: `vip7_captacao2` usa `buttonUrlDynamicParams[0]` no teste

### Detalhes tecnicos
A logica de botoes passara a ter 3 caminhos:
1. Templates com 2 botoes (padrao): `[0]` = slug, `[1]` = optout
2. Templates `visita_prova_envio` / `vip7_captacao`: `[1]` = optout
3. Template `vip7_captacao2`: `[0]` = optout

Apos a alteracao, um novo disparo de teste sera feito para confirmar a entrega.
