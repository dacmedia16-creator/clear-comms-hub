

## Adicionar template `vip7_captacao`

O novo template tem a mesma estrutura do `visita_prova_envio`: apenas 1 botao dinamico de URL (opt-out) no indice `[1]`.

### Alteracoes

**1. `supabase/functions/test-whatsapp/index.ts`**
- Adicionar constante `VIP7_TEMPLATE_IDENTIFIER = 'vip7_captacao'`
- Atualizar a condicao do `if` para incluir o novo template:
  ```
  if (templateToUse === VISITA_TEMPLATE_IDENTIFIER || templateToUse === VIP7_TEMPLATE_IDENTIFIER)
  ```
  Isso garante que o teste envia apenas `buttonUrlDynamicParams[1]` (sem o `[0]` da timeline).

**2. `supabase/functions/send-whatsapp/index.ts`**
- Adicionar a mesma logica na funcao `processBatch`:
  ```
  if (templateIdentifier === 'visita_prova_envio' || templateIdentifier === 'vip7_captacao')
  ```
  Isso garante que o disparo real tambem envia apenas `buttonUrlDynamicParams[1]` com o token de opt-out.

**3. `src/lib/whatsapp-templates.ts`**
- Exportar a nova constante para referencia no frontend:
  ```typescript
  export const VIP7_TEMPLATE_IDENTIFIER = 'vip7_captacao';
  ```

### Resultado

Ao configurar `vip7_captacao` como `template_identifier` de um remetente na tabela `whatsapp_senders`, o sistema enviara automaticamente o payload correto com apenas 1 botao dinamico (opt-out).

### Deploy

As duas Edge Functions serao redeployadas automaticamente apos a alteracao.
