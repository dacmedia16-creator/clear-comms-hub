
# Plano: Dashboard de Segmentos para Super Admin

## Problema Atual

Quando o Super Admin faz login, ele cai na página `/dashboard` (DashboardPage) que mostra apenas os condomínios vinculados a ele. Não há uma visão consolidada dos 6 segmentos de organização onde ele pode criar e gerenciar organizações diretamente por categoria.

---

## Solução Proposta

Criar uma nova página `/super-admin/segments` que exibe os 6 tipos de organização em cards, com estatísticas de cada segmento e um botão para criar novas organizações diretamente. Esta página será acessada antes da listagem de condomínios.

---

## Nova Estrutura de Navegação

```text
/super-admin → Dashboard com cards de acesso rápido
     ↓
/super-admin/segments → NOVA: Grid dos 6 segmentos com estatísticas
     ↓
/super-admin/segments/:type → Filtra lista de organizações por tipo
     ↓
/super-admin/condominiums → Lista completa (todos os tipos)
```

---

## Interface da Nova Página (SuperAdminSegments)

```text
┌──────────────────────────────────────────────────────────────────┐
│  ◀ Super Admin                                                   │
│                                                                  │
│  Segmentos de Organização                                        │
│  Gerencie e crie organizações por categoria                      │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │ 🏢              │  │ 🏥              │  │ 💼              │   │
│  │                 │  │                 │  │                 │   │
│  │ Condomínios     │  │ Clínicas        │  │ Empresas        │   │
│  │                 │  │ e Saúde         │  │                 │   │
│  │ 15 organizações │  │ 8 organizações  │  │ 12 organizações │   │
│  │                 │  │                 │  │                 │   │
│  │ [Ver] [+Criar]  │  │ [Ver] [+Criar]  │  │ [Ver] [+Criar]  │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │ 👥              │  │ ⛪              │  │ 🏪              │   │
│  │                 │  │                 │  │                 │   │
│  │ Comunidades     │  │ Igrejas         │  │ Franquias       │   │
│  │                 │  │                 │  │                 │   │
│  │ 5 organizações  │  │ 20 organizações │  │ 3 organizações  │   │
│  │                 │  │                 │  │                 │   │
│  │ [Ver] [+Criar]  │  │ [Ver] [+Criar]  │  │ [Ver] [+Criar]  │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Arquivos a Criar/Modificar

### 1. CRIAR: src/pages/super-admin/SuperAdminSegments.tsx

Nova página com:
- Header padrão do Super Admin
- Grid responsivo com 6 cards (1 por segmento)
- Cada card mostra:
  - Ícone do segmento
  - Nome do segmento
  - Descrição curta
  - Quantidade de organizações desse tipo
  - Botão "Ver" → filtra lista por tipo
  - Botão "Criar" → abre modal de criação pré-selecionando o tipo
- Modal de criação integrado (similar ao de SuperAdminCondominiums)

### 2. MODIFICAR: src/pages/super-admin/SuperAdminDashboard.tsx

Adicionar novo card de acesso rápido:
- "Gerenciar Segmentos" → link para `/super-admin/segments`
- Mostra resumo das organizações por tipo

### 3. MODIFICAR: src/App.tsx

Adicionar nova rota:
```typescript
<Route path="/super-admin/segments" element={<SuperAdminSegments />} />
```

### 4. MODIFICAR: src/components/mobile/MobileBottomNav.tsx (no contexto do SuperAdmin)

Atualizar navegação inferior para incluir link para Segmentos

---

## Funcionalidades do Card de Segmento

| Elemento | Descrição |
|----------|-----------|
| Ícone | Building2, Stethoscope, Briefcase, Users, Church, Store |
| Título | Condomínio, Clínicas e Saúde, Empresas, etc. |
| Descrição | Texto curto do segmento |
| Contador | Número de organizações desse tipo |
| Botão Ver | Navega para lista filtrada por tipo |
| Botão Criar | Abre modal com tipo pré-selecionado |

---

## Modal de Criação

Reutilizar a lógica existente de `SuperAdminCondominiums`, mas:
1. Pré-selecionar o `organization_type` baseado no card clicado
2. Manter o select de tipo caso o admin queira mudar
3. Manter todos os outros campos (Nome, Proprietário, Plano, Descrição)

---

## Consulta de Estatísticas

```typescript
// Agrupar organizações por tipo
const stats = condominiums.reduce((acc, condo) => {
  const type = condo.organization_type || 'condominium';
  acc[type] = (acc[type] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
```

---

## Navegação Mobile

Atualizar items da navegação inferior no contexto Super Admin:

| Ícone | Label | Path |
|-------|-------|------|
| LayoutDashboard | Dashboard | /super-admin |
| Grid3x3 | Segmentos | /super-admin/segments |
| Building2 | Orgs | /super-admin/condominiums |
| Users | Usuários | /super-admin/users |
| Bell | Notificações | /super-admin/notifications |

---

## Resumo de Alterações

| Arquivo | Ação |
|---------|------|
| `src/pages/super-admin/SuperAdminSegments.tsx` | CRIAR - Página de segmentos |
| `src/pages/super-admin/SuperAdminDashboard.tsx` | Adicionar card de acesso ao Segmentos |
| `src/App.tsx` | Adicionar rota /super-admin/segments |
