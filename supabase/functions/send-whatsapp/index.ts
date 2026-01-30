import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

declare const EdgeRuntime: {
  waitUntil(promise: Promise<unknown>): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface Announcement {
  id: string;
  title: string;
  summary: string | null;
  category: string;
}

interface Condominium {
  id: string;
  name: string;
  slug: string;
}

interface RequestBody {
  announcement: Announcement;
  condominium: Condominium;
  baseUrl: string;
}

interface ContactInfo {
  id: string;
  phone: string | null;
  full_name: string | null;
  email: string | null;
}

interface MemberRow {
  user_id: string | null;
  member_id: string | null;
  profiles: ContactInfo | null;
  condo_members: ContactInfo | null;
}

interface UnifiedMember {
  phone: string;
  full_name: string | null;
}

const WHATSAPP_TEMPLATES: Record<string, string> = {
  informativo: `ℹ️ *AVISO - {nome_condo}*

📋 *{titulo}*

{resumo}

🔗 Acesse o aviso completo:
{link}`,

  financeiro: `💰 *AVISO FINANCEIRO - {nome_condo}*

📋 *{titulo}*

{resumo}

💵 Confira os detalhes:
{link}`,

  manutencao: `🔧 *AVISO DE MANUTENÇÃO - {nome_condo}*

📋 *{titulo}*

{resumo}

📍 Mais informações:
{link}`,

  convivencia: `🤝 *AVISO DE CONVIVÊNCIA - {nome_condo}*

📋 *{titulo}*

{resumo}

🏠 Leia mais:
{link}`,

  seguranca: `🔒 *AVISO DE SEGURANÇA - {nome_condo}*

📋 *{titulo}*

{resumo}

⚡ Veja o comunicado:
{link}`,

  urgente: `⚠️ *AVISO URGENTE - {nome_condo}*

📋 *{titulo}*

{resumo}

🚨 LEIA AGORA:
{link}`,
};

function generateMessage(
  announcement: Announcement,
  condominium: Condominium,
  baseUrl: string
): string {
  const template = WHATSAPP_TEMPLATES[announcement.category] || WHATSAPP_TEMPLATES.informativo;
  const timelineUrl = `${baseUrl}/c/${condominium.slug}`;

  return template
    .replace("{nome_condo}", condominium.name)
    .replace("{titulo}", announcement.title)
    .replace("{resumo}", announcement.summary || "Acesse o link para mais detalhes.")
    .replace("{link}", timelineUrl);
}

// Random delay between min and max seconds
function randomDelay(minSeconds: number, maxSeconds: number): Promise<void> {
  const ms = Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds) * 1000;
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Background task to send messages with delays
async function sendMessagesInBackground(
  members: UnifiedMember[],
  message: string,
  authHeader: string,
  announcement: Announcement,
  condominium: Condominium,
  supabase: SupabaseClient
) {
  console.log(`[Background] Iniciando envio para ${members.length} membros com delays...`);

  for (let i = 0; i < members.length; i++) {
    const member = members[i];

    // Wait before sending (except for first member)
    if (i > 0) {
      const delaySeconds = Math.floor(Math.random() * 16) + 15; // 15-30 seconds
      console.log(`[Background] Aguardando ${delaySeconds}s antes do próximo envio...`);
      await randomDelay(15, 30);
    }

    console.log(`[Background] Enviando para membro ${i + 1} de ${members.length}: ${member.phone} (${member.full_name || 'Unknown'})`);

    try {
      const formData = new FormData();
      formData.append('msg', message);
      formData.append('mobile_phone', member.phone);

      const response = await fetch(
        'https://app.ziontalk.com/api/send_message/',
        {
          method: 'POST',
          headers: { 'Authorization': authHeader },
          body: formData,
        }
      );

      const success = response.status === 201;
      let errorMessage: string | undefined;

      if (!success) {
        errorMessage = await response.text();
        console.error(`[Background] Falha ao enviar para ${member.phone}: ${response.status} - ${errorMessage}`);
      } else {
        console.log(`[Background] ✓ Enviado com sucesso para ${member.phone}`);
      }

      // Log the send attempt
      await supabase.from('whatsapp_logs').insert({
        announcement_id: announcement.id,
        condominium_id: condominium.id,
        recipient_phone: member.phone,
        recipient_name: member.full_name,
        status: success ? 'sent' : 'failed',
        error_message: errorMessage || null,
      });

    } catch (sendError) {
      console.error(`[Background] Exceção ao enviar para ${member.phone}:`, sendError);

      await supabase.from('whatsapp_logs').insert({
        announcement_id: announcement.id,
        condominium_id: condominium.id,
        recipient_phone: member.phone,
        recipient_name: member.full_name,
        status: 'failed',
        error_message: sendError instanceof Error ? sendError.message : 'Unknown error',
      });
    }
  }

  console.log(`[Background] ✓ Processamento concluído para ${members.length} membros`);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ZIONTALK_API_KEY = Deno.env.get('ZIONTALK_API_KEY');
    
    if (!ZIONTALK_API_KEY) {
      console.error("ZIONTALK_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "API key não configurada" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic Auth: API Key as username, empty password
    const authHeader = 'Basic ' + encode(`${ZIONTALK_API_KEY}:`);

    const { announcement, condominium, baseUrl }: RequestBody = await req.json();

    console.log(`Processing WhatsApp send for announcement ${announcement.id} in condominium ${condominium.id}`);

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch members from BOTH sources: profiles (authenticated) and condo_members (manual)
    const { data: rolesData, error: membersError } = await supabase
      .from('user_roles')
      .select(`
        user_id, member_id,
        profiles:user_id (id, phone, full_name, email),
        condo_members:member_id (id, phone, full_name, email)
      `)
      .eq('condominium_id', condominium.id)
      .eq('is_approved', true);

    if (membersError) {
      console.error("Error fetching members:", membersError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar membros", details: membersError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const memberRows = rolesData as unknown as MemberRow[];

    // Unify members from both sources, filtering those with valid phone numbers
    const members: UnifiedMember[] = memberRows
      .map(role => {
        const source = role.profiles || role.condo_members;
        if (!source || !source.phone) return null;
        return {
          phone: source.phone,
          full_name: source.full_name,
        };
      })
      .filter((m): m is UnifiedMember => m !== null);

    if (members.length === 0) {
      console.log("No members with phone numbers found");
      return new Response(
        JSON.stringify({ total: 0, sent: 0, failed: 0, results: [], message: "Nenhum membro com telefone cadastrado" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${members.length} members with phone numbers (from profiles + condo_members)`);

    // Generate message based on template
    const message = generateMessage(announcement, condominium, baseUrl);
    console.log("Generated message:", message.substring(0, 100) + "...");

    // Start background processing with delays
    EdgeRuntime.waitUntil(
      sendMessagesInBackground(members, message, authHeader, announcement, condominium, supabase)
    );

    // Return immediate response
    console.log(`Returning immediate response, ${members.length} messages will be sent in background with 15-30s delays`);

    return new Response(
      JSON.stringify({ 
        total: members.length, 
        status: 'processing',
        message: `Enviando mensagens para ${members.length} moradores em segundo plano. Cada envio terá um intervalo de 15-30 segundos.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erro inesperado", details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
