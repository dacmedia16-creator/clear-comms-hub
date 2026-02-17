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

const TEMPLATE_IDENTIFIER = 'aviso_pro_confirma_3';
const TEMPLATE_LANGUAGE = 'pt_BR';

interface Announcement {
  id: string;
  title: string;
  summary: string | null;
  category: string;
  target_blocks?: string[] | null;
  target_units?: string[] | null;
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
  condo_members: ContactInfo | null;
}

interface UnifiedMember {
  phone: string;
  full_name: string | null;
  block: string | null;
  unit: string | null;
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const withPrefix = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
  return `+${withPrefix}`;
}

function generateShortToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function randomDelay(minSeconds: number, maxSeconds: number): Promise<void> {
  const ms = Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds) * 1000;
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendMessagesInBackground(
  members: UnifiedMember[],
  authHeader: string,
  announcement: Announcement,
  condominium: Condominium,
  supabase: SupabaseClient
) {
  console.log(`[Background] Iniciando envio para ${members.length} membros com delays...`);

  const lembrete = announcement.summary || "Acesse o link para mais detalhes.";

  for (let i = 0; i < members.length; i++) {
    const member = members[i];

    if (i > 0) {
      const delaySeconds = Math.floor(Math.random() * 16) + 15;
      console.log(`[Background] Aguardando ${delaySeconds}s antes do próximo envio...`);
      await randomDelay(15, 30);
    }

    console.log(`[Background] Enviando para membro ${i + 1} de ${members.length}: ${member.phone} (${member.full_name || 'Unknown'})`);

    try {
      // Generate opt-out token and save to DB
      const optoutToken = generateShortToken();
      await supabase.from('whatsapp_optouts').insert({
        phone: member.phone,
        token: optoutToken,
        condominium_id: condominium.id,
        member_name: member.full_name,
        opted_out_at: null,
      });

      const formData = new FormData();
      formData.append('mobile_phone', member.phone);
      formData.append('template_identifier', TEMPLATE_IDENTIFIER);
      formData.append('language', TEMPLATE_LANGUAGE);
      formData.append('bodyParams[nome]', member.full_name || 'morador(a)');
      formData.append('bodyParams[aviso]', announcement.title);
      formData.append('bodyParams[lembrete]', lembrete);
      formData.append('buttonUrlDynamicParams[0]', `c/${condominium.slug}`);
      formData.append('buttonUrlDynamicParams[1]', `${optoutToken}`);

      const response = await fetch(
        'https://app.ziontalk.com/api/send_template_message/',
        {
          method: 'POST',
          headers: { 'Authorization': authHeader },
          body: formData,
        }
      );

      const responseBody = await response.text();
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => { responseHeaders[key] = value; });
      console.log(`[Background] Zion Talk response for ${member.phone}: status=${response.status} headers=${JSON.stringify(responseHeaders)} body=${responseBody}`);

      const success = response.status === 201;
      let errorMessage: string | undefined;

      if (!success) {
        errorMessage = responseBody;
        console.error(`[Background] Falha ao enviar para ${member.phone}: ${response.status} - ${responseBody}`);
      } else {
        console.log(`[Background] ✓ Enviado com sucesso para ${member.phone}`);
      }

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { announcement, condominium }: RequestBody = await req.json();

    console.log(`Processing WhatsApp send for announcement ${announcement.id} in condominium ${condominium.id}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch sender (DB first, ENV fallback)
    let apiKey = Deno.env.get('ZIONTALK_API_KEY');
    let senderPhone = 'ENV_DEFAULT';

    const { data: senders, error: sendersError } = await supabase
      .from('whatsapp_senders')
      .select('*')
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .limit(1);

    if (sendersError) {
      console.error("Error fetching whatsapp_senders:", sendersError);
    } else if (senders && senders.length > 0) {
      const sender = senders[0];
      apiKey = sender.api_key;
      senderPhone = sender.phone;
      console.log(`Using sender: ${sender.name} (${senderPhone})`);
    } else {
      console.log("No active senders found, using ENV fallback");
    }

    if (!apiKey) {
      console.error("No API key available (no senders and ZIONTALK_API_KEY not configured)");
      return new Response(
        JSON.stringify({ error: "API key não configurada. Cadastre um número de WhatsApp na Central de Notificações." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = 'Basic ' + encode(`${apiKey}:`);

    // Fetch members from BOTH sources
    const { data: rolesData, error: membersError } = await supabase
      .from('user_roles')
      .select(`
        user_id, member_id, block, unit,
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

    let members: UnifiedMember[] = memberRows
      .map(role => {
        const source = role.profiles || role.condo_members;
        if (!source || !source.phone) return null;
        return {
          phone: normalizePhone(source.phone),
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

    // Filter out opted-out phones
    const { data: optouts } = await supabase
      .from('whatsapp_optouts')
      .select('phone')
      .not('opted_out_at', 'is', null);

    if (optouts && optouts.length > 0) {
      const optedOutPhones = new Set(optouts.map(o => o.phone));
      const beforeCount = members.length;
      members = members.filter(m => !optedOutPhones.has(m.phone));
      const filtered = beforeCount - members.length;
      if (filtered > 0) {
        console.log(`Filtered out ${filtered} opted-out phone(s)`);
      }
    }

    if (members.length === 0) {
      console.log("No members with phone numbers found after filtering");
      return new Response(
        JSON.stringify({ total: 0, sent: 0, failed: 0, results: [], message: "Nenhum membro encontrado com os critérios selecionados" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${members.length} members with phone numbers after filtering`);

    // Start background processing
    EdgeRuntime.waitUntil(
      sendMessagesInBackground(members, authHeader, announcement, condominium, supabase)
    );

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
