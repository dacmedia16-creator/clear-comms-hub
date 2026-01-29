
# Criar Página de Configurações do Condomínio

## Problema Identificado

O botão "Config" no dashboard aponta para `/admin/:condoId/settings`, mas essa rota **não existe** no aplicativo. Ao clicar, o usuário é redirecionado para a página 404 (NotFound).

---

## Solução

Criar uma nova página de configurações do condomínio que permita ao usuário editar:

### Informações Básicas
- Nome do condomínio
- Descrição
- Endereço
- Cidade e Estado

### Configurações de Notificação
- Habilitar/desabilitar notificação por email
- Habilitar/desabilitar notificação por WhatsApp

### Informações Adicionais (somente visualização)
- Slug (link da timeline)
- Plano atual

---

## Arquivos a Criar

### `src/pages/CondominiumSettingsPage.tsx`
Nova página com formulário para editar as configurações do condomínio contendo:
- Header com botão de voltar
- Formulário com os campos editáveis
- Botão de salvar alterações
- Seção de informações somente leitura (slug, plano)

---

## Arquivos a Modificar

### `src/App.tsx`
Adicionar nova rota:
```tsx
<Route path="/admin/:condoId/settings" element={<CondominiumSettingsPage />} />
```

---

## Interface Visual

```
┌───────────────────────────────────────────────────────────┐
│ ← Vitrine Esplanada                                       │
│   Configurações                                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Informações Básicas                                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Nome do condomínio                                  │  │
│  │ [Vitrine Esplanada                            ]     │  │
│  │                                                     │  │
│  │ Descrição                                           │  │
│  │ [Descrição opcional do condomínio...          ]     │  │
│  │                                                     │  │
│  │ Endereço                                            │  │
│  │ [Rua das Flores, 123                          ]     │  │
│  │                                                     │  │
│  │ Cidade             Estado                           │  │
│  │ [São Paulo   ]     [SP    ]                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  Notificações                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ [✓] Notificação por Email                           │  │
│  │ [✓] Notificação por WhatsApp                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  Informações do Sistema                                   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Link da timeline: /c/vitrine-esplanada-a05f26       │  │
│  │ Plano atual: Free                                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│                             [Cancelar]  [Salvar]          │
└───────────────────────────────────────────────────────────┘
```

---

## Fluxo de Funcionamento

1. Usuário clica em "Config" no card do condomínio no dashboard
2. É redirecionado para `/admin/:condoId/settings`
3. Página carrega dados do condomínio do banco
4. Usuário edita os campos desejados
5. Clica em "Salvar"
6. Sistema atualiza os dados no Supabase
7. Exibe toast de sucesso
8. Usuário pode voltar ao dashboard ou à página de avisos

---

## Detalhes Técnicos

### Novo Arquivo: `src/pages/CondominiumSettingsPage.tsx`

- Usar `useParams` para pegar o `condoId`
- Carregar dados do condomínio via Supabase
- Formulário controlado com estados para cada campo
- Função `handleSave` que faz UPDATE na tabela `condominiums`
- Validação: nome é obrigatório

### Modificação: `src/App.tsx`

Adicionar import e rota:
```tsx
import CondominiumSettingsPage from "./pages/CondominiumSettingsPage";
// ...
<Route path="/admin/:condoId/settings" element={<CondominiumSettingsPage />} />
```

### Segurança

As políticas RLS existentes já devem permitir que o owner atualize o condomínio. Caso contrário, será necessário adicionar uma política.
