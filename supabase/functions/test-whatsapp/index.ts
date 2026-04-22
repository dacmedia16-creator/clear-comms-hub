import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TEMPLATE_IDENTIFIER = 'aviso_pro_confirma_3';
const VISITA_TEMPLATE_IDENTIFIER = 'visita_prova_envio';
const VIP7_TEMPLATE_IDENTIFIER = 'vip7_captacao';
const VIP7_2_TEMPLATE_IDENTIFIER = 'vip7_captacao2';
const VIP7_3_TEMPLATE_IDENTIFIER = 'vip7_captacao3';
const VISITA3_TEMPLATE_IDENTIFIER = 'visita_prova_envio3';
const VISITA4_TEMPLATE_IDENTIFIER = 'visita_prova_envio4';
const TEMPLATE_LANGUAGE = 'pt_BR';

interface RequestBody {
  phone: string;
  condominiumId?: string;
  condominiumName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch sender (DB first, ENV fallback)
    let apiKey = Deno.env.get('ZIONTALK_API_KEY');
    let apiSource = 'ENV_FALLBACK';
    let senderName = 'ENV_DEFAULT';

    let senderTemplateIdentifier: string | null = null;
    let buttonConfig = 'two_buttons';
    let hasNomeParam = true;
    let senderIdResolved: string | null = null;

    // Parse body early (only for non-GET) to check templateId
    let bodyData: { phone?: string; condominiumId?: string; templateId?: string } = {};
    if (req.method !== 'GET') {
      try {
        bodyData = await req.json();
      } catch {
        bodyData = {};
      }
    }
    const requestedTemplateId = bodyData.templateId;

    // If templateId provided, fetch the template + its sender directly
    if (requestedTemplateId) {
      const { data: tpl, error: tplError } = await supabase
        .from('whatsapp_sender_templates')
        .select('*, whatsapp_senders(*)')
        .eq('id', requestedTemplateId)
        .maybeSingle();

      if (tplError) console.error('Error fetching template:', tplError);

      if (tpl && tpl.whatsapp_senders) {
        const s = tpl.whatsapp_senders as any;
        apiKey = s.api_key;
        senderName = s.name;
        senderIdResolved = s.id;
        senderTemplateIdentifier = tpl.identifier;
        buttonConfig = tpl.button_config ?? 'two_buttons';
        hasNomeParam = tpl.has_nome_param ?? true;
        apiSource = `DB (template): ${tpl.label} via ${s.name}`;
        console.log(`Using template ${tpl.label} (${tpl.identifier}) from sender ${s.name}, button_config: ${buttonConfig}, has_nome_param: ${hasNomeParam}`);
      } else {
        console.warn(`Template ${requestedTemplateId} not found, falling back to default sender`);
      }
    }

    const { data: senders, error: sendersError } = senderIdResolved
      ? { data: null, error: null }
      : await supabase
          .from('whatsapp_senders')
          .select('*')
          .eq('is_active', true)
          .order('is_default', { ascending: false })
          .limit(1);

    if (!senderIdResolved) {
      if (sendersError) {
        console.error("Error fetching whatsapp_senders:", sendersError);
      } else if (senders && senders.length > 0) {
        const sender = senders[0];
        apiKey = sender.api_key;
        senderName = sender.name;
        senderTemplateIdentifier = sender.template_identifier ?? null;
        buttonConfig = sender.button_config ?? 'two_buttons';
        hasNomeParam = sender.has_nome_param ?? true;

        const { data: defaultTemplate, error: defaultTemplateError } = await supabase
          .from('whatsapp_sender_templates')
          .select('identifier, label, button_config, has_nome_param')
          .eq('sender_id', sender.id)
          .eq('is_default', true)
          .maybeSingle();

        if (defaultTemplateError) {
          console.error('Error fetching default sender template:', defaultTemplateError);
        }

        if (defaultTemplate) {
          senderTemplateIdentifier = defaultTemplate.identifier ?? senderTemplateIdentifier;
          buttonConfig = defaultTemplate.button_config ?? buttonConfig;
          hasNomeParam = defaultTemplate.has_nome_param ?? hasNomeParam;
          apiSource = `DB (template padrão): ${defaultTemplate.label} via ${sender.name} (${sender.phone})`;
          console.log(`Using default template ${defaultTemplate.label} (${senderTemplateIdentifier}) from sender ${sender.name}, button_config: ${buttonConfig}, has_nome_param: ${hasNomeParam}`);
        } else {
          apiSource = `DB: ${sender.name} (${sender.phone})`;
          console.log(`Using sender from database: ${sender.name} (${sender.phone}), template_identifier: ${senderTemplateIdentifier ?? 'default'}, button_config: ${buttonConfig}, has_nome_param: ${hasNomeParam}`);
        }
      } else {
        console.log("No active senders found, using ENV fallback");
      }
    }

