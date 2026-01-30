

# Adicionar Anexos de Arquivos aos Avisos

## Resumo

Implementar a funcionalidade de anexar arquivos (PDF, imagens, documentos) aos avisos no formulário de criação. Os arquivos serão armazenados no Lovable Cloud Storage e referenciados na tabela `attachments` que já existe no banco de dados.

## Situação Atual

### O que já existe:
- Tabela `attachments` no banco de dados com campos: `id`, `announcement_id`, `file_name`, `file_url`, `file_type`, `file_size`
- Políticas RLS configuradas para visualização pública e gerenciamento por admins
- Bucket `avatars` para armazenamento de imagens de perfil

### O que falta:
- Bucket de storage para os anexos de avisos
- Interface de upload no formulário de criação de aviso
- Lógica para fazer upload dos arquivos e salvar na tabela `attachments`
- Exibição dos anexos na timeline (página pública)

## Solução Proposta

### 1. Criar Bucket de Storage
Criar um bucket público chamado `attachments` para armazenar os arquivos anexados aos avisos.

### 2. Interface de Upload no Formulário
Adicionar seção de upload de arquivos no dialog de criação de aviso com:
- Botão "Anexar arquivos" com ícone de clipe
- Preview dos arquivos selecionados (nome, tamanho, tipo)
- Botão para remover arquivo antes do envio
- Suporte para múltiplos arquivos
- Limite de tamanho (5MB por arquivo para plano Inicial, 10MB para Profissional)

### 3. Fluxo de Upload
1. Usuário seleciona arquivo(s) via input
2. Arquivos ficam em estado temporário (estado local)
3. Ao clicar "Publicar aviso":
   - Cria o aviso no banco
   - Faz upload de cada arquivo para o bucket
   - Registra cada arquivo na tabela `attachments`

### 4. Exibição na Timeline
Mostrar anexos nos cards de avisos quando expandidos:
- Ícone por tipo de arquivo (PDF, imagem, documento)
- Nome e tamanho do arquivo
- Link para download/visualização

## Detalhes Técnicos

### Migration SQL (Nova)

```text
-- Criar bucket de storage para anexos
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Política para visualização pública
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'attachments');

-- Política para upload por usuários autenticados
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

-- Política para exclusão pelo dono
CREATE POLICY "Delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'attachments');
```

### Componente de Upload (Novo)
Criar `src/components/FileUpload.tsx`:
- Input file com múltipla seleção
- Preview de arquivos com ícones por tipo
- Validação de tamanho
- Botão para remover arquivo da lista

### Modificações no AdminCondominiumPage.tsx
- Adicionar estado para arquivos selecionados: `const [selectedFiles, setSelectedFiles] = useState<File[]>([])`
- Adicionar seção de upload no formulário (antes das opções de notificação)
- Modificar `handleCreateAnnouncement` para:
  1. Criar o aviso
  2. Fazer upload de cada arquivo para storage
  3. Inserir registros na tabela `attachments`

### Modificações no TimelinePage.tsx
- Buscar anexos junto com os avisos (join com tabela attachments)
- Exibir lista de anexos no conteúdo expandido do card
- Ícones diferenciados por tipo (PDF, imagem, doc, etc.)
- Links de download

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/components/FileUpload.tsx` | Componente reutilizável de upload |
| Migration SQL | Bucket de storage e políticas |

## Arquivos a Modificar

| Arquivo | Alterações |
|---------|------------|
| `src/pages/AdminCondominiumPage.tsx` | Adicionar upload de arquivos no form |
| `src/pages/TimelinePage.tsx` | Exibir anexos nos avisos expandidos |

## Interface Visual do Upload

```text
┌──────────────────────────────────────────────┐
│  Anexos (opcional)                           │
├──────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐ │
│  │  📎 Clique para anexar arquivos         │ │
│  │     ou arraste e solte aqui             │ │
│  │                                         │ │
│  │  PDF, imagens, documentos (máx 5MB)     │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  📄 regulamento.pdf (1.2 MB)           [✕]  │
│  🖼 foto-obra.jpg (856 KB)             [✕]  │
└──────────────────────────────────────────────┘
```

## Interface Visual na Timeline (Aviso Expandido)

```text
┌──────────────────────────────────────────────┐
│  [Conteúdo do aviso...]                      │
│                                              │
│  ─────────────────────────────────────────── │
│  📎 Anexos                                   │
│  ┌─────────────────────────────────────────┐ │
│  │ 📄 regulamento.pdf         [Baixar ↓]   │ │
│  │ 🖼 foto-obra.jpg           [Ver 👁]     │ │
│  └─────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

## Tipos de Arquivo Suportados

| Tipo | Extensões | Ícone |
|------|-----------|-------|
| PDF | .pdf | 📄 FileText |
| Imagem | .jpg, .jpeg, .png, .gif, .webp | 🖼 Image |
| Documento | .doc, .docx | 📝 FileText |
| Planilha | .xls, .xlsx | 📊 FileSpreadsheet |
| Outros | * | 📁 File |

## Resultado Esperado

Síndicos poderão anexar documentos importantes aos avisos (regulamentos, boletos, fotos de obras, atas de reunião, etc.), e os moradores poderão visualizar e baixar esses arquivos diretamente na timeline.

