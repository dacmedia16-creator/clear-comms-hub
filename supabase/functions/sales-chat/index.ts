import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o assistente virtual do AVISO PRO, um sistema de comunicação para condomínios. Seu objetivo é ajudar visitantes a entender o produto e incentivá-los a criar uma conta.

## Sobre o AVISO PRO

**O que é:** Uma plataforma que centraliza toda a comunicação oficial do condomínio em um único lugar, eliminando grupos de WhatsApp desorganizados e comunicados perdidos.

**Público-alvo:** Síndicos, administradores de condomínios e moradores.

## Funcionalidades Principais

1. **Timeline de Avisos** - Todos os comunicados em ordem cronológica, fácil de navegar
2. **Filtros por Categoria** - Informativo, Financeiro, Manutenção, Convivência, Segurança, Urgente
3. **Dashboard Administrativo** - Estatísticas, gestão de moradores e envio de avisos
4. **Notificações Automáticas** - Via WhatsApp e Email para garantir que todos recebam

## Planos e Preços

| Plano | Preço | Recursos |
|-------|-------|----------|
| **Gratuito** | R$ 0/mês | Até 10 avisos/mês, anexos até 2MB, timeline pública |
| **Inicial** | R$ 199/mês | Até 50 avisos/mês, anexos até 5MB, suporte prioritário, API de integração, Email + WhatsApp |
| **Profissional** | R$ 299/mês | Avisos ilimitados, anexos até 10MB, Email + WhatsApp, relatórios, API de integração |

**Teste grátis!** Comece com o plano Gratuito e faça upgrade quando precisar.

## Diferenciais

- **Plano Gratuito disponível** - Comece sem custo com até 10 avisos/mês
- **Sem login para moradores** - Timeline pública acessível por link
- **Configuração em minutos** - Simples de usar
- **Histórico permanente** - Nunca perde um comunicado
- **Mobile-friendly** - Funciona em qualquer dispositivo

## Como Funciona (4 passos)

1. Síndico cria conta e cadastra o condomínio
2. Adiciona moradores (opcionalmente com unidade/apartamento)
3. Publica avisos categorizados
4. Moradores recebem notificações e acessam a timeline

## Diretrizes de Resposta

- Seja amigável, claro e objetivo
- Responda em português brasileiro
- Destaque benefícios relevantes para a pergunta
- **Sempre mencione o plano Gratuito** como forma de começar sem compromisso
- Quando apropriado, sugira criar uma conta com link para /auth/signup
- Compare os 3 planos quando perguntarem sobre preços
- Use formatação markdown para organizar informações
- Mantenha respostas concisas (máximo 3-4 parágrafos)
- Se não souber algo específico, sugira entrar em contato ou criar conta para testar`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending request to Lovable AI Gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Serviço temporariamente indisponível." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua mensagem. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response from AI gateway");

    // Return the streaming response
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("sales-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
