
## Problema raiz identificado

O código atual detecta qual template usar com base no nome do sender:
```typescript
const templateIdentifier = senderInfo.senderName.toLowerCase().includes('visita')
  ? 'visita_prova_envio'
  : TEMPLATE_IDENTIFIER;
```

Isso é frágil e não permite corrigir o identificador sem alterar o código. Se o template no Zion Talk tiver um nome diferente do que está hardcoded (`visita_prova_envio`), a mensagem pode ser aceita com `201` mas nunca entregue.

A solução é deixar o Super Admin configurar o `template_identifier` exato para cada número diretamente no painel.

## O que será feito

### 1. Migração de banco de dados

Adicionar coluna `template_identifier` na tabela `whatsapp_senders`:

```sql
ALTER TABLE whatsapp_senders 
ADD COLUMN template_identifier text;
```

Valor `NULL` significa: usar o template padrão (`aviso_pro_confirma_3`).

### 2. Hook `useWhatsAppSenders.ts`

Adicionar `template_identifier` nas interfaces `WhatsAppSender` e `CreateWhatsAppSender`.

### 3. Dialogs de Add e Edit

Adicionar campo opcional "Identificador do Template" nos dois dialogs, com placeholder `aviso_pro_confirma_3` e texto de ajuda explicando que deve ser copiado do painel Zion Talk.

### 4. `supabase/functions/send-whatsapp/index.ts`

Substituir a detecção por nome pelo campo do banco:

```typescript
// ANTES (frágil):
const templateIdentifier = senderInfo.senderName.toLowerCase().includes('visita')
  ? 'visita_prova_envio'
  : TEMPLATE_IDENTIFIER;

// DEPOIS (configurável):
const templateIdentifier = senderInfo.templateIdentifier ?? TEMPLATE_IDENTIFIER;
```

A lógica de `buttonUrlDynamicParams` continua: só envia se o template for `aviso_pro_confirma_3` (ou seja, se não for o padrão). Mas ficará mais flexível: o botão só é adicionado se o template for igual ao `TEMPLATE_IDENTIFIER`.

### 5. `supabase/functions/test-whatsapp/index.ts`

Mesma substituição — usar `sender.template_identifier` quando disponível.

A lógica dos parâmetros numéricos vs. nomeados **mantém o comportamento atual**: o `aviso_pro_confirma_3` usa nomes, qualquer outro template usa índices numéricos posicionais.

## Arquivos modificados

- Migração SQL: adicionar coluna `template_identifier` em `whatsapp_senders`
- `src/hooks/useWhatsAppSenders.ts` — adicionar campo na interface
- `src/components/super-admin/AddWhatsAppSenderDialog.tsx` — campo template_identifier
- `src/components/super-admin/EditWhatsAppSenderDialog.tsx` — campo template_identifier
- `src/components/super-admin/WhatsAppSendersCard.tsx` — exibir o template na tabela
- `supabase/functions/send-whatsapp/index.ts` — usar template do banco
- `supabase/functions/test-whatsapp/index.ts` — usar template do banco

## Resultado

O Super Admin poderá editar o sender "Visita Prova" e preencher o campo com o identificador exato copiado do Zion Talk (ex: `visita_prova_envio` ou o nome correto). Sem necessidade de alterar código para corrigir.
