
# Remover Valores/Preços do Site

## Objetivo
Remover toda exibição de preços e valores monetários das páginas públicas do site.

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Index.tsx` | Remover a seção de Pricing |
| `src/components/landing/Header.tsx` | Remover link "Planos" do menu |
| `src/components/landing/Footer.tsx` | Remover link "Planos e Preços" |

---

## Detalhes das Alterações

### 1. Index.tsx
Remover a seção de pricing:
```jsx
// REMOVER:
<section id="pricing">
  <Pricing />
</section>
```

### 2. Header.tsx
Remover os links para "#pricing" no menu desktop e mobile.

### 3. Footer.tsx
Remover o link "Planos e Preços" da lista de links do Produto.

---

## Nota
O arquivo `src/lib/constants.ts` e `src/components/landing/Pricing.tsx` serão mantidos no código para uso interno/administrativo, apenas não serão exibidos publicamente.
