import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface RequestBody {
  phone: string;
  condominiumId?: string;
  condominiumName?: string;
}

const TEST_MESSAGE = `✅ *TESTE DE INTEGRAÇÃO*

Esta é uma mensagem de teste do sistema de notificações WhatsApp.

🔔 Se você recebeu esta mensagem, a integração está funcionando corretamente!

---
_Enviado via Zion Talk_`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch the sender to use (default first, then first active, then fallback to env)
    let apiKey = Deno.env.get('ZIONTALK_API_KEY');
    let apiSource = 'ENV_FALLBACK';

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
      apiSource = `DB: ${sender.name} (${sender.phone})`;
      console.log(`Using sender from database: ${sender.name} (${sender.phone})`);
    } else {
      console.log("No active senders found, using ENV fallback");
    }

    // Check if API key is configured (GET request)
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

    // Basic Auth: API Key as username, empty password
    const authHeader = 'Basic ' + encode(`${apiKey}:`);

    const { phone, condominiumId, condominiumName }: RequestBody = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, error: "Telefone é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean the phone number - remove formatting, keep only digits
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Validate phone format (Brazilian format)
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return new Response(
        JSON.stringify({ success: false, error: "Formato de telefone inválido. Use formato brasileiro com DDD." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format to E.164 (add +55 for Brazil if not present)
    const formattedPhone = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;

    console.log(`Sending test WhatsApp to ${formattedPhone}`);

    // Create form data for ZionTalk API
    const formData = new FormData();
    formData.append('msg', TEST_MESSAGE);
    formData.append('mobile_phone', formattedPhone);

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
      console.error(`Failed to send test message: ${response.status} - ${errorMessage}`);
    } else {
      console.log(`Successfully sent test message to ${formattedPhone}`);
    }

    // Log the test send attempt
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
