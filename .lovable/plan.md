
# Validacao de Campos Bloco/Torre e Unidade/Apt

## Objetivo
Implementar validacao restritiva nos campos de localizacao para garantir padronizacao dos dados:

| Campo | Regras de Validacao |
|-------|---------------------|
| **Bloco/Torre** | Apenas numeros sem zero a esquerda (1, 2, 10) OU uma unica letra maiuscula (A, B, C) |
| **Unidade/Apt** | Apenas numeros (101, 202, 1501) |

---

## Solucao Tecnica

### 1. Criar Funcoes de Validacao Reutilizaveis

Adicionar no arquivo `src/lib/utils.ts` funcoes de validacao e formatacao:

```typescript
// Valida bloco: numero sem zero inicial OU letra unica
export function isValidBlock(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  
  // Letra unica (A-Z)
  if (/^[A-Za-z]$/.test(trimmed)) return true;
  
  // Numero sem zero inicial (1, 2, 10, 100...)
  if (/^[1-9][0-9]*$/.test(trimmed)) return true;
  
  return false;
}

// Valida unidade: apenas numeros
export function isValidUnit(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^[0-9]+$/.test(trimmed);
}

// Formata bloco para padrao (letra maiuscula)
export function formatBlock(value: string): string {
  const trimmed = value.trim();
  if (/^[A-Za-z]$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return trimmed;
}
```

### 2. Aplicar em Tempo Real nos Inputs

Usar `onChange` para filtrar caracteres invalidos enquanto o usuario digita:

**Bloco/Torre:**
- Permitir apenas: 0-9 e A-Za-z
- Limitar a 10 caracteres (ex: numeros de bloco)
- Se for letra, aceitar apenas 1 caractere

**Unidade/Apt:**
- Permitir apenas: 0-9
- Limitar a 10 caracteres

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/lib/utils.ts` | Adicionar funcoes de validacao |
| `src/components/EditMemberDialog.tsx` | Aplicar validacao nos campos block e unit |
| `src/components/super-admin/AddMemberDialog.tsx` | Aplicar validacao nos campos (ambas abas) |
| `src/components/ImportMembersDialog.tsx` | Validar dados importados da planilha |

---

## Detalhes de Implementacao

### EditMemberDialog.tsx

```typescript
// Handler para Bloco - aceita numeros ou uma letra
const handleBlockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  // Permitir apenas numeros ou uma unica letra
  if (value === "" || /^[A-Za-z]$/.test(value) || /^[1-9][0-9]*$/.test(value)) {
    setBlock(value.toUpperCase());
  }
};

// Handler para Unidade - aceita apenas numeros
const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  // Permitir apenas numeros
  if (value === "" || /^[0-9]+$/.test(value)) {
    setUnit(value);
  }
};
```

Atualizacao dos inputs:
```jsx
<Input
  id="block"
  value={block}
  onChange={handleBlockChange}
  placeholder="Ex: 1, A"
  maxLength={10}
  required
/>

<Input
  id="unit"
  value={unit}
  onChange={handleUnitChange}
  placeholder="Ex: 101"
  maxLength={10}
  required
/>
```

### AddMemberDialog.tsx

Mesma logica aplicada aos 4 campos:
- `block` e `unit` (aba "Novo Morador")
- `existingBlock` e `existingUnit` (aba "Usuario Existente")

Atualizar placeholders para refletir o novo formato aceito.

### ImportMembersDialog.tsx

Adicionar validacao na funcao `validateMember`:

```typescript
function validateMember(row: any[]): ParsedMember {
  // ... validacoes existentes ...
  
  // Validar formato do bloco
  if (block && !isValidBlock(block)) {
    errors.push("Bloco invalido (use numero ou letra unica)");
  }
  
  // Validar formato da unidade
  if (unit && !isValidUnit(unit)) {
    errors.push("Unidade invalida (use apenas numeros)");
  }
  
  // Formatar bloco para maiuscula
  const formattedBlock = formatBlock(block);
  
  return {
    // ...
    block: formattedBlock,
    // ...
  };
}
```

---

## Mensagens de Erro

| Campo | Mensagem |
|-------|----------|
| Bloco vazio | "Bloco/Torre e obrigatorio" |
| Bloco invalido | "Bloco deve ser um numero (sem zero inicial) ou uma letra" |
| Unidade vazia | "Unidade/Apt e obrigatoria" |
| Unidade invalida | "Unidade deve conter apenas numeros" |

---

## Validacao no Submit

Alem da filtragem em tempo real, adicionar validacao no submit para garantir:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validar bloco
  if (!isValidBlock(block)) {
    setError("Bloco deve ser um numero (sem zero inicial) ou uma letra");
    return;
  }
  
  // Validar unidade
  if (!isValidUnit(unit)) {
    setError("Unidade deve conter apenas numeros");
    return;
  }
  
  // ... resto do submit
};
```

---

## Resumo das Tarefas

| # | Tarefa |
|---|--------|
| 1 | Adicionar funcoes `isValidBlock`, `isValidUnit` e `formatBlock` em `utils.ts` |
| 2 | Atualizar `EditMemberDialog.tsx` com handlers de validacao e novos placeholders |
| 3 | Atualizar `AddMemberDialog.tsx` com validacao em ambas as abas |
| 4 | Atualizar `ImportMembersDialog.tsx` para validar dados da planilha |

---

## Exemplos de Entradas Validas/Invalidas

| Campo | Valido | Invalido |
|-------|--------|----------|
| Bloco/Torre | `1`, `7`, `10`, `A`, `B` | `01`, `007`, `AB`, `1A`, `Bloco 1` |
| Unidade/Apt | `101`, `202`, `1501`, `01` | `101A`, `Apt 101`, `12A` |
