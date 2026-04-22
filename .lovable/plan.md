
## Objetivo

Adicionar suporte completo a “número de envio” para WhatsApp em três pontos:
1. cadastro/gestão do número remetente,
2. escolha do número no momento do disparo,
3. exibição do número usado no monitor do broadcast.

## O que já existe

O projeto já tem base pronta para isso:
- tabela `whatsapp_senders` com `name`, `phone`, `api_key`, `is_active`, `is_default`
- tabela `whatsapp_sender_templates` ligada ao número
- tela de Super Admin para gerenciar números
- envio com seleção por template
- monitor de WhatsApp com pause/resume

Hoje, porém, a experiência ainda está incompleta:
- o cadastro de número não salva todos os campos já mostrados no formulário
- o envio escolhe template, não o número de forma explícita
- o monitor não mostra qual número disparou
- o broadcast não guarda o remetente usado

## Implementação proposta

### 1. Corrigir o cadastro do número remetente
Ajustar o hook `useWhatsAppSenders` para realmente persistir os campos já existentes no formulário:
- `template_identifier`
- `button_config`
- `has_nome_param`
- `param_style` quando aplicável

Resultado:
- ao adicionar/editar um número, tudo o que o Super Admin configurou passa a ser salvo corretamente
- a listagem de números reflete fielmente a configuração usada pelo disparo

### 2. Permitir escolher o número no envio
Na UI de disparo do WhatsApp, trocar a lógica de “escolher template” por uma hierarquia mais clara:

#### Opção recomendada
- primeiro escolher o número remetente ativo
- depois, se esse número tiver múltiplos templates, escolher o template daquele número
- se houver apenas 1 template ou template padrão, disparar direto

Fluxo:
```text
Enviar WhatsApp
  -> escolher número remetente
      -> escolher template desse número (se necessário)
          -> iniciar broadcast
```

Isso evita confusão entre “template” e “número”.

### 3. Salvar no broadcast qual número foi usado
Adicionar colunas no backend para rastreamento do remetente usado em cada disparo, por exemplo:
- `sender_id`
- `sender_name_snapshot`
- `sender_phone_snapshot`
- opcionalmente `template_id` / `template_label_snapshot`

Esses snapshots evitam perder histórico caso o número seja editado depois.

### 4. Fazer o envio usar o número explicitamente
Atualizar o fluxo do `send-whatsapp` para aceitar um remetente escolhido:
- receber `senderId` e opcionalmente `templateId`
- se vier `templateId`, validar que ele pertence ao `senderId`
- se vier só `senderId`, usar o template padrão dele ou fallback configurado
- gravar no `whatsapp_broadcasts` o número/template usados

### 5. Mostrar o número usado no monitor
Atualizar `WhatsAppMonitor` para exibir no cabeçalho do broadcast:
- nome do número remetente
- telefone
- template usado, se houver

Exemplo visual:
```text
Monitor de Envios WhatsApp
Número: Remax Principal
Telefone: (11) 99999-9999
Template: remax_corretor
```

### 6. Mostrar o número usado na lista persistente de broadcasts
Ajustar `useActiveBroadcasts` e `ActiveBroadcastsBanner` para buscar e exibir o remetente do broadcast ativo.
Assim, mesmo se o monitor sumir:
- o banner continua visível
- o usuário sabe qual número está disparando
- consegue reabrir e finalizar com contexto

### 7. Refinar a gestão no Super Admin
Na tela `WhatsAppSendersCard`, melhorar a leitura com:
- coluna “Template padrão”
- indicação mais clara de número padrão
- status ativo/inativo
- telefone formatado
- consistência entre o que é cadastrado e o que realmente é usado no envio

## Arquivos principais envolvidos

- `src/hooks/useWhatsAppSenders.ts`
- `src/components/super-admin/AddWhatsAppSenderDialog.tsx`
- `src/components/super-admin/EditWhatsAppSenderDialog.tsx`
- `src/components/super-admin/WhatsAppSendersCard.tsx`
- `src/components/SendWhatsAppButton.tsx`
- `src/components/WhatsAppMonitor.tsx`
- `src/hooks/useActiveBroadcasts.ts`
- `src/components/ActiveBroadcastsBanner.tsx`
- função de backend `supabase/functions/send-whatsapp/index.ts`
- migration para ampliar `whatsapp_broadcasts`

## Mudanças de backend

Será necessária uma migration para ampliar `whatsapp_broadcasts` com os campos do remetente/template usados no disparo.

Também vou revisar as políticas atuais dessa tabela, porque hoje ela está muito aberta (`SELECT/UPDATE` amplo para autenticados). A ideia é manter o recurso funcionando, mas com acesso alinhado ao condomínio correto.

## Resultado esperado

Depois da implementação:
- você cadastra vários números de envio
- escolhe claramente qual número usar ao disparar
- o broadcast salva qual número foi usado
- o monitor mostra esse número
- o banner persistente também mostra
- mesmo se o painel sumir, dá para reabrir e saber exatamente qual número está rodando

## Detalhes técnicos

- O modelo atual já separa “número” (`whatsapp_senders`) de “template” (`whatsapp_sender_templates`); a mudança principal é expor isso melhor na UI e registrar no broadcast.
- Vou usar snapshots no broadcast para preservar histórico mesmo se o número for editado depois.
- O monitor continuará compatível com pause/resume/finalização.
- A seleção no envio será filtrada apenas para números ativos.
