
## Diagnóstico do problema

Os logs confirmam que o payload está sendo enviado corretamente com `status=201` para o template `visita_prova_envio`. O `201` significa que a Zion Talk **aceitou** a requisição, mas a mensagem **não está sendo entregue**. Isso é um problema do lado da Zion Talk/Meta, não do código em si.

Porém, há um problema de design no código atual que pode estar causando falhas silenciosas: a lógica de parâmetros do template ainda é hardcoded e não é totalmente genérica.

## Mudança proposta: tornar os parâmetros 100% configuráveis por sender

Adicionar um campo `param_style` (enum: `named` ou `numeric`) na tabela `whatsapp_senders` e no painel do Super Admin. Assim:

- **`named`**: usa `bodyParams[nome]`, `bodyParams[aviso]`, `bodyParams[lembrete]` + botões dinâmicos (estilo `aviso_pro_confirma_3`)
- **`numeric`**: usa `bodyParams[1]`, `bodyParams[2]`, `bodyParams[3]` sem botões (estilo `visita_prova_envio`)

Isso elimina completamente qualquer hardcode de nomes de template no código.

### Além disso: adicionar log do número de destino no disparo de teste

Atualmente o disparo de teste envia sempre para `+5515981788214`. Adicionar um campo de telefone configurável no dialog de teste para que o Super Admin possa testar para qualquer número.

## O que será feito

### 1. Migração de banco de dados

```sql
ALTER TABLE whatsapp_senders 
ADD COLUMN IF NOT EXISTS param_style text NOT NULL DEFAULT 'named';
```

- `named` = default (compatível com `aviso_pro_confirma_3`)
- `numeric` = para templates com parâmetros posicionais como `visita_prova_envio`

### 2. UI: `AddWhatsAppSenderDialog.tsx` e `EditWhatsAppSenderDialog.tsx`

Adicionar um campo select "Estilo de Parâmetros":
- **Nomeados** (padrão) — bodyParams[nome], bodyParams[aviso]...
- **Posicionais** — bodyParams[1], bodyParams[2], bodyParams[3]

### 3. `supabase/functions/test-whatsapp/index.ts`

Remover completamente `VISITA_TEMPLATE_IDENTIFIER` e usar `sender.param_style`:

```typescript
const paramStyle = sender.param_style ?? 'named';
const useButtons = paramStyle === 'named';

if (paramStyle === 'numeric') {
  formData.append('bodyParams[1]', 'Teste');
  formData.append('bodyParams[2]', 'Mensagem de teste do sistema');
  formData.append('bodyParams[3]', 'Se você recebeu esta mensagem...');
} else {
  formData.append('bodyParams[nome]', 'Teste');
  formData.append('bodyParams[aviso]', 'Mensagem de teste do sistema');
  formData.append('bodyParams[lembrete]', 'Se você recebeu...');
  formData.append('buttonUrlDynamicParams[0]', 'c/demo');
  formData.append('buttonUrlDynamicParams[1]', 'test-demo');
}
```

### 4. `supabase/functions/send-whatsapp/index.ts`

Mesma lógica: usar `sender.param_style` ao invés de comparar string do `templateIdentifier`.

### 5. `WhatsAppSendersCard.tsx`

Exibir o `param_style` na tabela (ex: badge "nomeado" ou "posicional").

### 6. `useWhatsAppSenders.ts`

Adicionar `param_style` nas interfaces.

## Arquivos modificados

- Migração SQL: adicionar coluna `param_style` em `whatsapp_senders`
- `src/hooks/useWhatsAppSenders.ts` — adicionar campo na interface
- `src/components/super-admin/AddWhatsAppSenderDialog.tsx` — select param_style
- `src/components/super-admin/EditWhatsAppSenderDialog.tsx` — select param_style
- `src/components/super-admin/WhatsAppSendersCard.tsx` — exibir param_style
- `supabase/functions/test-whatsapp/index.ts` — usar param_style do banco
- `supabase/functions/send-whatsapp/index.ts` — usar param_style do banco

## Resultado

Zero hardcode de nomes de templates. O Super Admin configura o estilo de parâmetro direto no painel ao cadastrar o número, e tanto o disparo real quanto o teste usarão a configuração correta automaticamente.
