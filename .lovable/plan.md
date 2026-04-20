

User corrigindo: Botão 1 estático, Botão 2 **dinâmico** (com `{{1}}`). Releitura da imagem confirma — "Bloquear Contato" provavelmente tem URL `https://avisopro.com.br/optout?t={{1}}` recebendo o token, igual ao template padrão.

Então a config correta É `single_button_idx1` (que já apliquei no `whatsapp_sender_templates` para `remax_corretor`). O problema é que o teste pelo Super Admin usa `test-whatsapp`, que lê do **sender** (não do template).

## Diagnóstico real

Logs mais recentes mostraram `button_config: two_buttons` no envio de teste — porque a função `test-whatsapp` lê `whatsapp_senders.button_config`, ignorando o template selecionado.

Duas opções para fazer o teste do `remax_corretor` funcionar:

**Opção A — corrigir test-whatsapp** (correto a longo prazo)
Modificar `test-whatsapp/index.ts` para aceitar `templateId` opcional no body e ler config de `whatsapp_sender_templates` quando passado, igual à `send-whatsapp`. Atualizar UI do `SenderTemplatesDialog` (ou onde está o botão Testar do template) para passar `templateId`.

**Opção B — envio real via SendWhatsAppButton**
Não mexer no código. Criar um anúncio de teste e enviar pelo botão do anúncio escolhendo `remax_corretor` no dropdown — esse fluxo (`send-whatsapp`) já lê config do template corretamente.

## Recomendação: Opção A

Sem ela, todo template novo com config diferente do sender vai falhar no teste e gerar confusão. Mudança pequena e isolada.

## Mudanças

1. **`supabase/functions/test-whatsapp/index.ts`**
   - Aceitar `templateId?: string` no body
   - Se `templateId` presente: buscar `whatsapp_sender_templates` por id, sobrescrever `templateToUse`, `buttonConfig`, `hasNomeParam`, `param_style`
   - Manter fallback atual (sender defaults) quando não vier `templateId`

2. **UI do botão Testar de template** (provavelmente `src/components/super-admin/SenderTemplatesDialog.tsx`)
   - Passar `templateId` no invoke do `test-whatsapp`

3. Verificar se a função respeita `param_style` (named vs positional) — campo já existe na tabela mas pode não estar sendo usado. Confirmar antes de mexer.

## Pré-requisito
Confirmar onde está o botão "Testar" do template (vou ler `SenderTemplatesDialog.tsx` na próxima loop).

## Ações
1. Ler `SenderTemplatesDialog.tsx` para localizar botão Testar
2. Editar `test-whatsapp/index.ts` (aceitar `templateId`)
3. Editar UI do botão Testar (passar `templateId`)
4. Você testa novamente o `remax_corretor` pelo botão Testar do template

