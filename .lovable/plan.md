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

---

## Proxima Fase

### 🔄 Fase 5 - Landing Page Multi-Segmento

#### Objetivo
Adaptar a landing page para comunicar valor para diferentes tipos de organizacao, mostrando casos de uso e beneficios especificos para cada segmento.

#### 5.1 Estrutura Proposta

```text
Landing Page
    |
    +-- Hero Section (dinamico ou com tabs)
    |
    +-- Segmentos Atendidos (grid com icones)
    |
    +-- Casos de Uso por Segmento (carousel/tabs)
    |
    +-- Testimonials por Segmento
    |
    +-- CTA Personalizado
```

#### 5.2 Componentes a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/components/landing/SegmentGrid.tsx` | Grid com icones dos tipos de organizacao |
| `src/components/landing/UseCaseTabs.tsx` | Tabs mostrando casos de uso por segmento |
| `src/components/landing/SegmentBenefits.tsx` | Beneficios especificos por tipo |

#### 5.3 Casos de Uso por Segmento

| Segmento | Casos de Uso |
|----------|--------------|
| **Condominio** | Assembleias, manutencoes, regras de convivencia, financeiro |
| **Escola** | Reunioes de pais, calendario escolar, avisos pedagogicos, eventos |
| **Empresa** | Comunicados RH, compliance, treinamentos, eventos corporativos |
| **Clinica** | Horarios de atendimento, campanhas de saude, procedimentos |
| **Academia** | Horarios de aulas, manutencao de equipamentos, eventos fitness |
| **Igreja** | Cultos, eventos, acoes sociais, avisos pastorais |

#### 5.4 Mensagens por Segmento

| Segmento | Headline | Subheadline |
|----------|----------|-------------|
| Condominio | "Comunicacao oficial para seu condominio" | "Reduza ruido e aumente clareza" |
| Escola | "Mantenha pais e alunos informados" | "Comunicacao escolar organizada" |
| Empresa | "Comunicados corporativos sem ruido" | "Do RH ao colaborador em segundos" |

#### 5.5 Implementacao Sugerida

1. Criar componente `SegmentGrid` com ORGANIZATION_TYPES
2. Adicionar tabs na Hero para alternar entre segmentos
3. Criar secao de casos de uso com conteudo dinamico
4. Adicionar CTAs contextuais ("Sou Sindico" vs "Sou Diretor")
5. Integrar analytics para tracking de interesse por segmento

---

## Fases Futuras

### Fase 6 - Dashboard Personalizado por Segmento
- Widgets especificos por tipo de organizacao
- Metricas relevantes para cada segmento
- Templates de avisos pre-configurados

### Fase 7 - Integracao com Sistemas Externos
- API para sistemas escolares
- Integracao com ERPs empresariais
- Webhooks para automacoes

### Fase 8 - White Label por Segmento
- Temas visuais por tipo de organizacao
- Logos e branding customizaveis
- Dominios personalizados

---

## Arquivos Principais do Sistema Multi-Segmento

| Arquivo | Proposito |
|---------|-----------|
| `src/lib/organization-types.ts` | Tipos e terminologia por segmento |
| `src/lib/category-config.ts` | Categorias de avisos por segmento |
| `src/lib/signup-config.ts` | Configuracao de formularios de signup |
| `src/hooks/useOrganizationTerms.ts` | Hook para terminologia dinamica |
| `src/hooks/useCategoriesForOrganization.ts` | Hook para categorias por tipo |
| `src/hooks/useOrganizationFromCode.ts` | Hook para detectar tipo via codigo |

---

## Metricas de Sucesso

- Taxa de conversao de signup por segmento
- Tempo medio de onboarding
- Satisfacao do usuario (NPS) por tipo de organizacao
- Retencao mensal por segmento
