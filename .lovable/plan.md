

# Plano: Alterar Endereço de Envio para aviso@avisopro.com.br

## Mudança Simples

Vamos alterar o campo `from.address` de `noreply@avisopro.com.br` para `aviso@avisopro.com.br` nas duas Edge Functions.

## Arquivos a Modificar

### 1. `supabase/functions/send-email/index.ts`

**Linha 90 - Atual:**
```typescript
from: { address: 'noreply@avisopro.com.br', name: 'AvisoPro' },
```

**Novo:**
```typescript
from: { address: 'aviso@avisopro.com.br', name: 'AvisoPro' },
```

### 2. `supabase/functions/test-email/index.ts`

**Linha 39 - Atual:**
```typescript
from: { address: 'noreply@avisopro.com.br', name: 'AvisoPro' },
```

**Novo:**
```typescript
from: { address: 'aviso@avisopro.com.br', name: 'AvisoPro' },
```

**Linha 97 - Atual (teste de conexão):**
```typescript
const result = await sendZeptoEmail(
  'noreply@avisopro.com.br',
  ...
```

**Novo:**
```typescript
const result = await sendZeptoEmail(
  'aviso@avisopro.com.br',
  ...
```

## Resultado

Após a mudança:
- **Remetente (From)**: `aviso@avisopro.com.br`
- **Nome**: `AvisoPro`

Todos os emails enviados pelo sistema terão o endereço `aviso@avisopro.com.br` como remetente, exatamente como no seu exemplo de curl.

