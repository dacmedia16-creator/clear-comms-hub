import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

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

interface MemberProfile {
  id: string;
  phone: string;
  full_name: string | null;
}

interface MemberRow {
  user_id: string;
  profiles: MemberProfile;
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

    // Fetch members with registered phone numbers (only approved members)
    const { data: membersData, error: membersError } = await supabase
      .from('user_roles')
      .select('user_id, profiles!inner(id, phone, full_name)')
      .eq('condominium_id', condominium.id)
      .eq('is_approved', true)
      .not('profiles.phone', 'is', null);

    if (membersError) {
      console.error("Error fetching members:", membersError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar membros", details: membersError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const members = membersData as unknown as MemberRow[];

    if (!members || members.length === 0) {
      console.log("No members with phone numbers found");
      return new Response(
        JSON.stringify({ total: 0, sent: 0, failed: 0, results: [], message: "Nenhum membro com telefone cadastrado" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${members.length} members with phone numbers`);

    // Generate message based on template
    const message = generateMessage(announcement, condominium, baseUrl);
    console.log("Generated message:", message.substring(0, 100) + "...");

    // Send to each member via ZionTalk
    const results: Array<{ phone: string; name: string | null; success: boolean; error?: string }> = [];
    
    for (const member of members) {
      const profile = member.profiles;
      
      try {
        // Create form data for ZionTalk API
        const formData = new FormData();
        formData.append('msg', message);
        formData.append('mobile_phone', profile.phone);

        console.log(`Sending to ${profile.phone} (${profile.full_name || 'Unknown'})`);

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
          console.error(`Failed to send to ${profile.phone}: ${response.status} - ${errorMessage}`);
        } else {
          console.log(`Successfully sent to ${profile.phone}`);
        }

        results.push({ 
          phone: profile.phone, 
          name: profile.full_name,
          success,
          error: errorMessage
        });

        // Log the send attempt
        await supabase.from('whatsapp_logs').insert({
          announcement_id: announcement.id,
          condominium_id: condominium.id,
          recipient_phone: profile.phone,
          recipient_name: profile.full_name,
          status: success ? 'sent' : 'failed',
          error_message: errorMessage || null,
        });

      } catch (sendError) {
        console.error(`Exception sending to ${profile.phone}:`, sendError);
        results.push({ 
          phone: profile.phone, 
          name: profile.full_name,
          success: false,
          error: sendError instanceof Error ? sendError.message : 'Unknown error'
        });

        // Log the failed attempt
        await supabase.from('whatsapp_logs').insert({
          announcement_id: announcement.id,
          condominium_id: condominium.id,
          recipient_phone: profile.phone,
          recipient_name: profile.full_name,
          status: 'failed',
          error_message: sendError instanceof Error ? sendError.message : 'Unknown error',
        });
      }
    }

    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Completed: ${sent} sent, ${failed} failed out of ${results.length} total`);

    return new Response(
      JSON.stringify({ total: results.length, sent, failed, results }),
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
