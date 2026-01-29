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
    const ZIONTALK_API_KEY = Deno.env.get('ZIONTALK_API_KEY');
    
    if (!ZIONTALK_API_KEY) {
      console.error("ZIONTALK_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "API key não configurada", apiConfigured: false }),
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

    // Basic Auth: API Key as username, empty password
    const authHeader = 'Basic ' + encode(`${ZIONTALK_API_KEY}:`);

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

    // Create Supabase client with service role for logging
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

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
