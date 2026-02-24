

## Cadastrar novo template WhatsApp: `vip7_captacao2`

### Resumo
Adicionar o template `vip7_captacao2` como opção disponivel no sistema. Esse template tem apenas **1 botao dinamico** (opt-out no indice `[1]`) e **nao usa a variavel `{{nome}}`**, apenas `{{aviso}}` e `{{lembrete}}`.

### Alteracoes

#### 1. `src/lib/whatsapp-templates.ts`
- Adicionar constante `VIP7_2_TEMPLATE_IDENTIFIER = 'vip7_captacao2'`

#### 2. `supabase/functions/send-whatsapp/index.ts`
- Na condicao que verifica templates com 1 botao (linha 246), adicionar `vip7_captacao2` a lista:
  ```
  if (['visita_prova_envio', 'vip7_captacao', 'vip7_captacao2'].includes(templateIdentifier))
  ```
- Na parte que monta os `bodyParams`, adicionar condicao para templates sem `{{nome}}`:
  - Se o template for `vip7_captacao2`, **nao enviar** `bodyParams[nome]`
  - Enviar apenas `bodyParams[aviso]` e `bodyParams[lembrete]`

#### 3. `supabase/functions/test-whatsapp/index.ts`
- Adicionar constante para o novo template
- Garantir que o disparo de teste tambem respeite a logica de 1 botao e sem `{{nome}}`

### Detalhes tecnicos

A edge function `send-whatsapp` atualmente envia 3 bodyParams para todos os templates (`nome`, `aviso`, `lembrete`). Para o `vip7_captacao2`, o parametro `nome` sera omitido pois a Meta rejeita parametros nao esperados pelo template. A logica de botoes sera a mesma dos templates `visita_prova_envio` e `vip7_captacao` (apenas `buttonUrlDynamicParams[1]` com o token de opt-out).
