import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

function generateSMSMessage(
  announcement: Announcement,
  condominium: Condominium,
  baseUrl: string
): string {
  // SMS template: max 160 chars for single SMS
  const timelineUrl = `${baseUrl}/c/${condominium.slug}`;
  const condoShort = condominium.name.length > 20 
    ? condominium.name.substring(0, 17) + "..." 
    : condominium.name;
  const titleShort = announcement.title.length > 50 
    ? announcement.title.substring(0, 47) + "..." 
    : announcement.title;
  
  return `[${condoShort}] ${titleShort} - Veja: ${timelineUrl}`;
}

function formatPhoneForSMSFire(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Ensure it starts with country code (55 for Brazil)
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  
  return cleaned;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SMSFIRE_USERNAME = Deno.env.get('SMSFIRE_USERNAME');
    const SMSFIRE_API_TOKEN = Deno.env.get('SMSFIRE_API_TOKEN');
    
    if (!SMSFIRE_USERNAME || !SMSFIRE_API_TOKEN) {
      console.error("SMSFire credentials not configured");
      return new Response(
        JSON.stringify({ error: "Credenciais SMSFire não configuradas" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { announcement, condominium, baseUrl }: RequestBody = await req.json();

    console.log(`Processing SMS send for announcement ${announcement.id} in condominium ${condominium.id}`);

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

    // Generate SMS message
    const message = generateSMSMessage(announcement, condominium, baseUrl);
    console.log("Generated SMS:", message);

    // Send to each member via SMSFire API v3
    const results: Array<{ phone: string; name: string | null; success: boolean; error?: string }> = [];
    
    for (const member of members) {
      const profile = member.profiles;
      const formattedPhone = formatPhoneForSMSFire(profile.phone);
      
      try {
        // SMSFire API v3 - GET request with query params
        const url = new URL('https://api-v3.smsfire.com.br/sms/send/individual');
        url.searchParams.set('to', formattedPhone);
        url.searchParams.set('text', message);

        console.log(`Sending SMS to ${formattedPhone} (${profile.full_name || 'Unknown'})`);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Username': SMSFIRE_USERNAME,
            'Api_Token': SMSFIRE_API_TOKEN,
          },
        });

        const responseData = await response.json().catch(() => null);
        const success = response.ok;
        let errorMessage: string | undefined;
        
        if (!success) {
          errorMessage = responseData?.message || response.statusText || `Status ${response.status}`;
          console.error(`Failed to send SMS to ${formattedPhone}: ${errorMessage}`);
        } else {
          console.log(`Successfully sent SMS to ${formattedPhone}`, responseData);
        }

        results.push({ 
          phone: profile.phone, 
          name: profile.full_name,
          success,
          error: errorMessage
        });

        // Log the send attempt
        await supabase.from('sms_logs').insert({
          announcement_id: announcement.id,
          condominium_id: condominium.id,
          recipient_phone: profile.phone,
          recipient_name: profile.full_name,
          status: success ? 'sent' : 'failed',
          error_message: errorMessage || null,
        });

      } catch (sendError) {
        console.error(`Exception sending SMS to ${formattedPhone}:`, sendError);
        results.push({ 
          phone: profile.phone, 
          name: profile.full_name,
          success: false,
          error: sendError instanceof Error ? sendError.message : 'Unknown error'
        });

        // Log the failed attempt
        await supabase.from('sms_logs').insert({
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
