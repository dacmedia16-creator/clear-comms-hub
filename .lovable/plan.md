

## Segmento Genérico -- Implementação completa

### 1. Migração no banco de dados

Adicionar o valor `generic` ao enum `organization_type`:

```text
ALTER TYPE organization_type ADD VALUE IF NOT EXISTS 'generic';
```

### 2. Atualizar `src/lib/organization-types.ts`

- Adicionar `"generic"` ao tipo `OrganizationType`
- Adicionar configuração completa no mapa `ORGANIZATION_TYPES` (label "Genérico", icon `Layers`, termos neutros, behavior sem localização)
- Adicionar placeholder para `generic` em `getLocationPlaceholders`
- Criar constante `PUBLIC_ORGANIZATION_TYPE_OPTIONS` que exclui `generic`

### 3. Atualizar `src/pages/auth/SignupTypePage.tsx`

- Trocar `ORGANIZATION_TYPE_OPTIONS` por `PUBLIC_ORGANIZATION_TYPE_OPTIONS` para ocultar o tipo genérico do cadastro público

### Resumo

| Arquivo | Ação |
|---|---|
| Migração SQL | Novo valor `generic` no enum |
| `src/lib/organization-types.ts` | Tipo + config + constante pública filtrada |
| `src/pages/auth/SignupTypePage.tsx` | Usar lista pública (sem generic) |

