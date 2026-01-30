
# Atualizar Favicon com Logo

## Objetivo
Substituir o favicon padrão pelo logo do AVISO PRO que já está salvo no projeto.

---

## Passos de Implementação

### 1. Copiar o Logo para a Pasta Public
Copiar o arquivo `src/assets/logo.png` para `public/favicon.png` para que seja acessível como favicon.

### 2. Atualizar index.html
Adicionar a tag `<link>` para referenciar o novo favicon:

```html
<link rel="icon" type="image/png" href="/favicon.png" />
```

---

## Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `public/favicon.png` | Copiar logo para pasta public |
| `index.html` | Adicionar link para favicon |

---

## Código Final (index.html - linha 5)

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  ...
</head>
```
