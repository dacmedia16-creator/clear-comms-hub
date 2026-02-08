
# Plano: Fase 4 - Onboarding Dinamico por Tipo de Organizacao

## Visao Geral

Transformar o fluxo de cadastro atual (focado em condominios) em um sistema de onboarding dinamico que adapta a linguagem, icones, campos de formulario e mensagens de acordo com o tipo de organizacao detectada. Isso melhora a experiencia do usuario e aumenta a conversao de diferentes segmentos.

---

## 1. Arquitetura Proposta

### 1.1 Novo Fluxo de Signup

```text
/auth/signup
    |
    v
[Pagina de Selecao de Tipo]  <-- NOVA
    |
    +-- Morador/Membro -> /auth/signup/member?type=school
    |
    +-- Gestor/Sindico -> /auth/signup/manager?type=company
```

### 1.2 Estrategia

Em vez de criar paginas separadas para cada tipo, usaremos query parameters para adaptar o conteudo:

- `/auth/signup` - Selecao de perfil (Membro ou Gestor)
- `/auth/signup/member` - Formulario de membro (adapta labels via query param `?type=`)
- `/auth/signup/manager` - Formulario de gestor (adapta labels via query param `?type=`)

---

## 2. Pagina de Selecao de Tipo: SignupTypePage.tsx

### 2.1 Mudancas Visuais

Substituir os cards estaticos "Morador" e "Sindico" por cards dinamicos que representam PERFIL (nao tipo de organizacao):

**Antes:**
- Sou Morador (icone Home)
- Sou Sindico (icone Building2)

**Depois:**
- Sou Membro (icone Users)
  - Descricao: "Quero receber os avisos da minha organizacao"
- Sou Gestor (icone Briefcase)
  - Descricao: "Quero criar e gerenciar avisos"

### 2.2 Rotas Atualizadas

| Perfil | Rota Destino |
|--------|--------------|
| Membro | `/auth/signup/member` |
| Gestor | `/auth/signup/manager` |

---

## 3. Formulario de Membro: SignupResidentPage.tsx -> SignupMemberPage.tsx

### 3.1 Deteccao Automatica do Tipo

Quando o usuario digita o codigo da organizacao, buscar o `organization_type` junto com os dados:

```typescript
const { data } = await supabase
  .from("condominiums")
  .select("id, name, organization_type")
  .eq("code", parseInt(trimmedCode, 10))
  .single();
```

### 3.2 Labels Dinamicos

| Campo | Condominio | Escola | Academia |
|-------|------------|--------|----------|
| Titulo | Cadastro de Morador | Cadastro de Aluno | Cadastro de Aluno |
| Descricao | "...do seu condominio" | "...da sua escola" | "...da sua academia" |
| Campo Unidade | Bloco e Unidade | Serie e Turma | Turma e Modalidade |
| Placeholder | "Bloco A, Apt 101" | "9A, Sala 203" | "Manha, Musculacao" |
| Toast | "...sindico do Condo X" | "...diretor da Escola X" | "...proprietario da Academia X" |

### 3.3 Implementacao

Usar o hook `getOrganizationTerms()` para obter a terminologia apos validar o codigo:

```typescript
const [terms, setTerms] = useState<OrganizationTerms>(getOrganizationTerms("condominium"));

// Apos validar codigo:
if (data?.organization_type) {
  setTerms(getOrganizationTerms(data.organization_type));
}
```

---

## 4. Formulario de Gestor: SignupSyndicPage.tsx -> SignupManagerPage.tsx

### 4.1 Labels Dinamicos Similares

| Campo | Condominio | Escola | Empresa |
|-------|------------|--------|---------|
| Titulo | Cadastro de Sindico | Cadastro de Diretor | Cadastro de Gestor |
| Descricao | "...como sindico de um condominio" | "...como diretor de uma escola" | "...como gestor de uma empresa" |
| Alerta | "...aprovacao do administrador" | "...aprovacao do administrador" | "...aprovacao do administrador" |

---

## 5. Componentes Auxiliares

### 5.1 Hook: useOrganizationFromCode

Criar um hook reutilizavel para validar codigo e obter tipo:

```typescript
// src/hooks/useOrganizationFromCode.ts

export function useOrganizationFromCode(code: string) {
  const [validating, setValidating] = useState(false);
  const [organization, setOrganization] = useState<{
    id: string;
    name: string;
    type: OrganizationType;
    terms: OrganizationTerms;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // useEffect com debounce...
  
  return { validating, organization, error };
}
```

### 5.2 Constante: SIGNUP_FORM_CONFIG

Opcional: Criar configuracao centralizada para labels de signup por tipo:

```typescript
// src/lib/signup-config.ts

export interface SignupFormConfig {
  memberTitle: string;        // "Cadastro de Morador"
  memberDescription: string;  // "Entre com o codigo..."
  unitLabel: string;          // "Bloco e Unidade"
  unitPlaceholder: string;    // "Bloco A, Apt 101"
}

export function getSignupFormConfig(type: OrganizationType): SignupFormConfig {
  // retorna config baseada no tipo
}
```

---

## 6. Atualizacao de Rotas

### 6.1 App.tsx

```typescript
// Antes
<Route path="/auth/signup/resident" element={<SignupResidentPage />} />
<Route path="/auth/signup/syndic" element={<SignupSyndicPage />} />

// Depois (alias para compatibilidade)
<Route path="/auth/signup/member" element={<SignupMemberPage />} />
<Route path="/auth/signup/manager" element={<SignupManagerPage />} />
<Route path="/auth/signup/resident" element={<Navigate to="/auth/signup/member" />} />
<Route path="/auth/signup/syndic" element={<Navigate to="/auth/signup/manager" />} />
```

