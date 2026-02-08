

# Plano: Fase 2 - Hook useOrganizationTerms e Terminologia Dinâmica

## Visão Geral

Implementar um hook React `useOrganizationTerms` que busca o tipo da organização e retorna a terminologia correta (Morador→Aluno, Bloco→Série, etc). Atualizar todas as páginas e componentes de membros para usar terminologia dinâmica baseada no tipo da organização.

---

## 1. Novo Hook: useOrganizationTerms

### Arquivo: `src/hooks/useOrganizationTerms.ts`

```typescript
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOrganizationTerms, OrganizationTerms, OrganizationType } from "@/lib/organization-types";

export function useOrganizationTerms(condoId: string | undefined) {
  const [terms, setTerms] = useState<OrganizationTerms>(getOrganizationTerms("condominium"));
  const [organizationType, setOrganizationType] = useState<OrganizationType>("condominium");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchType() {
      if (!condoId) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("condominiums")
        .select("organization_type")
        .eq("id", condoId)
        .maybeSingle();

      if (data?.organization_type) {
        setOrganizationType(data.organization_type);
        setTerms(getOrganizationTerms(data.organization_type));
      }
      setLoading(false);
    }

    fetchType();
  }, [condoId]);

  return { terms, organizationType, loading };
}
```

---

## 2. Componentes e Páginas a Atualizar

### 2.1 CondoMembersPage.tsx

| Local | Atual | Dinâmico |
|-------|-------|----------|
| Header título | "Moradores" | `terms.memberPlural` |
| Mensagem vazia | "Nenhum morador cadastrado" | `Nenhum ${terms.member.toLowerCase()} cadastrado` |
| Toast sucesso | "Morador cadastrado" | `${terms.member} cadastrado` |
| Nav item label | "Moradores" | `terms.memberPlural` |
| TableHead "Unidade" | "Unidade" | `terms.unit` |

### 2.2 EditMemberDialog.tsx

| Local | Atual | Dinâmico |
|-------|-------|----------|
| DialogTitle | "Editar Morador" | `Editar ${terms.member}` |
| Label "Bloco/Torre" | "Bloco/Torre *" | `${terms.block} *` |
| Label "Unidade/Apt" | "Unidade/Apt *" | `${terms.unit} *` |
| Tooltip texto | "Dados pessoais de usuários autenticados..." | Adaptar com terminologia |

### 2.3 AddMemberDialog.tsx

| Local | Atual | Dinâmico |
|-------|-------|----------|
| DialogDescription | "Cadastre um novo morador..." | `Cadastre um novo ${terms.member.toLowerCase()}...` |
| Tab "Novo Morador" | "Novo Morador" | `Novo ${terms.member}` |
| Label "Bloco/Torre" | "Bloco/Torre *" | `${terms.block} *` |
| Label "Unidade/Apt" | "Unidade/Apt *" | `${terms.unit} *` |
| SelectItem "Morador" | "Morador" | `terms.member` |
| SelectItem "Síndico" | "Síndico" | `terms.manager` |

### 2.4 ImportMembersDialog.tsx

| Local | Atual | Dinâmico |
|-------|-------|----------|
| DialogTitle | "Importar Moradores" | `Importar ${terms.memberPlural}` |
| Textos de progresso | "moradores..." | `terms.memberPlural.toLowerCase()` |
| Nome do arquivo modelo | "modelo_moradores.xlsx" | `modelo_${terms.memberPlural.toLowerCase()}.xlsx` |
| TableHead "Bloco" | "Bloco" | `terms.block` |
| TableHead "Unidade" | "Unidade" | `terms.unit` |

### 2.5 AdminCondominiumPage.tsx

| Local | Atual | Dinâmico |
|-------|-------|----------|
| Botão link "Moradores" | "Moradores" | `terms.memberPlural` |
| Nav item | "Moradores" | `terms.memberPlural` |

### 2.6 SuperAdminCondoMembers.tsx

| Local | Atual | Dinâmico |
|-------|-------|----------|
| Mensagens e labels | Vários | Usar terms |

