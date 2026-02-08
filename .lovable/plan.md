

# Plano: Simplificar Tipos de Organizacao para 6 Categorias

## Resumo

Consolidar os tipos de organizacao de 9 para 6 opcoes mais abrangentes e comercialmente relevantes, que representam melhor os segmentos-alvo do AVISO PRO.

---

## Novos Tipos de Organizacao

| Slug | Label | Descricao |
|------|-------|-----------|
| `condominium` | Condominio | Mantido como esta |
| `healthcare` | Clinicas e instituicoes de saude | Consolida "clinic" |
| `company` | Empresas com equipes operacionais | Mantido/renomeado |
| `community` | Associacoes, clubes e comunidades | Consolida "association", "club" |
| `church` | Igrejas e instituicoes religiosas | Mantido |
| `franchise` | Franquias e redes de lojas | Novo tipo |

### Tipos Removidos
- `school` (Escola) - Pode usar "Empresa" ou futuro tipo "Educacao"
- `gym` (Academia) - Pode usar "Empresa" ou "Comunidade"
- `other` (Outros) - Removido, sera substituido por tipo mais adequado

---

## Arquivos a Modificar

### 1. Migracao do Banco de Dados

Atualizar o enum `organization_type` no banco de dados:

```sql
-- Migrar dados existentes para novos tipos
UPDATE condominiums SET organization_type = 'healthcare' WHERE organization_type = 'clinic';
UPDATE condominiums SET organization_type = 'community' WHERE organization_type IN ('association', 'club', 'gym');
UPDATE condominiums SET organization_type = 'company' WHERE organization_type IN ('school', 'other');

-- Alterar o enum
ALTER TYPE organization_type RENAME TO organization_type_old;
CREATE TYPE organization_type AS ENUM ('condominium', 'healthcare', 'company', 'community', 'church', 'franchise');
ALTER TABLE condominiums ALTER COLUMN organization_type TYPE organization_type USING organization_type::text::organization_type;
DROP TYPE organization_type_old;
```

### 2. src/lib/organization-types.ts

Reescrever completamente com os 6 novos tipos:

```typescript
export type OrganizationType =
  | "condominium"
  | "healthcare"
  | "company"
  | "community"
  | "church"
  | "franchise";

export const ORGANIZATION_TYPES: Record<OrganizationType, OrganizationTypeConfig> = {
  condominium: {
    label: "Condominio",
    icon: Building2,
    terms: { ... } // Mantido
  },
  healthcare: {
    label: "Clinicas e instituicoes de saude",
    icon: Stethoscope,
    terms: {
      organization: "Instituicao",
      manager: "Administrador",
      member: "Paciente",
      block: "Setor",
      unit: "Area",
    }
  },
  company: {
    label: "Empresas com equipes operacionais",
    icon: Briefcase,
    terms: {
      organization: "Empresa",
      manager: "Gestor",
      member: "Colaborador",
      block: "Departamento",
      unit: "Cargo",
    }
  },
  community: {
    label: "Associacoes, clubes e comunidades",
    icon: Users,
    terms: {
      organization: "Comunidade",
      manager: "Presidente",
      member: "Membro",
      block: "Grupo",
      unit: "Categoria",
    }
  },
  church: {
    label: "Igrejas e instituicoes religiosas",
    icon: Church,
    terms: {
      organization: "Igreja",
      manager: "Pastor",
      member: "Membro",
      block: "Ministerio",
      unit: "Grupo",
    }
  },
  franchise: {
    label: "Franquias e redes de lojas",
    icon: Store,
    terms: {
      organization: "Rede",
      manager: "Franqueador",
      member: "Franqueado",
      block: "Regiao",
      unit: "Unidade",
    }
  },
};
```

### 3. src/lib/category-config.ts

Atualizar as categorias especificas por segmento para os novos tipos:

- `clinic` -> `healthcare`
- `association`, `club` -> `community`
- Adicionar categorias para `franchise`

### 4. src/lib/signup-config.ts

Atualizar configuracoes de formulario para os novos tipos.

### 5. src/components/landing/SegmentGrid.tsx

Atualizar para mostrar os 6 novos segmentos.

### 6. src/components/landing/UseCaseTabs.tsx

Atualizar casos de uso para os 6 novos tipos.

---

## Mapeamento de Migracao

| Tipo Antigo | Novo Tipo |
|-------------|-----------|
| condominium | condominium |
| clinic | healthcare |
| company | company |
| school | company |
| association | community |
| club | community |
| gym | community |
| church | church |
| other | company |

---

## Detalhes Tecnicos

### Terminologia Dinamica (Novos Tipos)

**healthcare:**
- Organizacao: Instituicao de Saude
- Gestor: Administrador
- Membro: Paciente
- Bloco: Setor | Unidade: Area

**franchise:**
- Organizacao: Rede
- Gestor: Franqueador/Gestor
- Membro: Franqueado/Lojista
- Bloco: Regiao | Unidade: Loja

**community:**
- Organizacao: Comunidade
- Gestor: Presidente
- Membro: Membro/Associado
- Bloco: Grupo | Unidade: Categoria

### Novo Icone Necessario

Adicionar icone `Store` do lucide-react para o tipo "franchise".

### Impacto na Landing Page

A landing page sera atualizada para mostrar 6 cards no SegmentGrid ao inves de 8, com os novos labels e descricoes mais comerciais.

---

## Ordem de Execucao

1. Migrar banco de dados (alterar enum e dados existentes)
2. Atualizar `organization-types.ts`
3. Atualizar `category-config.ts`
4. Atualizar `signup-config.ts`
5. Atualizar componentes da landing page
6. Testar fluxo completo de criacao

