import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface RequestBody {
  phone: string;
  condominiumId?: string;
  condominiumName?: string;
}

const TEST_MESSAGE = `[TESTE] Sistema de SMS funcionando! Se voce recebeu esta mensagem, a integracao SMSFire esta OK.`;

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
        JSON.stringify({ success: false, error: "Credenciais SMSFire não configuradas", apiConfigured: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If it's a GET request, just check if API is configured
    if (req.method === 'GET') {
      return new Response(
        JSON.stringify({ apiConfigured: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { phone, condominiumId }: RequestBody = await req.json();

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

    // Format for SMSFire (55 + DDD + number)
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    console.log(`Sending test SMS to ${formattedPhone}`);

    // Create Supabase client with service role for logging
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Generate Base64 token for Basic auth (username:password)
    const token = btoa(`${SMSFIRE_USERNAME}:${SMSFIRE_API_TOKEN}`);

    // Call SMSFire API v2 with GET and query params
    const url = new URL('https://api-v2.smsfire.com.br/sms/send/individual');
    url.searchParams.set('to', formattedPhone);
    url.searchParams.set('text', TEST_MESSAGE);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${token}`,
      },
    });

    const responseData = await response.json();
    const success = response.ok && responseData?.message !== 'error';
    
    let errorMessage: string | undefined;
    if (!success) {
      errorMessage = responseData?.message || responseData?.error || `HTTP ${response.status}`;
      console.error(`Failed to send test SMS: ${errorMessage}`);
    } else {
      console.log(`Successfully sent test SMS to ${formattedPhone}`);
    }

    // Log the test send attempt
    await supabase.from('sms_logs').insert({
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
        apiConfigured: true
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
