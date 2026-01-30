
# Adicionar Logo na Barra de Navegacao

## Objetivo
Substituir o icone atual (Bell/sino) pelo logo personalizado enviado na barra de navegacao do site.

---

## Passos de Implementacao

### 1. Copiar a Imagem para o Projeto
Copiar o arquivo `user-uploads://image-25.png` para `src/assets/logo.png`

### 2. Atualizar o Header.tsx

**Alteracoes:**
- Importar a imagem do logo como modulo ES6
- Substituir a `<div>` com o icone Bell por uma tag `<img>` com o logo

**Codigo atual (linhas 14-18):**
```jsx
<Link to="/" className="flex items-center gap-2">
  <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
    <Bell className="w-5 h-5 text-primary-foreground" />
  </div>
  <span className="font-display text-xl font-bold text-foreground">AVISO PRO</span>
</Link>
```

**Codigo atualizado:**
```jsx
import logo from "@/assets/logo.png";

<Link to="/" className="flex items-center gap-2">
  <img src={logo} alt="AVISO PRO" className="w-9 h-9 rounded-lg" />
  <span className="font-display text-xl font-bold text-foreground">AVISO PRO</span>
</Link>
```

---

## Resumo

| Tarefa | Arquivo |
|--------|---------|
| Copiar logo | `src/assets/logo.png` |
| Importar e usar logo | `src/components/landing/Header.tsx` |
