
## Objetivo

Fazer o canal `REMAX 2` enviar usando o template sem o parâmetro `nome`.

## Diagnóstico confirmado

Hoje o `REMAX 2` está configurado no nível do canal com:
- `template_identifier = remax_corretor2`
- `button_config = single_button_idx1`
- `has_nome_param = true`

Como não existe template padrão vinculado em `whatsapp_sender_templates` para esse sender, o envio está usando os parâmetros do próprio canal. Por isso a função `send-whatsapp` ainda monta:

```text
bodyParams[nome]
bodyParams[aviso]
bodyParams[lembrete]
buttonUrlDynamicParams[1]
```

Se o template `remax_corretor2` não aceita `nome`, essa flag precisa ser corrigida para `false`.

## O que vou ajustar

### 1. Corrigir a configuração do canal `REMAX 2`
Atualizar o registro do sender `REMAX 2` para:
- `has_nome_param = false`

Isso fará a função parar de enviar `bodyParams[nome]` para esse canal.

### 2. Manter os demais parâmetros do canal
Preservar a configuração já correta:
- `template_identifier = remax_corretor2`
- `button_config = single_button_idx1`

Assim a mudança fica restrita apenas ao que está errado no payload.

### 3. Melhorar a leitura da interface
Ajustar a card/listagem dos números para mostrar o indicador `sem nome` com base na configuração efetiva do envio:
- se existir template padrão do sender, usar `default_template_has_nome_param`
- senão usar `has_nome_param` do próprio número

Hoje a tela pode induzir erro porque parte da UI olha só para o campo do número, mesmo quando existe lógica de precedência por template.

### 4. Validar consistência com o teste de WhatsApp
Revisar o fluxo de teste (`test-whatsapp`) para garantir que ele também respeita `has_nome_param = false` no `REMAX 2`, evitando divergência entre teste e envio real.

## Implementação técnica

### Banco / dados
Aplicar atualização no sender `REMAX 2`:
- tabela `whatsapp_senders`
- campo `has_nome_param = false`

### Código
Revisar estes pontos:
- `supabase/functions/send-whatsapp/index.ts`  
  Confirmar que com `hasNomeParam = false` o campo `bodyParams[nome]` não é enviado.
- `supabase/functions/test-whatsapp/index.ts`  
  Confirmar que o teste usa a mesma regra.
- `src/hooks/useWhatsAppSenders.ts`  
  Garantir que a UI receba os campos efetivos de template/número.
- `src/components/super-admin/WhatsAppSendersCard.tsx`  
  Exibir corretamente o badge `sem nome` com base na configuração efetiva.

## Resultado esperado

Depois da correção, o canal `REMAX 2` passará a enviar:
```text
bodyParams[aviso]
bodyParams[lembrete]
buttonUrlDynamicParams[1]
```

E deixará de enviar:
```text
bodyParams[nome]
```

## Ordem de execução

1. Atualizar `REMAX 2` para `has_nome_param = false`
2. Validar que `send-whatsapp` já respeita essa flag
3. Ajustar a UI para refletir o estado efetivo do canal
4. Validar com envio de teste do `REMAX 2`
