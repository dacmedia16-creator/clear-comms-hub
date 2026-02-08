
# Plano: Reorganização do Sistema Multi-Segmento

## ✅ IMPLEMENTADO

O sistema foi originalmente desenvolvido para condomínios e, ao expandir para outros segmentos (Empresas, Clínicas, Igrejas, Comunidades, Franquias), manteve a estrutura rígida de "Bloco/Unidade" em todos os formulários e telas. Isso causa confusão pois:

- **Empresas**: Pedem "Bloco" e "Unidade" quando deveriam pedir "Departamento" e "Cargo"
- **Clínicas**: Pedem localização de apartamento para pacientes
- **Igrejas**: Pedem bloco/apt para membros de ministérios
- **Comunidades**: Usam terminologia residencial para associados

## Diagnóstico Completo

### Arquivos com Problemas de Terminologia

| Arquivo | Problema |
|---------|----------|
| `AddMemberDialog.tsx` | Labels fixos "Bloco/Unidade" com validação numérica rígida |
| `EditMemberDialog.tsx` | Campos obrigatórios com validação de condomínio |
| `ImportMembersDialog.tsx` | Template Excel usa "Bloco/Unidade" fixo |
| `SignupMemberPage.tsx` | Campo único "Bloco e Unidade" combinado |
| `AdminCondominiumPage.tsx` | Seção "Destinatários" usa "Blocos/Unidades" |
| `CondoMembersPage.tsx` | Header de tabela fixo |
| `CondominiumSettingsPage.tsx` | Descrições usam "moradores" e "condomínio" |
| `utils.ts` | `isValidBlock()` e `isValidUnit()` com regras rígidas |

### Campos Obrigatórios vs Opcionais por Segmento

| Segmento | Block | Unit | Regra Atual | Regra Ideal |
|----------|-------|------|-------------|-------------|
| Condomínio | Bloco | Unidade | Obrigatório | Obrigatório |
| Empresa | Departamento | Cargo | Obrigatório | Opcional |
| Clínica | Setor | Área | Obrigatório | Opcional |
| Igreja | Ministério | Grupo | Obrigatório | Opcional |
| Comunidade | Grupo | Categoria | Obrigatório | Opcional |
| Franquia | Região | Unidade | Obrigatório | Opcional |

## Solução Proposta

### Fase 1: Configuração de Segmento Expandida

Adicionar configurações de comportamento por tipo de organização:

```typescript
// src/lib/organization-types.ts

export interface OrganizationBehavior {
  requiresLocation: boolean;      // Block/Unit obrigatórios?
  blockValidation: "strict" | "flexible";  // Validação numérica ou texto livre
  unitValidation: "strict" | "flexible";
  showLocationInTimeline: boolean;
  showLocationTargeting: boolean; // Mostrar segmentação por block/unit
}

export interface OrganizationTypeConfig {
  // ... campos existentes
  behavior: OrganizationBehavior;
}
```

Configurações por segmento:

| Segmento | requiresLocation | blockValidation | unitValidation |
|----------|-----------------|-----------------|----------------|
| condominium | true | strict | strict |
| company | false | flexible | flexible |
| healthcare | false | flexible | flexible |
| church | false | flexible | flexible |
| community | false | flexible | flexible |
| franchise | true | flexible | flexible |

### Fase 2: Validação Flexível

Atualizar `src/lib/utils.ts`:

```typescript
// Validação flexível para texto livre
export function isValidBlockFlexible(value: string): boolean {
  return value.trim().length > 0 && value.trim().length <= 50;
}

export function isValidUnitFlexible(value: string): boolean {
  return value.trim().length > 0 && value.trim().length <= 50;
}

// Função que escolhe a validação correta
export function validateLocation(
  value: string, 
  type: "block" | "unit", 
  validation: "strict" | "flexible"
): boolean {
  if (validation === "flexible") {
    return type === "block" ? isValidBlockFlexible(value) : isValidUnitFlexible(value);
  }
  return type === "block" ? isValidBlock(value) : isValidUnit(value);
}
```

### Fase 3: Hook de Comportamento

Criar hook que retorna comportamento e termos:

```typescript
// src/hooks/useOrganizationBehavior.ts

export function useOrganizationBehavior(condoId: string | undefined) {
  const { terms, organizationType, loading } = useOrganizationTerms(condoId);
  
  const behavior = useMemo(() => {
    return getOrganizationBehavior(organizationType);
  }, [organizationType]);
  
  return { terms, behavior, organizationType, loading };
}
```

