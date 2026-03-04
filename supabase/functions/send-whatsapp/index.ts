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
const BATCH_SIZE = 10;

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

interface UnifiedMember {
  phone: string;
  full_name: string | null;
  block: string | null;
  unit: string | null;
}

interface RequestBody {
  announcement: Announcement;
  condominium: Condominium;
  baseUrl?: string;
  // Batch params (used in self-invocation)
  batchOffset?: number;
  membersPayload?: UnifiedMember[];
  authHeader?: string;
  templateIdentifier?: string;
  broadcastId?: string;
  existingBroadcastId?: string;
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

async function resolveAuthHeader(supabase: SupabaseClient): Promise<{ authHeader: string; senderPhone: string; senderName: string; templateIdentifier: string | null } | null> {
  let apiKey = Deno.env.get('ZIONTALK_API_KEY');
  let senderPhone = 'ENV_DEFAULT';
  let senderName = 'ENV_DEFAULT';
  let templateIdentifier: string | null = null;

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
    senderName = sender.name;
    templateIdentifier = sender.template_identifier ?? null;
    console.log(`Using sender: ${sender.name} (${senderPhone}), template_identifier: ${templateIdentifier ?? 'default'}`);
  } else {
    console.log("No active senders found, using ENV fallback");
  }

  if (!apiKey) return null;
  return { authHeader: 'Basic ' + encode(`${apiKey}:`), senderPhone, senderName, templateIdentifier };
}

async function fetchAndFilterMembers(
  supabase: SupabaseClient,
  announcement: Announcement,
  condominium: Condominium
): Promise<UnifiedMember[]> {
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
    throw new Error(`Erro ao buscar membros: ${membersError.message}`);
  }

  let filteredRows = (rolesData || []) as unknown as MemberRow[];

  const hasTargetMemberIds = announcement.target_member_ids && announcement.target_member_ids.length > 0;
  if (hasTargetMemberIds) {
    console.log(`Filtering by target_member_ids: ${announcement.target_member_ids!.length} IDs`);
    const targetIds = new Set(announcement.target_member_ids!);
    filteredRows = filteredRows.filter(role =>
      targetIds.has(role.user_id || '') || targetIds.has(role.member_id || '')
    );
  }

  let members: UnifiedMember[] = filteredRows
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

  const hasBlockFilter = announcement.target_blocks && announcement.target_blocks.length > 0;
  const hasUnitFilter = announcement.target_units && announcement.target_units.length > 0;

  if (hasBlockFilter) {
    members = members.filter(m => m.block && announcement.target_blocks!.includes(m.block));
  }
  if (hasUnitFilter) {
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
    if (filtered > 0) console.log(`Filtered out ${filtered} opted-out phone(s)`);
  }

  // Deduplicate: skip phones that already received this announcement successfully
  const { data: sentLogs } = await supabase
    .from('whatsapp_logs')
    .select('recipient_phone')
    .eq('announcement_id', announcement.id)
    .eq('status', 'sent');

  if (sentLogs && sentLogs.length > 0) {
    const alreadySent = new Set(sentLogs.map(l => l.recipient_phone));
    const beforeDedup = members.length;
    members = members.filter(m => !alreadySent.has(m.phone));
    const skipped = beforeDedup - members.length;
    if (skipped > 0) console.log(`Skipped ${skipped} already-sent phone(s) for announcement ${announcement.id}`);
  }

  return members;
}

async function checkBroadcastPaused(supabase: SupabaseClient, broadcastId: string): Promise<boolean> {
  const { data } = await supabase
    .from('whatsapp_broadcasts')
    .select('status')
    .eq('id', broadcastId)
    .single();
  
  return data?.status === 'paused';
}

