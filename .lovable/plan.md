
## Usar template diferente para o sender "Visita Prova"

### O que precisa mudar

O sender "Visita Prova" (telefone (15) 99845-9830) está cadastrado na tabela `whatsapp_senders`. Atualmente, a função `resolveAuthHeader` já busca o sender ativo e retorna o `authHeader`, mas não retorna o nome do sender. A mudança é passar o nome do sender para o `processBatch`, e lá decidir qual template usar.

### Regra

- Se o nome do sender contiver "visita" (case-insensitive) → usar template `visita_prova_envio`
- Qualquer outro sender → usar template `aviso_pro_confirma_3` (padrão atual)

### Alterações no arquivo `supabase/functions/send-whatsapp/index.ts`

**1. Retornar `senderName` na função `resolveAuthHeader`**

A função já possui `senderPhone`, basta adicionar `senderName` ao retorno:

```typescript
return { authHeader: '...', senderPhone, senderName: sender.name };
```

**2. Adicionar `templateIdentifier` na interface `RequestBody`**

Para que os batches subsequentes (self-invocação) saibam qual template usar:

```typescript
interface RequestBody {
  ...
  templateIdentifier?: string; // novo campo
}
```

**3. Passar `templateIdentifier` como parâmetro para `processBatch`**

```typescript
async function processBatch(
  members, offset, authHeader, announcement, condominium, supabase,
  templateIdentifier: string  // novo parâmetro
)
```

**4. Usar `templateIdentifier` no FormData em vez da constante**

```typescript
formData.append('template_identifier', templateIdentifier);
// em vez de: formData.append('template_identifier', TEMPLATE_IDENTIFIER);
```

**5. Na primeira invocação, determinar o template pelo nome do sender**

```typescript
const senderInfo = await resolveAuthHeader(supabase);
const templateIdentifier = senderInfo.senderName?.toLowerCase().includes('visita')
  ? 'visita_prova_envio'
  : TEMPLATE_IDENTIFIER; // 'aviso_pro_confirma_3'
```

**6. Propagar `templateIdentifier` na self-invocação (batches seguintes)**

```typescript
body: JSON.stringify({
  announcement, condominium,
  batchOffset: nextOffset,
  membersPayload: members,
  authHeader,
  templateIdentifier,  // novo campo propagado
})
```

### Fluxo resultante

```text
Sender "Visita Prova" ativo
  → resolveAuthHeader retorna senderName = "Visita Prova"
  → "visita prova".includes("visita") = true
  → templateIdentifier = "visita_prova_envio"
  → todos os batches usam esse template

Qualquer outro sender ativo
  → senderName = "Numero 1", "Numero 2", etc.
  → templateIdentifier = "aviso_pro_confirma_3"
```

### Arquivos modificados

- `supabase/functions/send-whatsapp/index.ts` — única alteração necessária
