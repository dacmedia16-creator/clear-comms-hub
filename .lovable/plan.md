

## Cadastrar template vip7_captacao3

### Resumo
Adicionar suporte ao novo template `vip7_captacao3` no sistema. Este template e identico ao `vip7_captacao2` em termos de payload: sem parametro `nome`, com `aviso` e `lembrete`, e botao dinamico "Bloquear Contato" no indice `[0]`. Os 3 botoes de resposta rapida (Disponivel, Em negociacao, Fora do mercado) sao Quick Reply e nao precisam de parametros no payload.

### Alteracoes

#### 1. `src/lib/whatsapp-templates.ts`
- Adicionar constante `VIP7_3_TEMPLATE_IDENTIFIER = 'vip7_captacao3'`

#### 2. `supabase/functions/send-whatsapp/index.ts`
- Adicionar `vip7_captacao3` na lista `noNomeTemplates` (para omitir o parametro `nome`)
- Adicionar `vip7_captacao3` junto com `vip7_captacao2` na condicao de botao indice `[0]`

#### 3. `supabase/functions/test-whatsapp/index.ts`
- Adicionar constante `VIP7_3_TEMPLATE_IDENTIFIER`
- Adicionar na lista `noNomeTemplates`
- Adicionar na condicao de botao indice `[0]` junto com `vip7_captacao2`

### Detalhes tecnicos
As listas de tratamento especial ficarao assim:
- **Sem `nome`**: `vip7_captacao2`, `vip7_captacao3`
- **Botao indice `[0]`**: `vip7_captacao2`, `vip7_captacao3`
- **Botao indice `[1]`**: `visita_prova_envio`, `vip7_captacao`
- **2 botoes (padrao)**: `aviso_pro_confirma_3` e demais

Os botoes Quick Reply do template nao requerem nenhuma alteracao no codigo, pois sao gerenciados inteiramente pela Meta.
