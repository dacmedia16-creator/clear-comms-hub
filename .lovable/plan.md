
## Objetivo

Remover os parâmetros de botão dinâmico (`buttonUrlDynamicParams`) do payload quando o template `visita_prova_envio` é usado, já que este template tem URL fixa configurada na Meta e não aceita parâmetros dinâmicos.

## Diagnóstico

O template `aviso_pro_confirma_3` usa dois botões com URLs dinâmicas (slug do condomínio + token de opt-out). Quando o código envia `buttonUrlDynamicParams[0]` e `buttonUrlDynamicParams[1]` para um template com URL fixa, a Meta pode rejeitar ou ignorar a mensagem silenciosamente — mesmo que a API Zion Talk retorne `201`.

A solução é não enviar esses campos quando o template `visita_prova_envio` está sendo usado.

## O que será alterado

### `supabase/functions/send-whatsapp/index.ts` — função `processBatch`

Na montagem do FormData, adicionar uma condição: só appenda `buttonUrlDynamicParams` se o template **não** for `visita_prova_envio`:

```typescript
formData.append('mobile_phone', member.phone);
formData.append('template_identifier', templateIdentifier);
formData.append('language', TEMPLATE_LANGUAGE);
formData.append('bodyParams[nome]', member.full_name || 'morador(a)');
formData.append('bodyParams[aviso]', announcement.title);
formData.append('bodyParams[lembrete]', lembrete);

// Só envia params dinâmicos para templates que usam URL dinâmica
if (templateIdentifier !== 'visita_prova_envio') {
  formData.append('buttonUrlDynamicParams[0]', `c/${condominium.slug}`);
  formData.append('buttonUrlDynamicParams[1]', `${optoutToken}`);
}
```

### `supabase/functions/test-whatsapp/index.ts` — disparo de teste

Da mesma forma, só envia `buttonUrlDynamicParams` se o template não for `visita_prova_envio`:

```typescript
if (templateToUse !== VISITA_TEMPLATE_IDENTIFIER) {
  formData.append('buttonUrlDynamicParams[0]', 'c/demo');
  formData.append('buttonUrlDynamicParams[1]', 'test-demo');
}
```

## Arquivos modificados

- `supabase/functions/send-whatsapp/index.ts` — condicionar `buttonUrlDynamicParams` ao template
- `supabase/functions/test-whatsapp/index.ts` — condicionar `buttonUrlDynamicParams` ao template

Após o deploy, o número Visita Prova enviará o payload sem parâmetros de botão dinâmico, compatível com um template de URL fixa configurado na Meta.
