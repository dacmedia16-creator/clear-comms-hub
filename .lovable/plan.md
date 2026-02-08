

# Plano: Corrigir Limite de Anexos para 20MB

## Problema Identificado

O componente `FileUpload` foi atualizado corretamente com o valor padrão de 20MB, mas na página `AdminCondominiumPage.tsx` (linha 604), o `maxSizeMB` ainda está explicitamente definido como 5:

```typescript
<FileUpload
  files={selectedFiles}
  onFilesChange={setSelectedFiles}
  maxSizeMB={5}  // <-- Aqui está o problema!
/>
```

Como esse valor é passado explicitamente, ele sobrescreve o valor padrão de 20MB do componente.

---

## Solução

Remover a prop `maxSizeMB={5}` ou alterá-la para `maxSizeMB={20}`.

### Arquivo a Modificar

| Arquivo | Linha | Mudança |
|---------|-------|---------|
| `src/pages/AdminCondominiumPage.tsx` | 604 | Alterar `maxSizeMB={5}` para `maxSizeMB={20}` |

---

## Código Corrigido

**Antes (linha 601-606):**
```typescript
<FileUpload
  files={selectedFiles}
  onFilesChange={setSelectedFiles}
  maxSizeMB={5}
/>
```

**Depois:**
```typescript
<FileUpload
  files={selectedFiles}
  onFilesChange={setSelectedFiles}
  maxSizeMB={20}
/>
```

---

## Resultado Esperado

Após a correção, os usuários poderão anexar vídeos e outros arquivos de até 20MB nos avisos.

