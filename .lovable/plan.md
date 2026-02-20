
## Problema identificado pelo suporte da Zion Talk

O template `visita_prova_envio` tem a seguinte estrutura:
- Body: 3 parâmetros nomeados → `bodyParams[nome]`, `bodyParams[aviso]`, `bodyParams[lembrete]`
- Botão: 1 botão com URL dinâmica → apenas `buttonUrlDynamicParams[0]`

### O que estava errado

**No `test-whatsapp`** (o bug desta sessão):
O código enviava 3 `buttonUrlDynamicParams` no lugar dos `bodyParams`, que é completamente incorreto:
```
buttonUrlDynamicParams[1] = 'Teste'           ❌
buttonUrlDynamicParams[2] = 'Mensagem...'     ❌
buttonUrlDynamicParams[3] = 'Se você...'      ❌
```

**No `send-whatsapp`** (bug anterior):
O código envia os `bodyParams` corretamente, mas **não envia nenhum `buttonUrlDynamicParams`** para `visita_prova_envio`, o que deixa o botão sem URL:
```
bodyParams[nome] = ...    ✓
bodyParams[aviso] = ...   ✓
bodyParams[lembrete] = .. ✓
// buttonUrlDynamicParams ausente ❌
```

### Estrutura correta para ambos os templates

| Campo | `aviso_pro_confirma_3` | `visita_prova_envio` |
|---|---|---|
| `bodyParams[nome]` | ✓ | ✓ |
| `bodyParams[aviso]` | ✓ | ✓ |
| `bodyParams[lembrete]` | ✓ | ✓ |
| `buttonUrlDynamicParams[0]` | slug do condo / `c/demo` | token de optout / `test-demo` |
| `buttonUrlDynamicParams[1]` | token de optout / `test-demo` | **NÃO envia** |

A diferença é: `aviso_pro_confirma_3` tem 2 botões dinâmicos (slug + optout), `visita_prova_envio` tem apenas 1 botão dinâmico (optout).

---

## O que será corrigido

### 1. `supabase/functions/test-whatsapp/index.ts`

Remover a condição `if (templateToUse === VISITA_TEMPLATE_IDENTIFIER)` e usar sempre os `bodyParams` nomeados. A diferença entre os templates é apenas quantos `buttonUrlDynamicParams` são enviados:

```typescript
// Sempre usa bodyParams nomeados
formData.append('bodyParams[nome]', 'Teste');
formData.append('bodyParams[aviso]', 'Mensagem de teste do sistema');
formData.append('bodyParams[lembrete]', 'Se você recebeu esta mensagem, a integração está funcionando corretamente!');

if (templateToUse === VISITA_TEMPLATE_IDENTIFIER) {
  // 1 botão dinâmico apenas
  formData.append('buttonUrlDynamicParams[0]', 'test-demo');
} else {
  // 2 botões dinâmicos (slug + optout)
  formData.append('buttonUrlDynamicParams[0]', 'c/demo');
  formData.append('buttonUrlDynamicParams[1]', 'test-demo');
}
```

### 2. `supabase/functions/send-whatsapp/index.ts`

Corrigir a lógica do `processBatch` para enviar `buttonUrlDynamicParams[0]` (o token de optout) também para `visita_prova_envio`:

```typescript
// bodyParams sempre iguais
formData.append('bodyParams[nome]', member.full_name || 'morador(a)');
formData.append('bodyParams[aviso]', announcement.title);
formData.append('bodyParams[lembrete]', lembrete);

if (templateIdentifier === 'visita_prova_envio') {
  // 1 botão: apenas o optout token
  formData.append('buttonUrlDynamicParams[0]', optoutToken);
} else {
  // 2 botões: slug do condo + optout token
  formData.append('buttonUrlDynamicParams[0]', `c/${condominium.slug}`);
  formData.append('buttonUrlDynamicParams[1]', optoutToken);
}
```

### Resultado esperado

O payload correto que será enviado à Zion Talk para `visita_prova_envio`:
```json
{
  "mobile_phone": "+55...",
  "template_identifier": "visita_prova_envio",
  "language": "pt_BR",
  "bodyParams[nome]": "Teste",
  "bodyParams[aviso]": "Mensagem de teste do sistema",
  "bodyParams[lembrete]": "Se você recebeu esta mensagem, a integração está funcionando corretamente!",
  "buttonUrlDynamicParams[0]": "test-demo"
}
```

### Arquivos alterados
- `supabase/functions/test-whatsapp/index.ts` — corrigir payload: usar `bodyParams` nomeados + apenas 1 `buttonUrlDynamicParams[0]`
- `supabase/functions/send-whatsapp/index.ts` — corrigir payload: adicionar `buttonUrlDynamicParams[0]` (optout token) para `visita_prova_envio`
