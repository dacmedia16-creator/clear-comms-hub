
## Objetivo

Fazer o canal `REMAX 2` usar a configuração de botões `single_button_idx1`.

## Estado atual identificado

- O sender `REMAX 2` existe em `whatsapp_senders`
- Hoje ele está com:
  - `button_config = 'two_buttons'`
  - `template_identifier = 'remax_corretor2'`
- Já existe um template `remax_corretor` em `whatsapp_sender_templates` com:
  - `button_config = 'single_button_idx1'`
- Esse template `remax_corretor` está ligado a outro sender, não ao `REMAX 2`

## O que vou ajustar

### 1. Corrigir a configuração do canal `REMAX 2`
Atualizar o registro do sender `REMAX 2` para:
- `button_config = 'single_button_idx1'`

Isso garante que, quando o envio usar a configuração do próprio canal, o payload coloque o token no botão índice 1.

### 2. Validar o template padrão do canal
Revisar se o `REMAX 2` deve continuar usando `template_identifier = 'remax_corretor2'`.

Se a intenção for manter o template atual:
- deixar `remax_corretor2`
- apenas alinhar o `button_config` do canal para `single_button_idx1`

Se a intenção for usar exatamente o template `remax_corretor`:
- também atualizar o identificador/template padrão do canal para esse template
- ou cadastrar esse template dentro dos templates do próprio sender `REMAX 2`

### 3. Melhorar a consistência da UI
Ajustar a interface de Super Admin para reduzir confusão entre:
- configuração do canal (`whatsapp_senders.button_config`)
- configuração do template (`whatsapp_sender_templates.button_config`)

Melhoria proposta:
- exibir claramente quando o envio usa configuração do número vs. do template
- mostrar o template padrão real do sender
- evitar a impressão de que um template de outro sender está sendo usado pelo `REMAX 2`

## Implementação técnica

### Banco / dados
Aplicar atualização no sender `REMAX 2`:
- tabela `whatsapp_senders`
- campo `button_config = 'single_button_idx1'`

Opcionalmente, se confirmado no fluxo:
- ajustar `template_identifier`
- criar/editar template default do sender `REMAX 2` em `whatsapp_sender_templates`

### Código
Revisar estes pontos para manter coerência:
- `src/hooks/useWhatsAppSenders.ts`
- `src/components/super-admin/WhatsAppSendersCard.tsx`
- `src/components/super-admin/EditWhatsAppSenderDialog.tsx`
- `src/components/super-admin/SenderTemplatesDialog.tsx`
- `supabase/functions/send-whatsapp/index.ts`

## Resultado esperado

Depois da correção:
- o canal `REMAX 2` passa a operar com `single_button_idx1`
- o envio deixa de usar o mapeamento visual antigo de `two_buttons`
- a tela de administração fica mais clara sobre qual configuração está valendo

## Ordem de execução

1. Atualizar `REMAX 2` para `single_button_idx1`
2. Verificar se o template padrão correto é `remax_corretor2` ou `remax_corretor`
3. Ajustar a UI para refletir melhor a origem da configuração
4. Validar um disparo de teste com o canal `REMAX 2`