---

## 7. Fluxo de Dados Completo

```text
1. Usuario acessa /auth/signup
   |
2. Ve cards: "Sou Membro" | "Sou Gestor"
   |
3. Clica "Sou Membro" -> /auth/signup/member
   |
4. Digita codigo "205"
   |
5. Sistema busca: condominiums WHERE code = 205
   -> Retorna: { id, name: "Escola Municipal", organization_type: "school" }
   |
6. Hook detecta tipo "school"
   -> terms = getOrganizationTerms("school")
   |
7. Interface adapta:
   - Titulo: "Cadastro de Aluno"
   - Campo: "Serie e Turma *"
   - Placeholder: "ex: 9A, Sala 101"
   |
8. Usuario preenche e envia
   |
9. Toast: "Aguarde aprovacao do diretor da Escola Municipal"
```

---

## 8. Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/hooks/useOrganizationFromCode.ts` | **CRIAR** | Hook para validar codigo e obter tipo |
| `src/pages/auth/SignupTypePage.tsx` | Atualizar | Cards "Membro" e "Gestor" genericos |
| `src/pages/auth/SignupMemberPage.tsx` | **CRIAR** | Novo formulario dinamico de membro |
| `src/pages/auth/SignupManagerPage.tsx` | **CRIAR** | Novo formulario dinamico de gestor |
| `src/pages/auth/SignupResidentPage.tsx` | Deprecar | Manter para redirect |
| `src/pages/auth/SignupSyndicPage.tsx` | Deprecar | Manter para redirect |
| `src/App.tsx` | Atualizar | Novas rotas + redirects |

---

## 9. Exemplos Visuais

### 9.1 SignupTypePage - Nova Versao

```
+------------------------------------------+
|              AVISO PRO                    |
+------------------------------------------+
|                                          |
|   Como voce quer usar o AVISO PRO?       |
|                                          |
| +------------------+ +------------------+ |
| |                  | |                  | |
| |     (Users)      | |   (Briefcase)    | |
| |                  | |                  | |
| |   Sou Membro     | |   Sou Gestor     | |
| |                  | |                  | |
| | Quero receber os | | Quero criar e    | |
| | avisos da minha  | | gerenciar avisos | |
| | organizacao      | |                  | |
| +------------------+ +------------------+ |
|                                          |
|        Ja tem conta? Entrar              |
+------------------------------------------+
```

### 9.2 SignupMemberPage - Escola

```
+------------------------------------------+
|    <- Voltar                             |
+------------------------------------------+
|                                          |
|         Cadastro de Aluno                |
|  Entre com o codigo da sua escola        |
|                                          |
| Codigo da Organizacao *                  |
| [ 205                            ] [v]   |
| Escola Municipal ABC                     |
|                                          |
| Nome Completo *                          |
| [ Joao Silva                     ]       |
|                                          |
| Telefone *                               |
| [ (11) 99999-9999                ]       |
|                                          |
| Email *                                  |
| [ joao@email.com                 ]       |
|                                          |
| Serie e Turma *                          |
| [ 9A, Sala 203                   ]       |
|                                          |
| Senha *                                  |
| [ ********                       ]       |
|                                          |
|         [ Criar minha conta ]            |
+------------------------------------------+
```

---

## 10. Ordem de Implementacao

1. Criar `src/hooks/useOrganizationFromCode.ts`
2. Criar `src/pages/auth/SignupMemberPage.tsx` com labels dinamicos
3. Criar `src/pages/auth/SignupManagerPage.tsx` com labels dinamicos
4. Atualizar `src/pages/auth/SignupTypePage.tsx` com cards genericos
5. Atualizar `src/App.tsx` com novas rotas e redirects
6. Testar fluxo completo com diferentes tipos de organizacao
7. (Opcional) Deprecar arquivos antigos com comentarios

---

## 11. Consideracoes de UX

### 11.1 Transicao Suave de Labels

Quando o tipo e detectado, animar a transicao dos labels para indicar que o formulario se adaptou:

```typescript
// Efeito visual sutil ao detectar tipo
className={`transition-all duration-300 ${organization ? 'text-foreground' : 'text-muted-foreground'}`}
```

### 11.2 Icone Dinamico no Header

Mostrar o icone do tipo de organizacao no header do Card apos deteccao:

```typescript
const OrgIcon = organization ? getOrganizationIcon(organization.type) : Bell;
```

### 11.3 Mensagem de Contexto

Adicionar badge visual indicando o tipo detectado:

```typescript
{organization && (
  <div className="inline-flex items-center gap-1 px-2 py-1 bg-accent rounded-full text-xs">
    <OrgIcon className="w-3 h-3" />
    {ORGANIZATION_TYPES[organization.type].label}
  </div>
)}
```

---

## 12. Resultado Esperado

- Usuario de escola ve "Cadastro de Aluno" e campos "Serie/Turma"
- Usuario de empresa ve "Cadastro de Colaborador" e campos "Departamento/Cargo"
- Usuario de academia ve "Cadastro de Aluno" e campos "Turma/Modalidade"
- Sistema extensivel para novos tipos sem alteracoes de codigo
- Experiencia personalizada aumenta confianca e conversao
