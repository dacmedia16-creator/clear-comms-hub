

# Destaque Visual no Link de Indicação

## Objetivo

Transformar o link simples "Indique para seu síndico" em um elemento visualmente mais chamativo, seguindo a estética do badge "3 meses grátis" já existente no Hero.

---

## Referência de Estilo

O badge atual de "3 meses grátis" (linha 18) usa:
- Fundo colorido (`bg-emerald-100`)
- Texto colorido (`text-emerald-700`)
- Borda sutil (`border border-emerald-200`)
- Cantos arredondados (`rounded-full`)
- Ícone à esquerda (`Gift`)

---

## Proposta de Design

Aplicar um estilo similar ao link de indicação, mas com cores diferentes para diferenciar:

**Antes (atual):**
```
Indique para seu síndico (texto simples com ícone)
```

**Depois (com destaque):**
```
+------------------------------------------+
|  [UserPlus]  Indique para seu síndico →  |
+------------------------------------------+
   (badge com fundo azul claro e borda)
```

---

## Estilos Propostos

O link será transformado em um badge/pill com:

| Propriedade | Valor |
|-------------|-------|
| Fundo | `bg-blue-50` |
| Texto | `text-blue-700` |
| Borda | `border border-blue-200` |
| Padding | `px-4 py-2` |
| Cantos | `rounded-full` |
| Hover | `hover:bg-blue-100` com transição suave |
| Ícone direita | Seta (`ArrowRight` ou `→`) indicando ação |

---

## Arquivo a Modificar

### `src/components/landing/Hero.tsx`

Modificar o bloco do link de indicação (linhas 48-57):

**De:**
```tsx
<div className="text-center lg:text-left mb-6">
  <Link 
    to="/indicar-sindico" 
    className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium transition-colors"
  >
    <UserPlus className="w-4 h-4" />
    Indique para seu síndico
  </Link>
</div>
```

**Para:**
```tsx
<div className="text-center lg:text-left mb-6">
  <Link 
    to="/indicar-sindico" 
    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-200 hover:bg-blue-100 transition-colors"
  >
    <UserPlus className="w-4 h-4" />
    Indique para seu síndico
    <ArrowRight className="w-4 h-4" />
  </Link>
</div>
```

---

## Layout Visual Atualizado

```text
[Gift] 3 meses grátis para testar      (badge verde - topo)

Quando é importante,
vira AVISO.

Descrição...

[Começar agora →]  [Ver demonstração]

[UserPlus] Indique para seu síndico →  (badge azul - DESTAQUE)
   ↑ Novo visual com fundo, borda e seta

✓ Configuração em 2 minutos
✓ 3 meses grátis  
✓ Sem cartão de crédito
```

---

## Resultado Esperado

- Link mais visível e clicável
- Estilo consistente com a linguagem visual do Hero (badges arredondados)
- Diferenciação de cor (azul vs verde) mantém hierarquia visual
- Seta indicando que é uma ação/navegação
- Hover com feedback visual