async function processBatch(
  members: UnifiedMember[],
  offset: number,
  authHeader: string,
  announcement: Announcement,
  condominium: Condominium,
  supabase: SupabaseClient,
  templateIdentifier: string,
  broadcastId?: string
) {
  // Check if broadcast is paused before processing
  if (broadcastId) {
    const isPaused = await checkBroadcastPaused(supabase, broadcastId);
    if (isPaused) {
      console.log(`[Batch] Broadcast ${broadcastId} is paused. Stopping at offset=${offset}`);
      return;
    }
  }

  const batch = members.slice(offset, offset + BATCH_SIZE);
  const lembrete = announcement.summary || "Acesse o link para mais detalhes.";

  console.log(`[Batch] Processing offset=${offset}, batch size=${batch.length}, total=${members.length}, template=${templateIdentifier}`);

  for (let i = 0; i < batch.length; i++) {
    const member = batch[i];

    if (i > 0) {
      const delaySeconds = Math.floor(Math.random() * 16) + 15;
      console.log(`[Batch] Waiting ${delaySeconds}s before next send...`);
      await randomDelay(15, 30);
    }

    // Check pause status between each message
    if (broadcastId && i > 0) {
      const isPaused = await checkBroadcastPaused(supabase, broadcastId);
      if (isPaused) {
        console.log(`[Batch] Broadcast ${broadcastId} paused mid-batch at message ${offset + i}/${members.length}`);
        return;
      }
    }

    const globalIndex = offset + i + 1;
    console.log(`[Batch] Sending ${globalIndex}/${members.length}: ${member.phone} (${member.full_name || 'Unknown'})`);

    try {
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
      formData.append('template_identifier', templateIdentifier);
      formData.append('language', TEMPLATE_LANGUAGE);
      const noNomeTemplates = ['vip7_captacao2', 'vip7_captacao3'];
      if (!noNomeTemplates.includes(templateIdentifier)) {
        formData.append('bodyParams[nome]', member.full_name || 'morador(a)');
      }
      formData.append('bodyParams[aviso]', announcement.title);
      formData.append('bodyParams[lembrete]', lembrete);
      const singleButtonIdx0Templates = ['vip7_captacao2', 'vip7_captacao3'];
      const singleButtonIdx1Templates = ['visita_prova_envio', 'visita_prova_envio4', 'vip7_captacao'];
      if (singleButtonIdx0Templates.includes(templateIdentifier)) {
        formData.append('buttonUrlDynamicParams[0]', `${optoutToken}`);
      } else if (singleButtonIdx1Templates.includes(templateIdentifier)) {
        formData.append('buttonUrlDynamicParams[1]', `${optoutToken}`);
      } else {
        formData.append('buttonUrlDynamicParams[0]', `c/${condominium.slug}`);
        formData.append('buttonUrlDynamicParams[1]', `${optoutToken}`);
      }

      const response = await fetch(
        'https://app.ziontalk.com/api/send_template_message/',
        { method: 'POST', headers: { 'Authorization': authHeader }, body: formData }
      );

      const responseBody = await response.text();
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => { responseHeaders[key] = value; });
      console.log(`[Batch] Zion Talk response for ${member.phone}: status=${response.status} body=${responseBody}`);

      const success = response.status === 201;

      await supabase.from('whatsapp_logs').insert({
        announcement_id: announcement.id,
        condominium_id: condominium.id,
        recipient_phone: member.phone,
        recipient_name: member.full_name,
        status: success ? 'sent' : 'failed',
        error_message: success ? null : responseBody,
      });

      if (success) {
        console.log(`[Batch] ✓ Sent to ${member.phone}`);
      } else {
        console.error(`[Batch] ✗ Failed ${member.phone}: ${response.status}`);
      }
    } catch (sendError) {
      console.error(`[Batch] Exception for ${member.phone}:`, sendError);
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

  // Self-invoke for next batch if there are more members
  const nextOffset = offset + BATCH_SIZE;
  if (nextOffset < members.length) {
    // Check pause before self-invoking
    if (broadcastId) {
      const isPaused = await checkBroadcastPaused(supabase, broadcastId);
      if (isPaused) {
        console.log(`[Batch] Broadcast ${broadcastId} paused before next batch. Stopping.`);
        return;
      }
    }

    console.log(`[Batch] Invoking next batch: offset=${nextOffset}, remaining=${members.length - nextOffset}`);
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          announcement,
          condominium,
          batchOffset: nextOffset,
          membersPayload: members,
          authHeader,
          templateIdentifier,
          broadcastId,
        }),
      });
      const resText = await res.text();
      console.log(`[Batch] Self-invoke response: status=${res.status} body=${resText}`);
    } catch (err) {
      console.error(`[Batch] Self-invoke failed:`, err);
    }
  } else {
    console.log(`[Batch] ✓ All ${members.length} members processed!`);
    // Mark broadcast as completed
    if (broadcastId) {
      await supabase
        .from('whatsapp_broadcasts')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', broadcastId);
      console.log(`[Batch] Broadcast ${broadcastId} marked as completed`);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { announcement, condominium, batchOffset = 0, membersPayload, authHeader: passedAuthHeader, templateIdentifier: passedTemplateIdentifier, broadcastId: passedBroadcastId, existingBroadcastId } = body;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Continuation batch (self-invoked)
    if (membersPayload && passedAuthHeader && batchOffset > 0) {
      console.log(`[Continuation] Batch offset=${batchOffset}, members=${membersPayload.length}`);

      EdgeRuntime.waitUntil(
        processBatch(membersPayload, batchOffset, passedAuthHeader, announcement, condominium, supabase, passedTemplateIdentifier ?? TEMPLATE_IDENTIFIER, passedBroadcastId)
      );

      return new Response(
        JSON.stringify({ status: 'batch_processing', batchOffset, total: membersPayload.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First invocation: resolve sender, fetch members, return immediate response
    console.log(`[Initial] Processing announcement ${announcement.id} in condominium ${condominium.id}`);

    const senderInfo = await resolveAuthHeader(supabase);
    if (!senderInfo) {
      return new Response(
        JSON.stringify({ error: "API key não configurada. Cadastre um número de WhatsApp na Central de Notificações." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const templateIdentifier = senderInfo.templateIdentifier ?? TEMPLATE_IDENTIFIER;

    console.log(`[Initial] Sender="${senderInfo.senderName}", template="${templateIdentifier}"`);

    let members: UnifiedMember[];
    try {
      members = await fetchAndFilterMembers(supabase, announcement, condominium);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err instanceof Error ? err.message : 'Erro ao buscar membros' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (members.length === 0) {
      return new Response(
        JSON.stringify({ total: 0, sent: 0, failed: 0, results: [], message: "Nenhum membro encontrado com os critérios selecionados" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Reuse existing broadcast or create new one
    let broadcastId = existingBroadcastId || null;
    
    if (existingBroadcastId) {
      // Resume: update existing broadcast back to processing
      await supabase
        .from('whatsapp_broadcasts')
        .update({ status: 'processing', total_members: members.length, updated_at: new Date().toISOString() })
        .eq('id', existingBroadcastId);
      console.log(`[Initial] Resuming existing broadcast ${existingBroadcastId}`);
    } else {
      // Create new broadcast record
      const { data: broadcast, error: broadcastError } = await supabase
        .from('whatsapp_broadcasts')
        .insert({
          announcement_id: announcement.id,
          condominium_id: condominium.id,
          status: 'processing',
          total_members: members.length,
        })
        .select('id')
        .single();

      if (broadcastError) {
        console.error("Error creating broadcast record:", broadcastError);
      }
      broadcastId = broadcast?.id || null;
    }
    console.log(`[Initial] Found ${members.length} members. Broadcast ID: ${broadcastId}. Starting batch processing with size=${BATCH_SIZE}`);

    // Start first batch in background
    EdgeRuntime.waitUntil(
      processBatch(members, 0, senderInfo.authHeader, announcement, condominium, supabase, templateIdentifier, broadcastId)
    );

    return new Response(
      JSON.stringify({
        total: members.length,
        status: 'processing',
        broadcast_id: broadcastId,
        message: `Enviando mensagens para ${members.length} moradores em lotes de ${BATCH_SIZE}. Cada envio terá um intervalo de 15-30 segundos.`
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
