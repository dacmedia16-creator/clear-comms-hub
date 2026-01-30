import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface RequestBody {
  email: string;
  condominiumId?: string;
  condominiumName?: string;
}

async function getZohoAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';
  
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get Zoho access token: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ZOHO_CLIENT_ID = Deno.env.get('ZOHO_CLIENT_ID');
    const ZOHO_CLIENT_SECRET = Deno.env.get('ZOHO_CLIENT_SECRET');
    const ZOHO_REFRESH_TOKEN = Deno.env.get('ZOHO_REFRESH_TOKEN');
    const ZOHO_ACCOUNT_ID = Deno.env.get('ZOHO_ACCOUNT_ID');
    const ZOHO_FROM_EMAIL = Deno.env.get('ZOHO_FROM_EMAIL');
    
    if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN || !ZOHO_ACCOUNT_ID || !ZOHO_FROM_EMAIL) {
      console.error("Zoho credentials not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Credenciais Zoho Mail não configuradas", apiConfigured: false }),
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

    const { email, condominiumId }: RequestBody = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Formato de email inválido" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending test email to ${email}`);

    // Create Supabase client with service role for logging
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get fresh access token
    const accessToken = await getZohoAccessToken(ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN);

    // Send email via Zoho Mail API (using global .com endpoint)
    const sendUrl = `https://mail.zoho.com/api/accounts/${ZOHO_ACCOUNT_ID}/messages`;
    
    const emailPayload = {
      fromAddress: ZOHO_FROM_EMAIL,
      toAddress: email,
      subject: '✅ Teste de Integração - Sistema de Notificações',
      content: `
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #22c55e;">✅ Teste de Integração</h2>
          <p>Esta é uma mensagem de teste do sistema de notificações por email.</p>
          <p><strong>Se você recebeu este email, a integração com o Zoho Mail está funcionando corretamente!</strong></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">Enviado via API Zoho Mail</p>
        </body>
        </html>
      `,
      mailFormat: 'html',
    };

    const response = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const responseData = await response.json();
    const success = response.ok && responseData?.status?.code === 200;
    
    let errorMessage: string | undefined;
    if (!success) {
      errorMessage = responseData?.status?.description || responseData?.message || `HTTP ${response.status}`;
      console.error(`Failed to send test email: ${errorMessage}`);
    } else {
      console.log(`Successfully sent test email to ${email}`);
    }

    // Log the test send attempt
    await supabase.from('email_logs').insert({
      announcement_id: null,
      condominium_id: condominiumId || null,
      recipient_email: email,
      recipient_name: 'Teste Manual',
      status: success ? 'sent' : 'failed',
      error_message: errorMessage || null,
    });

    return new Response(
      JSON.stringify({ 
        success, 
        email,
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
