

# Criar IA de Atendimento e Vendas

## Resumo

Implementar um chatbot inteligente na landing page que responde duvidas dos visitantes e ajuda a vender o sistema AVISO PRO. O chatbot vai aparecer como um botao flutuante no canto inferior direito da pagina.

## Funcionalidades

O chatbot tera conhecimento sobre:
- Funcionalidades do sistema (timeline, filtros, dashboard, notificacoes)
- Planos e precos (Starter R$29/mes, Pro R$79/mes)
- Como funciona o sistema (4 passos)
- Beneficios para sindicos e moradores
- Perguntas frequentes sobre comunicacao em condominios

O assistente sera treinado para:
- Responder duvidas de forma clara e amigavel
- Destacar beneficios do produto
- Direcionar usuarios para criar conta quando apropriado
- Comparar planos e ajudar na decisao

## Interface do Usuario

```text
+--------------------------------------------------+
|                                                  |
|                  Landing Page                    |
|                                                  |
|                                                  |
|                                                  |
|                                                  |
|                                                  |
|                                          +------+|
|                                          |  AI  ||
+------------------------------------------+------++
                                           |
                                           v
                              +------------------------+
                              |  Ola! Sou o assistente |
                              |  virtual do AVISO PRO  |
                              |                        |
                              |  [Campo de mensagem]   |
                              +------------------------+
```

## Arquitetura Tecnica

### Componentes a Criar

1. **Edge Function `sales-chat`**
   - Recebe mensagens do usuario
   - Usa Lovable AI (gemini-3-flash-preview)
   - System prompt com informacoes do produto
   - Retorna resposta em streaming

2. **Componente `SalesChatbot.tsx`**
   - Botao flutuante para abrir/fechar
   - Interface de chat com historico
   - Streaming de respostas token por token
   - Design responsivo (mobile-friendly)

3. **Hook `useSalesChat.ts`**
   - Gerencia estado das mensagens
   - Lida com streaming SSE
   - Controla loading states

### Fluxo de Dados

```text
Usuario digita pergunta
         |
         v
  SalesChatbot.tsx
         |
         v
  useSalesChat.ts
         |
         v
  Edge Function (sales-chat)
         |
         v
  Lovable AI Gateway
         |
         v
  Resposta em streaming
```

### System Prompt da IA

A IA tera conhecimento de:
- Nome do produto: AVISO PRO
- Proposta de valor: Centralizar comunicacao oficial de condominios
- Planos: Starter (R$29, 50 avisos/mes, email) e Pro (R$79, ilimitado, WhatsApp)
- Funcionalidades: Timeline, Filtros, Dashboard, Notificacoes WhatsApp/Email
- Publico-alvo: Sindicos, administradores, moradores
- Diferenciais: Simplicidade, sem login para moradores, timeline publica

### Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `supabase/functions/sales-chat/index.ts` | Criar |
| `supabase/config.toml` | Adicionar funcao |
| `src/components/landing/SalesChatbot.tsx` | Criar |
| `src/hooks/useSalesChat.ts` | Criar |
| `src/pages/Index.tsx` | Adicionar componente |

### Detalhes de Implementacao

**Edge Function:**
- Model: `google/gemini-3-flash-preview` (rapido e eficiente)
- Streaming: true (resposta em tempo real)
- CORS habilitado para chamadas do frontend

**Frontend:**
- Botao com icone de mensagem (MessageCircle)
- Painel de chat com animacao slide-up
- Campo de input com envio via Enter ou botao
- Mensagens com diferenciacao visual (user vs AI)
- Indicador de "digitando" durante streaming

## Resultado Esperado

Visitantes da landing page poderao tirar duvidas em tempo real sobre o produto, aumentando a taxa de conversao e reduzindo barreiras para a compra.