### Fase 4: Componentes Adaptados

#### 4.1 AddMemberDialog Refatorado

```typescript
// Mudanças principais:
// 1. Receber behavior como prop
// 2. Campos block/unit opcionais se !behavior.requiresLocation
// 3. Validação flexível se behavior.blockValidation === "flexible"
// 4. Labels dinâmicos usando terms.block e terms.unit
// 5. Placeholders contextuais (ex: "Comercial" para departamento)

interface AddMemberDialogProps {
  // ... props existentes
  behavior?: OrganizationBehavior;
}

// No formulário:
{behavior?.requiresLocation && (
  <div className="grid grid-cols-2 gap-3">
    <div className="space-y-2">
      <Label htmlFor="block">{terms.block} *</Label>
      <Input ... />
    </div>
    <div className="space-y-2">
      <Label htmlFor="unit">{terms.unit} *</Label>
      <Input ... />
    </div>
  </div>
)}

{!behavior?.requiresLocation && (
  <div className="grid grid-cols-2 gap-3">
    <div className="space-y-2">
      <Label htmlFor="block">{terms.block}</Label>
      <Input placeholder={`Ex: ${getPlaceholder(terms.block)}`} ... />
    </div>
    <div className="space-y-2">
      <Label htmlFor="unit">{terms.unit}</Label>
      <Input placeholder={`Ex: ${getPlaceholder(terms.unit)}`} ... />
    </div>
  </div>
)}
```

#### 4.2 EditMemberDialog Refatorado

Mesma lógica - campos opcionais baseados em `behavior.requiresLocation`.

#### 4.3 ImportMembersDialog Refatorado

```typescript
// Template dinâmico:
const downloadTemplate = useCallback(() => {
  const headers = ["Nome Completo", "Telefone", "Email"];
  
  if (behavior?.requiresLocation) {
    headers.push(terms.block, terms.unit);
  } else {
    headers.push(`${terms.block} (opcional)`, `${terms.unit} (opcional)`);
  }
  
  headers.push("Função");
  
  // ... resto do template
}, [terms, behavior]);

// Validação flexível na importação:
if (behavior?.requiresLocation) {
  if (!isValidBlock(rawBlock)) errors.push(`${terms.block} inválido`);
  if (!isValidUnit(unit)) errors.push(`${terms.unit} inválido`);
} else {
  // Campos opcionais - não validar se vazios
}
```

#### 4.4 AdminCondominiumPage - Seção Destinatários

```typescript
// Esconder segmentação por blocos para segmentos sem localização
{behavior?.showLocationTargeting && blocks.length > 0 && (
  <div className="border-t pt-4 mt-2">
    <Label className="text-sm font-medium mb-3 flex items-center gap-2">
      <Building2 className="w-4 h-4" />
      Destinatários
    </Label>
    <RadioGroup ...>
      <div>Todos os {terms.memberPlural.toLowerCase()}</div>
      <div>{terms.blockPlural} específicos</div>
      <div>{terms.unitPlural} específicas</div>
    </RadioGroup>
  </div>
)}

// Para segmentos sem localização, sempre "todos"
{!behavior?.showLocationTargeting && (
  <div className="text-sm text-muted-foreground">
    Este aviso será enviado para todos os {terms.memberPlural.toLowerCase()}.
  </div>
)}
```

### Fase 5: Página de Configurações Adaptada

Usar terminologia dinâmica em `CondominiumSettingsPage.tsx`:

```typescript
// Usar hook
const { terms, behavior } = useOrganizationBehavior(condoId);

// Labels dinâmicos
<CardTitle>Informações da {terms.organization}</CardTitle>
<CardDescription>
  Configure como os {terms.memberPlural.toLowerCase()} receberão os avisos
</CardDescription>

// Texto contextual
<p className="text-sm text-muted-foreground">
  Enviar avisos por WhatsApp para os {terms.memberPlural.toLowerCase()}
</p>
```

### Fase 6: Placeholders Contextuais

Adicionar função helper para placeholders:

