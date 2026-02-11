

# Salvar Telefone Normalizado nos Logs de WhatsApp

## Problema Atual

A Edge Function `send-whatsapp` normaliza o telefone para o formato `+55XXXXXXXXXXX` antes de enviar pela API, mas o log registra o numero no formato original do banco (ex: `15 98100-8180`). Isso dificulta buscas e comparacoes nos logs.

## Solucao

Alterar o registro de logs na funcao `sendMessagesInBackground` para usar o telefone ja normalizado (campo `phone` do objeto `UnifiedMember`), que ja esta no formato `+55XXXXXXXXXXX` desde a correcao anterior.

## Arquivo alterado

### `supabase/functions/send-whatsapp/index.ts`

O telefone ja esta normalizado no objeto `member.phone` (aplicado no mapeamento). O log ja usa `member.phone` para o campo `recipient_phone`. Porem, preciso verificar se o log realmente esta gravando o valor normalizado ou o original.

Apos verificacao: como `member.phone` ja recebe `normalizePhone(source.phone)` no mapeamento, os logs ja devem estar salvando o formato normalizado. Se nao estiver, a correcao sera garantir que `recipient_phone` use `member.phone` (normalizado) em todos os pontos de insert na tabela `whatsapp_logs`.

Nenhuma alteracao de schema e necessaria -- apenas confirmacao e eventual ajuste no codigo da Edge Function.
