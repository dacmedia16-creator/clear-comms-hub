

# Plano: Aprimorar Tela de Seleção de Tipo de Organização

## Contexto

Atualmente, a página `SignupTypePage.tsx` oferece apenas 2 opções genéricas (Membro/Gestor). Vamos transformá-la para exibir os 6 tipos de organização com ícones e descrições detalhadas, permitindo que o usuário escolha o tipo antes de prosseguir para o cadastro.

---

## Novo Fluxo de Cadastro

```
/auth/signup → Escolher tipo de organização (6 opções)
     ↓
/auth/signup/:type → Escolher perfil (Membro ou Gestor)
     ↓
/auth/signup/:type/member ou /auth/signup/:type/manager → Formulário
```

---

## Interface Proposta

### Tela Principal (SignupTypePage)

Uma grade responsiva com 6 cards, cada um contendo:
- Ícone específico do segmento (colorido)
- Título do tipo de organização
- Descrição curta explicando o público-alvo
- Exemplos de uso

| Tipo | Ícone | Descrição |
|------|-------|-----------|
| Condomínio | Building2 | Residenciais, comerciais e mistos. Para síndicos e moradores. |
| Clínicas e Saúde | Stethoscope | Hospitais, clínicas e consultórios. Para gestores e pacientes. |
| Empresas | Briefcase | Equipes operacionais e corporativas. Para gestores e colaboradores. |
| Comunidades | Users | Associações, clubes e grupos. Para presidentes e membros. |
| Igrejas | Church | Igrejas e instituições religiosas. Para pastores e membros. |
| Franquias | Store | Redes de lojas e franquias. Para franqueadores e franqueados. |

---

## Arquivos a Modificar/Criar

### 1. src/lib/organization-types.ts

Adicionar campo `description` com textos descritivos para cada tipo:

```typescript
export interface OrganizationTypeConfig {
  label: string;
  description: string;  // NOVO
  examples: string;     // NOVO - exemplos de uso
  icon: LucideIcon;
  terms: OrganizationTerms;
}

// Exemplo para condominium:
condominium: {
  label: "Condomínio",
  description: "Residenciais, comerciais e mistos",
  examples: "Prédios, vilas, loteamentos",
  icon: Building2,
  terms: { ... }
}
```

### 2. src/pages/auth/SignupTypePage.tsx

Reescrever completamente para:
- Exibir os 6 tipos de organização em grid responsivo
- Usar `ORGANIZATION_TYPE_OPTIONS` do organization-types.ts
- Linkar para `/auth/signup/:type` ao selecionar

Layout:
- **Mobile**: 1 coluna (cards empilhados)
- **Tablet**: 2 colunas
- **Desktop**: 3 colunas

### 3. NOVO: src/pages/auth/SignupRolePage.tsx

Nova página intermediária para escolher perfil:
- Recebe o tipo via URL param (`:type`)
- Exibe 2 cards: Membro e Gestor
- Usa terminologia dinâmica baseada no tipo selecionado
- Redireciona para `/auth/signup/:type/member` ou `/auth/signup/:type/manager`

### 4. src/pages/auth/SignupMemberPage.tsx

Atualizar para:
- Ler o tipo da URL (`/auth/signup/:type/member`)
- Usar terminologia e configuração específica do tipo
- Manter funcionalidade atual de código dinâmico

### 5. src/pages/auth/SignupManagerPage.tsx

Atualizar para:
- Ler o tipo da URL (`/auth/signup/:type/manager`)
- Usar terminologia e configuração específica do tipo
- Manter funcionalidade atual de código dinâmico

### 6. src/App.tsx

Atualizar rotas para o novo fluxo:
```typescript
<Route path="/auth/signup" element={<SignupTypePage />} />
<Route path="/auth/signup/:type" element={<SignupRolePage />} />
<Route path="/auth/signup/:type/member" element={<SignupMemberPage />} />
<Route path="/auth/signup/:type/manager" element={<SignupManagerPage />} />
```

---

## Detalhes Visuais

### Card de Tipo de Organização

```
┌─────────────────────────────────────┐
│  ┌────────┐                         │
│  │ 🏢     │  Condomínio             │
│  │ ícone  │                         │
│  └────────┘  Residenciais,          │
│              comerciais e mistos.   │
│                                     │
│  Exemplos: Prédios, vilas,          │
│  loteamentos                        │
└─────────────────────────────────────┘
```

### Hover State
- Borda muda para cor primária
- Sombra aumenta
- Ícone ganha destaque (background muda)

---

## Descrições Propostas

| Tipo | Descrição | Exemplos |
|------|-----------|----------|
| condominium | Residenciais, comerciais e mistos | Prédios, vilas, loteamentos |
| healthcare | Hospitais, clínicas e consultórios | Clínicas, laboratórios, hospitais |
| company | Equipes operacionais e corporativas | Fábricas, escritórios, times remotos |
| community | Associações, clubes e grupos | ONGs, clubes sociais, cooperativas |
| church | Igrejas e instituições religiosas | Templos, paróquias, ministérios |
| franchise | Redes de lojas e franquias | Lojas, quiosques, unidades |

---

## Resumo de Alterações

| Arquivo | Ação |
|---------|------|
| `src/lib/organization-types.ts` | Adicionar `description` e `examples` |
| `src/pages/auth/SignupTypePage.tsx` | Reescrever com grid de 6 tipos |
| `src/pages/auth/SignupRolePage.tsx` | CRIAR - Escolha Membro/Gestor |
| `src/pages/auth/SignupMemberPage.tsx` | Atualizar para ler tipo da URL |
| `src/pages/auth/SignupManagerPage.tsx` | Atualizar para ler tipo da URL |
| `src/App.tsx` | Atualizar rotas |

