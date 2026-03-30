

## Correção definitiva: mapeamento de botões configurável por template

### Problema raiz

O template `visita_prova_envio2` retorna status 201 do Zion Talk mas a mensagem não chega ao WhatsApp. Isso acontece porque o mapeamento de botões dinâmicos está **hardcoded** nas Edge Functions (`send-whatsapp` e `test-whatsapp`), e `visita_prova_envio2` não está em nenhuma das listas especiais -- caindo no branch padrão de 2 botões, que provavelmente não corresponde à estrutura real desse template na Meta.

Hoje existem 3 categorias hardcoded:
- `singleButtonIdx0Templates` → vip7_captacao2, vip7_captacao3
- `singleButtonIdx1Templates` → visita_prova_envio, visita_prova_envio4, vip7_captacao
- Default (else) → 2 botões (slug + optout)

Cada novo template exige edição manual do código. Templates como `visita_prova_envio2` e `visita_prova_envio6` ficam sem mapeamento correto.

### Solução

Adicionar uma coluna `button_config` à tabela `whatsapp_senders` que define a estrutura de botões do template. A Edge Function lê essa config do DB em vez de usar listas hardcoded.

### Valores possíveis de `button_config`

| Valor | Comportamento | Templates |
|-------|--------------|-----------|
| `two_buttons` | btn[0]=slug, btn[1]=optout | aviso_pro_confirma_3, visita_prova_envio3 |
| `single_button_idx0` | btn[0]=optout, sem nome | vip7_captacao2, vip7_captacao3 |
| `single_button_idx1` | btn[1]=optout | visita_prova_envio, visita_prova_envio4, vip7_captacao |
| `no_buttons` | Nenhum botão dinâmico | Templates sem botão |

### Alterações

1. **Migração SQL**: Adicionar coluna `button_config text not null default 'two_buttons'` à tabela `whatsapp_senders`. Adicionar coluna `has_nome_param boolean not null default true` (para controlar se envia `bodyParams[nome]`).

2. **Edge Function `send-whatsapp`**: Ler `button_config` e `has_nome_param` do sender (já buscado na `resolveAuthHeader`). Substituir as listas hardcoded por lógica baseada nesses campos.

3. **Edge Function `test-whatsapp`**: Mesma lógica -- ler config do sender e usar para montar o payload de teste.

4. **UI do sender (AddWhatsAppSenderDialog + EditWhatsAppSenderDialog)**: Adicionar select para `button_config` e checkbox para `has_nome_param`, com descrições claras.

5. **WhatsAppSendersCard**: Exibir a config de botões na tabela.

6. **Atualizar sender atual**: UPDATE do registro "Visita Prova" com o `button_config` correto para `visita_prova_envio2` (precisa saber qual é -- provavelmente `single_button_idx1` baseado no padrão dos outros templates "visita_prova").

### Detalhes técnicos

- A coluna `button_config` substitui completamente as listas hardcoded `singleButtonIdx0Templates` e `singleButtonIdx1Templates`
- A coluna `has_nome_param` substitui a lista hardcoded `noNomeTemplates`
- Fallback para `two_buttons` e `has_nome_param=true` mantém compatibilidade com templates existentes
- Nenhuma alteração na lógica de deduplicação, pause/resume ou broadcast

