
# Importar Moradores de Planilha

## Objetivo

Adicionar funcionalidade para importar múltiplos moradores de uma vez através de arquivo Excel (.xlsx) ou CSV, conforme indicado na imagem (área circulada no header da página de moradores).

---

## Visão Geral

O síndico poderá clicar no botão "Importar" ao lado do botão "Adicionar", fazer upload de uma planilha com os dados dos moradores, visualizar uma prévia dos dados e confirmar a importação em massa.

---

## Formato Esperado da Planilha

| Coluna | Campo | Obrigatório |
|--------|-------|-------------|
| A | Nome Completo | Sim |
| B | Telefone | Sim |
| C | Email | Sim |
| D | Bloco e Unidade | Sim |
| E | Função (morador/sindico/admin/colaborador) | Não (default: morador) |

---

## Componentes a Criar

### 1. ImportMembersDialog

Dialog com as seguintes etapas:

1. **Upload**: Área de upload (drag & drop) para arquivo .xlsx ou .csv
2. **Prévia**: Tabela mostrando os dados parseados com validação
3. **Confirmação**: Resumo e botão para importar

---

## Alterações Necessárias

### Dependência Nova

```bash
npm install xlsx
```

A biblioteca `xlsx` (SheetJS) é a mais popular para parsing de Excel no browser.

### Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/components/ImportMembersDialog.tsx` | Dialog com upload, prévia e importação |

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/CondoMembersPage.tsx` | Adicionar botão "Importar" e integrar dialog |
| `src/hooks/useCondoMembers.ts` | Adicionar função `importMembers` para criar múltiplos |

---

## Fluxo de Uso

```text
Síndico clica "Importar"
         │
         ▼
┌─────────────────────────┐
│  Dialog: Upload File    │
│                         │
│  ┌───────────────────┐  │
│  │ Arraste sua       │  │
│  │ planilha aqui     │  │
│  │ .xlsx ou .csv     │  │
│  └───────────────────┘  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Dialog: Prévia         │
│                         │
│  ┌─────────────────────┐│
│  │ Nome │Tel │ Un │... ││
│  │──────┼────┼────┼────││
│  │ João │... │ A1 │ OK ││
│  │ Maria│... │ B2 │ERRO││
│  └─────────────────────┘│
│                         │
│  10 válidos, 1 erro     │
│                         │
│  [Cancelar] [Importar]  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Importando...          │
│  ████████░░░░ 8/10      │
└─────────────────────────┘
         │
         ▼
   Lista atualizada
```

---

## Detalhes Técnicos

### Parsing da Planilha

```typescript
import * as XLSX from 'xlsx';

const handleFile = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target?.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
    // jsonData é array de arrays: [["Nome", "Tel", ...], ["João", "11...", ...]]
  };
  reader.readAsArrayBuffer(file);
};
```

### Validação dos Dados

Para cada linha:
- Nome: mínimo 2 caracteres
- Telefone: presente
- Email: contém @
- Unidade: presente
- Função: se vazio, assume "resident"

### Mapeamento de Função

```typescript
const roleMap: Record<string, string> = {
  'morador': 'resident',
  'residente': 'resident',
  'resident': 'resident',
  'sindico': 'syndic',
  'síndico': 'syndic',
  'syndic': 'syndic',
  'admin': 'admin',
  'administrador': 'admin',
  'colaborador': 'collaborator',
  'collaborator': 'collaborator',
};
```

### Importação em Batch

Reutilizar a função `createMember` existente, chamando sequencialmente para cada membro válido. Exibir progresso durante a importação.

---

## Interface do Dialog

### Header
- Título: "Importar Moradores"
- Descrição: "Faça upload de uma planilha Excel ou CSV"

### Etapa 1: Upload
- Área de drag & drop
- Aceita: `.xlsx, .xls, .csv`
- Botão para baixar modelo de planilha

### Etapa 2: Prévia
- Tabela com os dados
- Indicador de status por linha (válido/erro)
- Contador: "X válidos, Y com erro"
- Erros destacados em vermelho

### Etapa 3: Importação
- Progress bar
- Contador: "Importando X de Y..."
- Ao finalizar: resumo de sucesso/erro

---

## Modelo de Planilha para Download

Criar função para gerar um arquivo Excel modelo:

```typescript
const downloadTemplate = () => {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Nome Completo', 'Telefone', 'Email', 'Bloco e Unidade', 'Função'],
    ['João da Silva', '11999999999', 'joao@email.com', 'Bloco A, Apt 101', 'morador'],
    ['Maria Santos', '11988888888', 'maria@email.com', 'Bloco B, Apt 202', 'morador'],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Moradores');
  XLSX.writeFile(wb, 'modelo_moradores.xlsx');
};
```

---

## Resultado Visual

O botão "Importar" ficará ao lado do botão "Adicionar" no header:

```text
┌──────────────────────────────────────────────────────────────┐
│  ← 👥 Moradores          [Importar] [↻] [+ Adicionar]       │
│     Vitrine Esplanada                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## Resumo das Tarefas

1. **Instalar dependência**: `xlsx` (SheetJS)
2. **Criar componente**: `ImportMembersDialog.tsx`
3. **Modificar página**: Adicionar botão e dialog em `CondoMembersPage.tsx`
4. **Adicionar hook**: Função `importMembers` em `useCondoMembers.ts`