```typescript
// src/lib/organization-types.ts

export function getLocationPlaceholders(type: OrganizationType): {
  block: string;
  unit: string;
} {
  const placeholders: Record<OrganizationType, { block: string; unit: string }> = {
    condominium: { block: "A, B, 1, 2", unit: "101, 202" },
    company: { block: "Comercial, TI", unit: "Analista, Gerente" },
    healthcare: { block: "Cardiologia", unit: "Consultório 1" },
    church: { block: "Louvor, Jovens", unit: "Coral, Células" },
    community: { block: "Diretoria", unit: "Associado" },
    franchise: { block: "Sul, Norte", unit: "Loja 01" },
  };
  return placeholders[type] || placeholders.condominium;
}
```

## Fluxo de Implementação

```text
┌────────────────────────────────────────────────────────────────┐
│                    FASE 1: Configuração                        │
│  - Adicionar OrganizationBehavior ao organization-types.ts     │
│  - Configurar comportamento por segmento                       │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                    FASE 2: Utils                               │
│  - Adicionar validação flexível em utils.ts                    │
│  - Criar função validateLocation()                             │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                    FASE 3: Hook                                │
│  - Criar useOrganizationBehavior.ts                            │
│  - Retornar terms + behavior                                   │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                    FASE 4: Componentes                         │
│  - Refatorar AddMemberDialog.tsx                               │
│  - Refatorar EditMemberDialog.tsx                              │
│  - Refatorar ImportMembersDialog.tsx                           │
│  - Adaptar AdminCondominiumPage.tsx                            │
│  - Adaptar CondoMembersPage.tsx                                │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                    FASE 5: Configurações                       │
│  - Adaptar CondominiumSettingsPage.tsx                         │
│  - Usar termos dinâmicos em todas as labels                    │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                    FASE 6: Signup                              │
│  - Adaptar SignupMemberPage.tsx                                │
│  - Campos opcionais para não-condomínios                       │
└────────────────────────────────────────────────────────────────┘
```

## Arquivos a Modificar

| Arquivo | Tipo de Alteração |
|---------|-------------------|
| `src/lib/organization-types.ts` | Adicionar `OrganizationBehavior` e configurações |
| `src/lib/utils.ts` | Adicionar validação flexível |
| `src/hooks/useOrganizationBehavior.ts` | **CRIAR** - hook combinado |
| `src/components/super-admin/AddMemberDialog.tsx` | Campos opcionais + validação flexível |
| `src/components/EditMemberDialog.tsx` | Campos opcionais + validação flexível |
| `src/components/ImportMembersDialog.tsx` | Template dinâmico + validação flexível |
| `src/pages/AdminCondominiumPage.tsx` | Seção destinatários condicional + termos |
| `src/pages/CondoMembersPage.tsx` | Headers de tabela dinâmicos |
| `src/pages/CondominiumSettingsPage.tsx` | Labels e descrições dinâmicas |
| `src/pages/auth/SignupMemberPage.tsx` | Campo de localização opcional |
| `supabase/functions/create-member/index.ts` | Validação opcional de block/unit |

## Resultado Esperado

Após a implementação:

1. **Empresas**: Campos "Departamento" e "Cargo" opcionais com texto livre
2. **Clínicas**: Campos "Setor" e "Área" opcionais
3. **Igrejas**: Campos "Ministério" e "Grupo" opcionais
4. **Comunidades**: Campos "Grupo" e "Categoria" opcionais
5. **Franquias**: Campos "Região" e "Unidade" obrigatórios com texto livre
6. **Condomínios**: Mantém comportamento atual (Bloco/Unidade obrigatórios, validação numérica)

## Seção Técnica

### Compatibilidade com Dados Existentes

- A coluna `block` e `unit` no banco permanece `text` (já é flexível)
- Registros existentes com `NULL` em block/unit continuam válidos
- Nenhuma migration de banco necessária

### Edge Function

A `create-member` precisa aceitar block/unit vazios:

```typescript
// Validar apenas se o tipo de organização exigir
const orgType = await getCondominiumOrgType(condominiumId);
const behavior = getOrganizationBehavior(orgType);

if (behavior.requiresLocation) {
  if (!block || !unit) {
    return errorResponse("Block e Unit são obrigatórios para este tipo de organização");
  }
}
```

### Testes Recomendados

1. Criar organização de cada tipo
2. Adicionar membro com campos vazios (deve falhar só para condomínio)
3. Importar planilha sem block/unit (deve funcionar para empresas)
4. Verificar que segmentação de destinatários aparece só para condomínios
