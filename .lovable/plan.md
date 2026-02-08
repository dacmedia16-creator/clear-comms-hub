
# Plano: Aumentar Limite de Upload de Vídeo para 300MB

## Objetivo

Aumentar o limite de upload de arquivos de vídeo de 20MB para 300MB, mantendo o limite de 20MB para outros tipos de arquivo (PDF, imagens, documentos).

---

## Estratégia

Modificar o componente `FileUpload` para ter limites diferentes por tipo de arquivo:
- **Vídeos** (MP4, WebM, MOV, AVI): até 300MB
- **Outros arquivos** (PDF, imagens, documentos): até 20MB

---

## Arquivos a Modificar

### 1. src/components/FileUpload.tsx

**Alterações:**

1. Adicionar nova prop `maxVideoSizeMB` com valor padrão de 300MB
2. Criar função auxiliar para detectar se um arquivo é vídeo
3. Atualizar validação de tamanho para usar limite apropriado por tipo
4. Atualizar texto de ajuda para mostrar os dois limites

**Nova Interface:**
```typescript
interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxSizeMB?: number;         // Para arquivos gerais (default: 20)
  maxVideoSizeMB?: number;    // Para vídeos (default: 300)
  accept?: string;
  className?: string;
}
```

**Função de detecção de vídeo:**
```typescript
function isVideoFile(file: File): boolean {
  const type = file.type;
  const name = file.name.toLowerCase();
  return type.startsWith("video/") || 
         name.endsWith(".mp4") || 
         name.endsWith(".webm") || 
         name.endsWith(".mov") || 
         name.endsWith(".avi");
}
```

**Validação atualizada:**
```typescript
Array.from(newFiles).forEach((file) => {
  const isVideo = isVideoFile(file);
  const maxSize = isVideo ? maxVideoSizeBytes : maxSizeBytes;
  const limitLabel = isVideo ? maxVideoSizeMB : maxSizeMB;
  
  if (file.size > maxSize) {
    errors.push(`${file.name} excede o limite de ${limitLabel}MB`);
  } else {
    validFiles.push(file);
  }
});
```

**Texto de ajuda atualizado:**
```typescript
<p className="text-xs text-muted-foreground mt-2">
  PDF, imagens, documentos (máx {maxSizeMB}MB) • Vídeos (máx {maxVideoSizeMB}MB)
</p>
```

---

## Fluxo de Validação

```text
┌─────────────────────────────────────────────────────────────┐
│                   Arquivo Selecionado                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                 ┌─────────────────────┐
                 │   É arquivo de      │
                 │      vídeo?         │
                 └─────────┬───────────┘
                           │
            ┌──────────────┴──────────────┐
            │ SIM                         │ NÃO
            ▼                             ▼
   ┌────────────────────┐      ┌────────────────────┐
   │ Limite: 300MB      │      │ Limite: 20MB       │
   │ (maxVideoSizeMB)   │      │ (maxSizeMB)        │
   └─────────┬──────────┘      └─────────┬──────────┘
             │                           │
             └─────────────┬─────────────┘
                           ▼
                 ┌─────────────────────┐
                 │ Tamanho ≤ Limite?   │
                 └─────────┬───────────┘
            ┌──────────────┴──────────────┐
            │ SIM                         │ NÃO
            ▼                             ▼
   ┌────────────────────┐      ┌────────────────────┐
   │   ✅ Aceito        │      │   ❌ Rejeitado     │
   │   Adiciona à lista │      │   Mostra erro      │
   └────────────────────┘      └────────────────────┘
```

---

## Resumo de Alterações

| Arquivo | Alteração |
|---------|-----------|
| `src/components/FileUpload.tsx` | Adicionar `maxVideoSizeMB`, função `isVideoFile()`, validação diferenciada |

---

## Resultado Esperado

| Tipo de Arquivo | Limite Anterior | Limite Novo |
|-----------------|-----------------|-------------|
| PDF             | 20MB            | 20MB        |
| Imagens         | 20MB            | 20MB        |
| Documentos      | 20MB            | 20MB        |
| **Vídeos**      | 20MB            | **300MB**   |

---

## Considerações

- A alteração é retrocompatível - componentes que não passam `maxVideoSizeMB` usarão o padrão de 300MB
- O bucket de storage já está configurado para aceitar arquivos grandes
- Não requer alterações no banco de dados
