

# Plano: Suporte a Videos ate 20MB nos Anexos

## Resumo

Adicionar suporte para upload e visualizacao de videos nos anexos de avisos, permitindo arquivos de ate 20MB.

---

## Mudancas Necessarias

### 1. Componente FileUpload

Atualizar `src/components/FileUpload.tsx` para:

- Adicionar extensoes de video no accept padrao (`.mp4,.webm,.mov,.avi`)
- Adicionar icone especifico para arquivos de video (Video do lucide-react)
- Atualizar a descricao para incluir "videos" na lista de tipos aceitos
- Aumentar o limite padrao de tamanho para 20MB

```typescript
// Novo accept padrao:
accept = ".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.mp4,.webm,.mov,.avi"

// Nova funcao getFileIcon para video:
if (type.startsWith("video/") || name.endsWith(".mp4") || name.endsWith(".webm") || name.endsWith(".mov")) {
  return <Video className="w-5 h-5 text-purple-500" />;
}
```

### 2. Pagina AdminCondominiumPage

Atualizar `src/pages/AdminCondominiumPage.tsx`:

- Aumentar `maxSizeMB` de 5 para 20 no componente FileUpload
- Incluir extensoes de video no `accept`

```typescript
<FileUpload
  files={selectedFiles}
  onFilesChange={setSelectedFiles}
  maxSizeMB={20}
  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.mp4,.webm,.mov,.avi"
/>
```

### 3. Pagina TimelinePage

Atualizar `src/pages/TimelinePage.tsx` para:

- Adicionar icone de video na funcao `getFileIcon`
- Adicionar player de video inline para previsualizacao de videos anexados
- Mostrar controles de video (play, pause, volume) para arquivos de video

```typescript
// Detectar se e video
const isVideo = attachment.file_type?.startsWith("video/");

// Se for video, mostrar player inline
{isVideo && (
  <video 
    src={attachment.file_url} 
    controls 
    className="w-full rounded-lg mt-2"
    preload="metadata"
  />
)}
```

### 4. Tabela de Planos (Opcional)

Considerar atualizar os limites por plano:

| Plano | Limite Atual | Novo Limite Sugerido |
|-------|--------------|---------------------|
| Gratuito | 2MB | 5MB |
| Inicial | 5MB | 10MB |
| Profissional | 10MB | 20MB |

**Nota:** Esta mudanca e opcional e requer decisao de negocio. Por enquanto, vou implementar um limite fixo de 20MB que pode ser ajustado depois.

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/FileUpload.tsx` | Adicionar suporte a video no accept e icone |
| `src/pages/AdminCondominiumPage.tsx` | Aumentar maxSizeMB para 20 e adicionar extensoes de video |
| `src/pages/TimelinePage.tsx` | Adicionar icone de video e player inline |

---

## Detalhes Tecnicos

### Tipos de Video Suportados

- **MP4** (video/mp4) - Formato mais comum, compativel com todos os navegadores
- **WebM** (video/webm) - Formato otimizado para web
- **MOV** (video/quicktime) - Formato Apple, suporte variavel
- **AVI** (video/x-msvideo) - Formato legacy

### Consideracoes de UX

1. **Preview na Timeline**: Videos serao exibidos com player nativo do HTML5
2. **Icone Diferenciado**: Videos terao icone roxo para diferenciar de outros arquivos
3. **Feedback de Upload**: Usuario vera nome do arquivo e tamanho durante upload

### Limitacoes

- Supabase Storage tem limite de 50MB por arquivo por padrao
- Videos muito longos podem demorar para carregar na timeline
- Navegadores mais antigos podem nao suportar todos os formatos