    // GET: check config status
    if (req.method === 'GET') {
      return new Response(
        JSON.stringify({ 
          apiConfigured: !!apiKey,
          hasEnvKey: !!Deno.env.get('ZIONTALK_API_KEY'),
          hasDbSenders: senders && senders.length > 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKey) {
      console.error("No API key available");
      return new Response(
        JSON.stringify({ success: false, error: "API key não configurada", apiConfigured: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`API Key source: ${apiSource}`);

    const authHeader = 'Basic ' + encode(`${apiKey}:`);

    const templateToUse = senderTemplateIdentifier ?? TEMPLATE_IDENTIFIER;
    console.log(`Using template: ${templateToUse} (sender: ${senderName})`);
    const { phone, condominiumId } = bodyData;

    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, error: "Telefone é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return new Response(
        JSON.stringify({ success: false, error: "Formato de telefone inválido. Use formato brasileiro com DDD." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formattedPhone = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;

    console.log(`Sending test WhatsApp (template) to ${formattedPhone}`);

    // Use send_template_message with aviso_informativo template
    const formData = new FormData();
    formData.append('mobile_phone', formattedPhone);
    formData.append('template_identifier', templateToUse);
    formData.append('language', TEMPLATE_LANGUAGE);

    // bodyParams conforme template
    if (hasNomeParam) {
      formData.append('bodyParams[nome]', 'Teste');
    }
    formData.append('bodyParams[aviso]', 'Mensagem de teste do sistema');
    formData.append('bodyParams[lembrete]', 'Se você recebeu esta mensagem, a integração está funcionando corretamente!');

    if (buttonConfig === 'single_button_idx0') {
      formData.append('buttonUrlDynamicParams[0]', 'test-demo');
    } else if (buttonConfig === 'single_button_idx1') {
      formData.append('buttonUrlDynamicParams[1]', 'test-demo');
    } else if (buttonConfig === 'no_buttons') {
      // No dynamic button params
    } else {
      // two_buttons (default)
      formData.append('buttonUrlDynamicParams[0]', 'c/demo');
      formData.append('buttonUrlDynamicParams[1]', 'test-demo');
    }

    // Logar payload exato enviado para Zion Talk
    const formDataLog: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      formDataLog[key] = value as string;
    }
    console.log(`[Test] Sender: ${senderName} | API Key: ${apiKey?.substring(0, 8)}... | Template: ${templateToUse}`);
    console.log(`[Test] Payload enviado para Zion Talk:`, JSON.stringify(formDataLog));

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
    console.log(`Zion Talk response: status=${response.status} headers=${JSON.stringify(responseHeaders)} body=${responseBody}`);

    const success = response.status === 201;
    let errorMessage: string | undefined;

    if (!success) {
      errorMessage = responseBody;
      console.error(`Failed to send test message: ${response.status} - ${responseBody}`);
    } else {
      console.log(`Successfully sent test message to ${formattedPhone}`);
    }

    await supabase.from('whatsapp_logs').insert({
      announcement_id: null,
      condominium_id: condominiumId || null,
      recipient_phone: formattedPhone,
      recipient_name: 'Teste Manual',
      status: success ? 'sent' : 'failed',
      error_message: errorMessage || null,
    });

    return new Response(
      JSON.stringify({ 
        success, 
        phone: formattedPhone,
        error: errorMessage,
        apiConfigured: true,
        apiSource
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro inesperado',
        apiConfigured: true
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
