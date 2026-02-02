import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface RequestBody {
  action?: 'test-connection' | 'send';
  email?: string;
  condominiumId?: string;
}

// ZeptoMail API implementation
async function sendZeptoEmail(
  to: string,
  toName: string,
  subject: string,
  htmlBody: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get('ZEPTOMAIL_API_KEY');
  
  if (!apiKey) {
    return { success: false, error: 'ZEPTOMAIL_API_KEY not configured' };
  }

  try {
    console.log(`Sending email via ZeptoMail API to: ${to}`);
    
    const response = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: JSON.stringify({
        from: { address: 'noreply@avisopro.com.br', name: 'AvisoPro' },
        to: [{ email_address: { address: to, name: toName || to } }],
        subject: subject,
        htmlbody: htmlBody,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✓ Email sent successfully to ${to}`, data);
      return { success: true };
    } else {
      const errorData = await response.text();
      console.error(`✗ Failed to send email to ${to}:`, errorData);
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.error(`✗ Exception sending email to ${to}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ZEPTOMAIL_API_KEY = Deno.env.get('ZEPTOMAIL_API_KEY');
    
    if (!ZEPTOMAIL_API_KEY) {
      console.error("ZeptoMail API key not configured");
      return new Response(
        JSON.stringify({ success: false, error: "API de email não configurada", apiConfigured: false }),
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

    const body: RequestBody = await req.json();
    const { action = 'send', email, condominiumId } = body;

    // Action: test-connection - verify API connection by sending a test email to self
    if (action === 'test-connection') {
      console.log('Testing ZeptoMail API connection...');
      
      const result = await sendZeptoEmail(
        'noreply@avisopro.com.br',
        'AvisoPro Test',
        'ZeptoMail API Connection Test',
        '<p>This is a test message to verify ZeptoMail API connection.</p>'
      );

      if (result.success) {
        console.log('✓ ZeptoMail API connection verified successfully');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Conexão com API ZeptoMail verificada com sucesso',
            apiConfigured: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.error('ZeptoMail API verification failed:', result.error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: result.error || 'Falha na verificação da API',
            apiConfigured: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Action: send - send a test email
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

    const htmlContent = `
      <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #22c55e;">✅ Teste de Integração</h2>
        <p>Esta é uma mensagem de teste do sistema de notificações por email.</p>
        <p><strong>Se você recebeu este email, a integração com ZeptoMail está funcionando corretamente!</strong></p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">Enviado via ZeptoMail API</p>
      </body>
      </html>
    `;

    const result = await sendZeptoEmail(
      email,
      'Teste Manual',
      '✅ Teste de Integração - Sistema de Notificações',
      htmlContent
    );

    // Log the test send attempt
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabase.from('email_logs').insert({
      announcement_id: null,
      condominium_id: condominiumId || null,
      recipient_email: email,
      recipient_name: 'Teste Manual',
      status: result.success ? 'sent' : 'failed',
      error_message: result.error || null,
    });

    if (result.success) {
      console.log(`✓ Test email sent successfully to ${email}`);
    } else {
      console.error(`✗ Failed to send test email: ${result.error}`);
    }

    return new Response(
      JSON.stringify({ 
        success: result.success, 
        email,
        error: result.error,
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
