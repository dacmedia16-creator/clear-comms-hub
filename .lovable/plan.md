
## Objetivo

Adicionar mais um número de WhatsApp para envio usando a estrutura que já existe no sistema.

## O que já existe hoje

O projeto já tem suporte para múltiplos números de WhatsApp:
- Cadastro de números em `whatsapp_senders`
- Tela de Super Admin com botão `Adicionar Número`
- Configuração de número ativo e número padrão
- Templates por número em `whatsapp_sender_templates`

Arquivos já preparados para isso:
- `src/components/super-admin/AddWhatsAppSenderDialog.tsx`
- `src/components/super-admin/WhatsAppSendersCard.tsx`
- `src/hooks/useWhatsAppSenders.ts`
- `src/components/super-admin/SenderTemplatesDialog.tsx`

## Plano

1. Usar a tela já existente em **Super Admin > Notificações**
   - Abrir o card **Números de WhatsApp**
   - Clicar em **Adicionar Número**

2. Cadastrar o novo número com os campos já suportados
   - Nome identificador
   - Telefone com DDD
   - API Key do provedor
   - Template principal opcional
   - Configuração de botões
   - Se usa parâmetro `nome`
   - Status ativo
   - Se será o número padrão ou não

3. Validar o comportamento do novo número
   - Confirmar que ele aparece na tabela
   - Confirmar se ficou ativo
   - Confirmar se deve ou não virar padrão
   - Se necessário, abrir **Gerenciar templates** para adicionar templates específicos desse número

4. Testar envio
   - Fazer teste por template via diálogo de templates
   - Validar se o envio sai com o número novo sem afetar o número atual

## Resultado esperado

- O sistema passa a ter mais de um número cadastrado para disparo
- Você pode manter um como padrão e outro como alternativa
- Cada número pode ter seus próprios templates

## Se houver bloqueio ao cadastrar

Se o botão existir mas salvar der erro, a próxima implementação deve focar em:
- validar permissões de Super Admin na tabela `whatsapp_senders`
- revisar mensagens de erro do `createSender`
- conferir consistência entre os campos enviados pelo formulário e os campos realmente persistidos
- opcionalmente adicionar validação melhor de telefone e feedback mais claro para falhas de cadastro

## Detalhes técnicos

Fluxo atual de criação:
- `AddWhatsAppSenderDialog` envia `name`, `phone`, `api_key`, `is_active`, `is_default`, `template_identifier`, `button_config`, `has_nome_param`
- `useWhatsAppSenders.createSender()` hoje insere no banco apenas:
  - `name`
  - `phone`
  - `api_key`
  - `is_active`
  - `is_default`

Melhoria recomendada na próxima execução:
- incluir também no `insert`:
  - `template_identifier`
  - `button_config`
  - `has_nome_param`

Assim o novo número já nasce totalmente configurado, sem perder os campos extras do formulário.
