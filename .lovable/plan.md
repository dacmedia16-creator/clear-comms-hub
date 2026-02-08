# AVISO PRO - Roadmap de Evolucao Multi-Segmento

## Visao Geral

Transformar o AVISO PRO de uma plataforma focada em condominios para uma solucao multi-segmento que atende escolas, empresas, clinicas, academias, igrejas, clubes e associacoes.

---

## Fases Concluidas

### ✅ Fase 1 - Infraestrutura Base (Concluida)
- Enum `organization_type` no banco de dados
- Coluna `organization_type` na tabela condominiums
- Valores: condominium, school, company, clinic, association, gym, church, club, other

### ✅ Fase 2 - Terminologia Dinamica (Concluida)
- Arquivo `src/lib/organization-types.ts` com configuracao completa
- Hook `useOrganizationTerms` para obter terminologia
- Integracao em AdminCondominiumPage, TimelinePage, CondoMembersPage
- Labels dinamicos: Morador→Aluno, Sindico→Diretor, Bloco→Serie, etc.

### ✅ Fase 3 - Categorias Hibridas por Segmento (Concluida)
- Arquivo `src/lib/category-config.ts` com sistema de categorias
- Categorias universais: Informativo, Financeiro, Manutencao, Convivencia, Seguranca, Urgente
- Categorias especificas: Pedagogico (escola), RH (empresa), Treinos (academia), Cultos (igreja), etc.
- Hook `useCategoriesForOrganization` para filtragem dinamica
- Migracao SQL para adicionar novos valores ao enum `announcement_category`

### ✅ Fase 4 - Onboarding Dinamico (Concluida)
- Hook `useOrganizationFromCode` para validar codigo e detectar tipo
- Arquivo `src/lib/signup-config.ts` com configuracao de formularios
- Pagina `SignupTypePage` com cards genericos (Membro/Gestor)
- Pagina `SignupMemberPage` com labels dinamicos por tipo de organizacao
- Pagina `SignupManagerPage` com labels dinamicos por tipo de organizacao
- Rotas atualizadas com redirects para compatibilidade (/resident → /member, /syndic → /manager)
- Deteccao automatica do tipo quando usuario digita codigo da organizacao

### ✅ Fase 5 - Landing Page Multi-Segmento (Concluida)
- Componente `SegmentGrid` com grid de 8 tipos de organizacao
- Componente `UseCaseTabs` com casos de uso interativos por segmento
- Tabs para Condominios, Escolas, Empresas, Clinicas, Academias e Igrejas
- Headlines e CTAs personalizados por segmento
- Integracao na landing page principal (Index.tsx)

### ✅ Fase 6 - Dashboard Personalizado por Segmento (Concluida)
- Arquivo `src/lib/announcement-templates.ts` com templates por tipo de organizacao
- Templates para Condominios, Escolas, Empresas, Clinicas, Academias, Igrejas
- Seletor de templates no formulario de criacao de avisos
- Acoes rapidas com cards de templates na pagina de administracao
- Componentes `DashboardQuickActions` e `DashboardStats` para widgets

---

## Proxima Fase

#### Objetivo
Conectar o AVISO PRO a sistemas externos para automacao e integracao de dados.

#### 7.1 APIs e Webhooks

| Funcionalidade | Descricao |
|----------------|-----------|
| Webhook de avisos | Notificar sistemas externos sobre novos avisos |
| API REST | Endpoints para integracao com ERPs e sistemas escolares |
| Import em lote | Importar membros via CSV/Excel de sistemas externos |

#### 7.2 Integrações Especificas

| Segmento | Integracoes Potenciais |
|----------|------------------------|
| Escola | SIGEduc, Totvs Educacional |
| Empresa | SAP, Totvs Protheus, Gupy |
| Condominio | SuperLogica, CondoMaster |

---

## Fases Futuras

### Fase 8 - White Label por Segmento
- Temas visuais por tipo de organizacao
- Logos e branding customizaveis
- Dominios personalizados

### Fase 9 - Analytics Avançado
- Dashboard de metricas de engajamento
- Relatorios por categoria e segmento
- Exportacao de dados

---

## Arquivos Principais do Sistema Multi-Segmento

| Arquivo | Proposito |
|---------|-----------|
| `src/lib/organization-types.ts` | Tipos e terminologia por segmento |
| `src/lib/category-config.ts` | Categorias de avisos por segmento |
| `src/lib/signup-config.ts` | Configuracao de formularios de signup |
| `src/lib/announcement-templates.ts` | Templates de avisos por segmento |
| `src/hooks/useOrganizationTerms.ts` | Hook para terminologia dinamica |
| `src/hooks/useCategoriesForOrganization.ts` | Hook para categorias por tipo |
| `src/hooks/useOrganizationFromCode.ts` | Hook para detectar tipo via codigo |
| `src/components/landing/SegmentGrid.tsx` | Grid de segmentos na landing |
| `src/components/landing/UseCaseTabs.tsx` | Casos de uso por segmento |

---

## Metricas de Sucesso

- Taxa de conversao de signup por segmento
- Tempo medio de onboarding
- Satisfacao do usuario (NPS) por tipo de organizacao
- Retencao mensal por segmento