---

## 3. Atualizar roleLabels Dinamicamente

### Criar função helper em organization-types.ts

```typescript
export function getRoleLabel(
  role: "admin" | "syndic" | "resident" | "collaborator",
  terms: OrganizationTerms
): string {
  const labels: Record<string, string> = {
    admin: "Administrador",
    syndic: terms.manager,        // Síndico → Diretor
    resident: terms.member,       // Morador → Aluno
    collaborator: "Colaborador",
  };
  return labels[role] || role;
}
```

### Onde aplicar

- `CondoMembersPage.tsx` - roleLabels
- `SuperAdminCondoMembers.tsx` - roleLabels  
- `AddMemberDialog.tsx` - SelectItem labels
- `UserRoleBadges.tsx` - roleLabels

---

## 4. Prop Drilling vs Context

Para evitar prop drilling excessivo, os diálogos receberão `terms` como prop:

```typescript
interface EditMemberDialogProps {
  member: CondoMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (...) => Promise<...>;
  terms: OrganizationTerms;  // Nova prop
}
```

---

## 5. Arquivos a Modificar/Criar

| Arquivo | Ação |
|---------|------|
| `src/hooks/useOrganizationTerms.ts` | **CRIAR** |
| `src/lib/organization-types.ts` | Adicionar `getRoleLabel()` |
| `src/pages/CondoMembersPage.tsx` | Usar hook + passar terms |
| `src/components/EditMemberDialog.tsx` | Receber terms como prop |
| `src/components/super-admin/AddMemberDialog.tsx` | Receber terms como prop |
| `src/components/ImportMembersDialog.tsx` | Receber terms como prop |
| `src/pages/AdminCondominiumPage.tsx` | Usar hook para labels |
| `src/pages/super-admin/SuperAdminCondoMembers.tsx` | Usar hook |
| `src/pages/DashboardPage.tsx` | Usar getRoleLabel |
| `src/components/super-admin/UserRoleBadges.tsx` | Atualizar para suportar terms |

---

## 6. Exemplo de Uso Final

### Escola (organization_type = "school")

```
┌─────────────────────────────────────────┐
│ ← Alunos                      [+ Adicionar] │
│ Escola Municipal ABC                        │
├─────────────────────────────────────────┤
│ Usuário │ Telefone │ Série/Turma │ Função │
│ João    │ 11999... │ 8A, 301    │ Aluno  │
│ Maria   │ 11888... │ 9B, 205    │ Aluno  │
└─────────────────────────────────────────┘
```

### Academia (organization_type = "gym")

```
┌─────────────────────────────────────────┐
│ ← Alunos                      [+ Adicionar] │
│ Academia Fitness Plus                       │
├─────────────────────────────────────────┤
│ Usuário │ Telefone │ Turma/Mod  │ Função │
│ Carlos  │ 11999... │ Manhã, Musculação │ Aluno │
└─────────────────────────────────────────┘
```

---

## 7. Ordem de Implementação

1. Criar `src/hooks/useOrganizationTerms.ts`
2. Adicionar `getRoleLabel()` em `organization-types.ts`
3. Atualizar `CondoMembersPage.tsx` como página principal
4. Atualizar `EditMemberDialog.tsx` com prop terms
5. Atualizar `AddMemberDialog.tsx` com prop terms
6. Atualizar `ImportMembersDialog.tsx` com prop terms
7. Atualizar `AdminCondominiumPage.tsx` para labels dinâmicos
8. Atualizar `SuperAdminCondoMembers.tsx`
9. Atualizar `DashboardPage.tsx` para roleLabels dinâmicos

---

## Resultado Esperado

- Ao acessar página de membros de uma Escola, ver "Alunos" ao invés de "Moradores"
- Labels de formulário mostram "Série" e "Turma" ao invés de "Bloco" e "Unidade"
- Funções mostram "Diretor" ao invés de "Síndico" para escolas
- Importação de planilha usa terminologia correta
- Sistema totalmente adaptável por tipo de organização

