

## Novo Segmento: Escolas e Cursos

Adicionar o 7o segmento da plataforma para instituicoes de ensino como escolas, cursinhos e universidades.

### Terminologia do segmento

| Campo | Valor |
|-------|-------|
| Tipo | `school` |
| Label | Escolas e Cursos |
| Icone | `GraduationCap` |
| Gestor | Diretor |
| Membro | Aluno |
| Bloco | Serie |
| Unidade | Turma |
| Exemplos | Escolas, cursinhos, universidades |

### Comportamento

- Localizacao (Serie/Turma): **opcional** (flexivel)
- Segmentacao por localizacao na interface: **desativada** (mesmo padrao de healthcare/company)

### Arquivos a alterar

**1. Banco de dados** - Adicionar valor `school` ao enum `organization_type`
```sql
ALTER TYPE public.organization_type ADD VALUE IF NOT EXISTS 'school';
```

**2. `src/lib/organization-types.ts`**
- Adicionar `"school"` ao tipo `OrganizationType`
- Adicionar import do icone `GraduationCap`
- Adicionar configuracao completa do segmento `school` em `ORGANIZATION_TYPES`
- Adicionar placeholders de localizacao: `{ block: "1o Ano, 2o Ano", unit: "Turma A, Turma B" }`

**3. `src/lib/category-config.ts`**
- Adicionar 2 categorias especificas do segmento:
  - `academico` (icon: BookOpen, "Academico") - para comunicados sobre aulas, notas, matriculas
  - `pedagogico` (icon: GraduationCap, "Pedagogico") - para reunioes de pais, orientacao pedagogica
- Adicionar `"school"` ao array `organizationTypes` da categoria `eventos` (ja compartilhada por outros segmentos)

**4. `src/lib/announcement-templates.ts`**
- Adicionar templates especificos para escolas:
  - "Reuniao de Pais" (categoria: pedagogico)
  - "Calendario Escolar" (categoria: academico)
  - "Comunicado da Diretoria" (categoria: informativo)

**5. `src/lib/signup-config.ts`**
- Adicionar configuracao de formulario para `school`:
  - memberTitle: "Cadastro de Aluno/Responsavel"
  - unitLabel: "Serie e Turma"
  - codeLabel: "Codigo da Escola"
  - managerTitle: "Cadastro de Diretor"

**6. `src/components/landing/SegmentGrid.tsx`**
- Adicionar card "Escolas e Cursos" com icone GraduationCap e termos Diretor/Aluno

**7. `src/components/landing/UseCaseTabs.tsx`**
- Adicionar aba "Escolas e Cursos" com 4 casos de uso: reunioes de pais, calendario escolar, matriculas e comunicados da diretoria

### Arquivos que NAO precisam de alteracao

- Hooks (`useOrganizationTerms`, `useOrganizationBehavior`, `useCategoriesForOrganization`) - sao genericos e ja funcionam com qualquer tipo
- Paginas de signup - usam rotas parametrizadas que ja se adaptam
- Super Admin - filtros e gestao ja funcionam dinamicamente
- Templates WhatsApp - sao universais para todos os segmentos

