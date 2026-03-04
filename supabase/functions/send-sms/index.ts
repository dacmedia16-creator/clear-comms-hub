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
  target_blocks?: string[] | null;
  target_units?: string[] | null;
  target_member_ids?: string[] | null;
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
  block: string | null;
  unit: string | null;
  profiles: ContactInfo | null;
  condo_members: (ContactInfo & { phone_secondary?: string | null }) | null;
}

interface UnifiedMember {
  phone: string;
  full_name: string | null;
  block: string | null;
  unit: string | null;
}

function generateSMSMessage(
  announcement: Announcement,
  condominium: Condominium,
  baseUrl: string
): string {
  // SMS template: max 160 chars for single SMS
  // Remove special characters that SMSFire may not support
  const timelineUrl = `${baseUrl}/c/${condominium.slug}`;
  const condoShort = condominium.name.length > 20 
    ? condominium.name.substring(0, 17) + "..." 
    : condominium.name;
  const titleShort = announcement.title.length > 50 
    ? announcement.title.substring(0, 47) + "..." 
    : announcement.title;
  
  // Use simple characters - avoid brackets and special chars
  return `${condoShort}: ${titleShort} Veja em ${timelineUrl}`;
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

    // Fetch members from BOTH sources: profiles (authenticated) and condo_members (manual)
    const { data: rolesData, error: membersError } = await supabase
      .from('user_roles')
      .select(`
        user_id, member_id, block, unit,
        profiles:user_id (id, phone, full_name, email),
        condo_members:member_id (id, phone, phone_secondary, full_name, email)
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

    let filteredRows = (rolesData || []) as unknown as MemberRow[];

    // Apply target_member_ids filter at row level
    const hasTargetMemberIds = announcement.target_member_ids && announcement.target_member_ids.length > 0;
    if (hasTargetMemberIds) {
      console.log(`Filtering by target_member_ids: ${announcement.target_member_ids!.length} IDs`);
      const targetIds = new Set(announcement.target_member_ids!);
      filteredRows = filteredRows.filter(role => 
        targetIds.has(role.user_id || '') || targetIds.has(role.member_id || '')
      );
    }

    // Unify members from both sources, filtering those with valid phone numbers
    let members: UnifiedMember[] = filteredRows
      .map(role => {
        const source = role.profiles || role.condo_members;
        if (!source || !source.phone) return null;
        return {
          phone: source.phone,
          full_name: source.full_name,
          block: role.block,
          unit: role.unit,
        };
      })
      .filter((m): m is UnifiedMember => m !== null);

    // Apply targeting filters
    const hasBlockFilter = announcement.target_blocks && announcement.target_blocks.length > 0;
    const hasUnitFilter = announcement.target_units && announcement.target_units.length > 0;

    if (hasBlockFilter) {
      console.log(`Filtering by blocks: ${announcement.target_blocks!.join(', ')}`);
      members = members.filter(m => m.block && announcement.target_blocks!.includes(m.block));
    }

    if (hasUnitFilter) {
      console.log(`Filtering by units: ${announcement.target_units!.join(', ')}`);
      members = members.filter(m => m.unit && announcement.target_units!.includes(m.unit));
    }

    if (members.length === 0) {
      console.log("No members with phone numbers found after filtering");
      return new Response(
        JSON.stringify({ total: 0, sent: 0, failed: 0, results: [], message: "Nenhum membro encontrado com os critérios selecionados" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${members.length} members with phone numbers after filtering`);

    // Generate SMS message
    const message = generateSMSMessage(announcement, condominium, baseUrl);
    console.log("Generated SMS:", message);

    // Send to each member via SMSFire API v3
    const results: Array<{ phone: string; name: string | null; success: boolean; error?: string }> = [];
    
    for (const member of members) {
      const formattedPhone = formatPhoneForSMSFire(member.phone);
      
      try {
        // SMSFire API v3 - GET request with query params and separate headers
        const baseUrl_api = 'https://api-v3.smsfire.com.br/sms/send/individual';
        const encodedText = encodeURIComponent(message);
        const apiUrl = `${baseUrl_api}?to=${formattedPhone}&text=${encodedText}`;

        console.log(`Sending SMS to ${formattedPhone} (${member.full_name || 'Unknown'})`);

        const response = await fetch(apiUrl, {
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
          phone: member.phone, 
          name: member.full_name,
          success,
          error: errorMessage
        });

        // Log the send attempt
        await supabase.from('sms_logs').insert({
          announcement_id: announcement.id,
          condominium_id: condominium.id,
          recipient_phone: member.phone,
          recipient_name: member.full_name,
          status: success ? 'sent' : 'failed',
          error_message: errorMessage || null,
        });

      } catch (sendError) {
        console.error(`Exception sending SMS to ${formattedPhone}:`, sendError);
        results.push({ 
          phone: member.phone, 
          name: member.full_name,
          success: false,
          error: sendError instanceof Error ? sendError.message : 'Unknown error'
        });

        // Log the failed attempt
        await supabase.from('sms_logs').insert({
          announcement_id: announcement.id,
          condominium_id: condominium.id,
          recipient_phone: member.phone,
          recipient_name: member.full_name,
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
