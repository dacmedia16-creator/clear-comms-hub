
# Adicionar Animacao de Entrada Suave no Chat

## Resumo

Melhorar a animacao de abertura do chatbot para uma experiencia mais fluida e profissional. Atualmente o chat usa apenas opacity e translate-y basicos. Vamos adicionar animacoes escalonadas (staggered) e efeitos de spring para um visual mais moderno.

## Melhorias Planejadas

### 1. Animacao do Painel Principal
- Combinacao de scale + opacity + translate para efeito "pop-in"
- Timing com cubic-bezier para sensacao de spring
- Duracao aumentada para 400ms

### 2. Animacoes Escalonadas (Staggered)
- Header aparece primeiro
- Area de mensagens aparece com delay
- Formulario de input aparece por ultimo
- Cria sensacao de "construcao" do painel

### 3. Animacao do Botao Flutuante
- Efeito pulse sutil quando fechado (chamar atencao)
- Transicao suave do icone (MessageCircle -> X)

## Implementacao Tecnica

### Arquivo a Modificar

| Arquivo | Acao |
|---------|------|
| `src/components/landing/SalesChatbot.tsx` | Atualizar animacoes |

### Detalhes das Animacoes

**Painel Principal:**
```text
Fechado -> Aberto
- scale: 0.95 -> 1
- opacity: 0 -> 1
- translateY: 20px -> 0
- Timing: cubic-bezier(0.34, 1.56, 0.64, 1) (efeito spring)
```

**Elementos Internos (staggered):**
```text
Header:    delay 0ms
Messages:  delay 100ms  
Input:     delay 200ms
```

**Botao Flutuante:**
```text
- Pulse animation quando fechado
- Scale transition no hover
- Rotacao suave do icone
```

### Codigo das Animacoes

Adicionar classes CSS customizadas com keyframes:

```text
@keyframes chat-panel-enter
  0%:   opacity: 0, scale: 0.95, translateY: 20px
  100%: opacity: 1, scale: 1, translateY: 0

@keyframes chat-content-enter
  0%:   opacity: 0, translateY: 10px
  100%: opacity: 1, translateY: 0
```

Usar Tailwind arbitrary values para aplicar:
- `animate-[chat-panel-enter_0.4s_cubic-bezier(0.34,1.56,0.64,1)]`
- Delays via `[animation-delay:100ms]`

## Resultado Esperado

O chatbot tera uma animacao de abertura mais elegante e profissional, com elementos aparecendo de forma escalonada e um efeito de "spring" que da sensacao de responsividade e qualidade ao produto.
