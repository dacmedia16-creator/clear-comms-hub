
# Remover Referências a "Grátis" do Site

## Resumo

Remover todas as menções sobre começar grátis, plano gratuito e termos relacionados das páginas públicas do site (landing page).

## Arquivos a Modificar

### 1. src/components/landing/Hero.tsx
- **Linha 37**: Alterar botão "Começar gratuitamente" para "Começar agora"
- **Linha 51**: Remover o item "Gratuito para começar" da lista de benefícios
- **Linha 55**: Remover "Sem cartão de crédito" (implica gratuidade)

### 2. src/components/landing/Pricing.tsx
- **Linha 15**: Alterar subtítulo "Comece gratuitamente. Evolua conforme sua necessidade." para algo como "Escolha o plano ideal para seu condomínio."
- **Linhas 20-44**: Remover completamente o card do plano gratuito (Free Plan)
- **Linha 42**: Remover botão "Começar grátis"
- Ajustar o grid de 3 colunas para 2 colunas (somente Starter e Pro)

### 3. src/pages/Index.tsx
- **Linhas 37-38**: Alterar texto "Comece gratuitamente hoje. Sem cartão de crédito, sem compromisso." para algo como "Configure em minutos e transforme a comunicação do seu condomínio."

### 4. src/lib/constants.ts
- **Linhas 51-57**: Remover o plano `free` do objeto `PLANS` (manter apenas `starter` e `pro`)

## Resultado Esperado

- Seção de preços mostrará apenas 2 planos: Inicial (R$ 29) e Profissional (R$ 79)
- Todos os CTAs dirão "Começar agora" ou "Escolher plano"
- Nenhuma menção a gratuidade nas páginas públicas

## Seção Tecnica

### Alteracoes Detalhadas

**Hero.tsx - Botoes e beneficios:**
```tsx
// Antes
<Link to="/auth/signup">
  Começar gratuitamente
  <ArrowRight />
</Link>

// Depois
<Link to="/auth/signup">
  Começar agora
  <ArrowRight />
</Link>
```

**Hero.tsx - Remover itens de beneficios:**
```tsx
// Remover estas linhas (48-56):
<div className="flex items-center gap-2">
  <CheckCircle className="w-4 h-4 text-primary" />
  <span>Gratuito para começar</span>
</div>
<div className="flex items-center gap-2">
  <CheckCircle className="w-4 h-4 text-primary" />
  <span>Sem cartão de crédito</span>
</div>

// Manter apenas:
<div className="flex items-center gap-2">
  <CheckCircle className="w-4 h-4 text-primary" />
  <span>Configuração em 2 minutos</span>
</div>
```

**Pricing.tsx - Grid e planos:**
```tsx
// Antes
<div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
  {/* Free Plan */}
  ...
  {/* Starter Plan */}
  ...
  {/* Pro Plan */}
  ...
</div>

// Depois
<div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
  {/* Starter Plan - Highlighted */}
  ...
  {/* Pro Plan */}
  ...
</div>
```

**constants.ts - Remover plano free:**
```typescript
// Antes
export const PLANS = {
  free: { ... },
  starter: { ... },
  pro: { ... },
}

// Depois
export const PLANS = {
  starter: { ... },
  pro: { ... },
}
```

### Observacao Importante

O plano "free" e usado internamente no sistema (super-admin, banco de dados). Se for necessario manter compatibilidade com dados existentes, podemos manter a constante `free` em `PLANS` mas simplesmente nao exibi-la na UI publica. Isso evita quebrar funcionalidades administrativas.
