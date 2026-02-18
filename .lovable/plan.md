
## Segmento Generico -- Apenas para Super Admin

Adicionar um novo tipo de organizacao "generic" ao sistema, disponivel exclusivamente para o Super Admin criar organizacoes que nao se encaixam nos 7 segmentos oficiais. Membros precisam apenas de Nome, Telefone e Email (nenhum obrigatorio alem do nome da org).

---

### 1. Migracao no banco de dados

Adicionar o valor `generic` ao enum `organization_type`:

```text
ALTER TYPE organization_type ADD VALUE IF NOT EXISTS 'generic';
```

### 2. Atualizar `src/lib/organization-types.ts`

Adicionar a entrada `generic` ao mapa `ORGANIZATION_TYPES`:

| Campo | Valor |
|---|---|
| label | "Genérico" |
| description | "Organizações sem segmento específico" |
| examples | "Grupos diversos, projetos" |
| icon | `Layers` (lucide-react) |
| terms.organization | "Organização" |
| terms.manager | "Gestor" |
| terms.member | "Membro" |
| terms.block | "Grupo" |
| terms.unit | "Categoria" |
| behavior.requiresLocation | false |
| behavior.blockValidation | "flexible" |
| behavior.showLocationInTimeline | false |
| behavior.showLocationTargeting | false |

Atualizar o tipo `OrganizationType` para incluir `"generic"`.

Adicionar placeholder em `getLocationPlaceholders` para `generic`.

### 3. Ocultar do site publico

Criar uma constante `PUBLIC_ORGANIZATION_TYPES` que exclui `generic`, e usa-la nos pontos publicos:

| Arquivo | Mudanca |
|---|---|
| `src/lib/organization-types.ts` | Nova constante `PUBLIC_ORGANIZATION_TYPE_OPTIONS` filtrando `generic` |
| `src/pages/auth/SignupTypePage.tsx` | Trocar `ORGANIZATION_TYPE_OPTIONS` por `PUBLIC_ORGANIZATION_TYPE_OPTIONS` |
| `src/components/landing/SegmentGrid.tsx` | Trocar para `PUBLIC_ORGANIZATION_TYPE_OPTIONS` (se usar a lista dinamicamente) |

Nos paineis do Super Admin (`SuperAdminCondominiums`, `SuperAdminSegments`, `DashboardPage`), manter `ORGANIZATION_TYPE_OPTIONS` completo para que o tipo generico apareca nos dropdowns e filtros administrativos.

### 4. Nenhuma landing page para "generic"

O tipo generico nao tera pagina dedicada, link no grid, nem rota publica.

---

### Resumo de arquivos

| Arquivo | Acao |
|---|---|
| Migracao SQL | Novo valor `generic` no enum |
| `src/lib/organization-types.ts` | Adicionar tipo + config + constante publica filtrada |
| `src/pages/auth/SignupTypePage.tsx` | Usar lista publica (sem generic) |
| `src/components/landing/SegmentGrid.tsx` | Sem mudanca (ja usa lista fixa de segmentos, nao dinamica) |
