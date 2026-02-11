

# Migrar WhatsApp para API Oficial Meta (send_template_message)

## Resumo

Atualizar as Edge Functions `test-whatsapp` e `send-whatsapp` para usar o endpoint `send_template_message` da Zion Talk com o template aprovado `aviso_informativo`, substituindo o endpoint generico `send_message` que estava causando erros 503.

## O que muda

1. **Endpoint**: `send_message` --> `send_template_message`
2. **Formato**: Em vez de enviar texto livre, envia o `template_identifier` + parametros dinamicos via `bodyParams`
3. **Template**: `aviso_informativo` (categoria Utilidade, aprovado na Meta)
4. **Variaveis**:
   - `bodyParams[nome]` -- nome do destinatario
   - `bodyParams[aviso]` -- titulo do aviso
   - `bodyParams[lembrete]` -- resumo do aviso

## Arquivos alterados

### 1. `supabase/functions/test-whatsapp/index.ts`
- Trocar URL de `send_message/` para `send_template_message/`
- Substituir o campo `msg` por:
  - `template_identifier` = `aviso_informativo`
  - `language` = `pt_BR`
  - `bodyParams[nome]` = `"Teste"`
  - `bodyParams[aviso]` = `"Mensagem de teste do sistema"`
  - `bodyParams[lembrete]` = `"Se voce recebeu esta mensagem, a integracao esta funcionando corretamente!"`
- Manter `mobile_phone` igual
- Remover a constante `TEST_MESSAGE` (texto livre nao sera mais usado)

### 2. `supabase/functions/send-whatsapp/index.ts`
- Trocar URL de `send_message/` para `send_template_message/`
- Na funcao `sendMessagesInBackground`, substituir o envio de `msg` por:
  - `template_identifier` = `aviso_informativo`
  - `language` = `pt_BR`
  - `bodyParams[nome]` = nome do membro (ou "morador(a)")
  - `bodyParams[aviso]` = titulo do aviso (`announcement.title`)
  - `bodyParams[lembrete]` = resumo do aviso (`announcement.summary` ou fallback)
- Remover a funcao `generateMessage()` e a constante `WHATSAPP_UNIVERSAL_TEMPLATE` (o template agora fica na Meta)
- Manter toda logica de background processing, delays, logs e targeting

### 3. `src/lib/whatsapp-templates.ts`
- Atualizar para refletir que o template agora e gerenciado pela Meta
- Manter a funcao `generateWhatsAppMessage` apenas para preview local (ex: mostrar ao gestor como ficara a mensagem)
- Adicionar constante `TEMPLATE_IDENTIFIER = 'aviso_informativo'`

## O que NAO muda

- Logica de priorizacao de senders (DB primeiro, ENV fallback)
- Autenticacao Basic Auth
- Background processing com `EdgeRuntime.waitUntil()`
- Delays de 15-30s entre envios
- Logs na tabela `whatsapp_logs`
- Filtragem por blocos/unidades
- Personalizacao com nome do destinatario

## Detalhes tecnicos

Formato do FormData para `send_template_message`:

```text
mobile_phone: +5515981788214
template_identifier: aviso_informativo
language: pt_BR
bodyParams[nome]: Joao Silva
bodyParams[aviso]: Reuniao de condominios amanha
bodyParams[lembrete]: Compareça as 19h no salao de festas
```

## Teste

Apos a implementacao, sera feita uma chamada de teste para o numero `15981788214` usando o novo endpoint para validar que o erro 503 foi resolvido.

