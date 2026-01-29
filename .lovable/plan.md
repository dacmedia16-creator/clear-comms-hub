

# Plano: Renomear Sistema para AVISO PRO

## Resumo

Alterar o nome do sistema de **"AVISO CD"** para **"AVISO PRO"** em todos os arquivos do projeto.

---

## Arquivos a Modificar

| Arquivo | Linha | Alteracao |
|---------|-------|-----------|
| `index.html` | 7, 12 | Alterar titulo e og:title para "AVISO PRO" |
| `index.html` | 8, 13 | Atualizar descricoes meta tags |
| `src/index.css` | 5 | Comentario: "AVISO PRO Design System" |
| `src/components/landing/Header.tsx` | 18 | Logo texto: "AVISO PRO" |
| `src/components/landing/Footer.tsx` | 15, 64 | Logo e copyright: "AVISO PRO" |
| `src/pages/DashboardPage.tsx` | 113 | Logo no dashboard: "AVISO PRO" |
| `src/pages/TimelinePage.tsx` | 344 | "Powered by AVISO PRO" |
| `src/pages/AuthPage.tsx` | 84, 152 | Mensagens de boas-vindas e titulo do card |

---

## Detalhes das Alteracoes

### 1. index.html
- `<title>AVISO PRO</title>`
- `<meta name="description" content="AVISO PRO - Comunicacao oficial para condominios" />`
- `<meta property="og:title" content="AVISO PRO" />`
- `<meta property="og:description" content="AVISO PRO - Comunicacao oficial para condominios" />`

### 2. src/index.css
```css
/* AVISO PRO Design System - Warm & Accessible */
```

### 3. src/components/landing/Header.tsx
```jsx
<span className="font-display text-xl font-bold text-foreground">AVISO PRO</span>
```

### 4. src/components/landing/Footer.tsx
```jsx
<span className="font-display text-xl font-bold">AVISO PRO</span>
...
<p>© {new Date().getFullYear()} AVISO PRO. Todos os direitos reservados.</p>
```

### 5. src/pages/DashboardPage.tsx
```jsx
<span className="font-display text-xl font-bold text-foreground">AVISO PRO</span>
```

### 6. src/pages/TimelinePage.tsx
```jsx
Powered by AVISO PRO
```

### 7. src/pages/AuthPage.tsx
```jsx
description: "Bem-vindo ao AVISO PRO.",
...
{mode === "signin" ? "Entrar no AVISO PRO" : "Criar sua conta"}
```

---

## Total de Alteracoes

- **6 arquivos** serao modificados
- **10 ocorrencias** de "AVISO CD" serao substituidas por "AVISO PRO"
- Meta tags do `index.html` serao atualizadas com nome e descricao corretos

---

## Resultado Final

Apos a implementacao, o nome "AVISO PRO" aparecera em:
- Titulo da aba do navegador
- Header da landing page
- Footer da landing page
- Dashboard logado
- Pagina de autenticacao
- Timeline publica
- Meta tags para compartilhamento social

