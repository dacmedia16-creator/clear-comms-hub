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

// Simple SMTP implementation using Deno's native TLS
async function sendSmtpEmail(
  host: string,
  port: number,
  username: string,
  password: string,
  from: string,
  to: string,
  subject: string,
  htmlBody: string
): Promise<{ success: boolean; error?: string }> {
  let conn: Deno.TlsConn | null = null;
  
  try {
    conn = await Deno.connectTls({
      hostname: host,
      port: port,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = "";

    async function readLine(): Promise<string> {
      while (!buffer.includes("\r\n")) {
        const chunk = new Uint8Array(1024);
        const n = await conn!.read(chunk);
        if (n === null) throw new Error("Connection closed");
        buffer += decoder.decode(chunk.subarray(0, n));
      }
      const idx = buffer.indexOf("\r\n");
      const line = buffer.substring(0, idx);
      buffer = buffer.substring(idx + 2);
      return line;
    }

    async function readResponse(): Promise<string> {
      const lines: string[] = [];
      while (true) {
        const line = await readLine();
        lines.push(line);
        // If line[3] is space (not hyphen), it's the last line
        if (line.length >= 4 && line[3] === ' ') break;
        // Also break if it's a single-line response
        if (line.length < 4) break;
      }
      return lines.join("\r\n");
    }

    async function sendCommand(cmd: string): Promise<string> {
      await conn!.write(encoder.encode(cmd + "\r\n"));
      return await readResponse();
    }

    // Read greeting
    const greeting = await readResponse();
    const greetingCode = greeting.substring(0, 3);
    if (greetingCode !== "220") {
      throw new Error(`Unexpected greeting: ${greeting}`);
    }
    console.log("Server greeting OK");

    // EHLO
    const ehloResp = await sendCommand(`EHLO localhost`);
    if (!ehloResp.startsWith("250")) {
      throw new Error(`EHLO failed: ${ehloResp}`);
    }
    console.log("EHLO OK");

    // AUTH LOGIN
    const authResp = await sendCommand("AUTH LOGIN");
    if (!authResp.startsWith("334")) {
      throw new Error(`AUTH LOGIN failed: ${authResp}`);
    }
    console.log("AUTH LOGIN initiated");

    // Send username (base64)
    const userResp = await sendCommand(btoa(username));
    if (!userResp.startsWith("334")) {
      throw new Error(`Username rejected: ${userResp}`);
    }
    console.log("Username accepted");

    // Send password (base64)
    const passResp = await sendCommand(btoa(password));
    if (!passResp.startsWith("235")) {
      throw new Error(`Authentication failed: ${passResp.trim()}`);
    }
    console.log("Authentication successful");

    // MAIL FROM
    const fromResp = await sendCommand(`MAIL FROM:<${from}>`);
    if (!fromResp.startsWith("250")) {
      throw new Error(`MAIL FROM failed: ${fromResp}`);
    }

    // RCPT TO
    const toResp = await sendCommand(`RCPT TO:<${to}>`);
    if (!toResp.startsWith("250")) {
      throw new Error(`RCPT TO failed: ${toResp}`);
    }

    // DATA
    const dataResp = await sendCommand("DATA");
    if (!dataResp.startsWith("354")) {
      throw new Error(`DATA failed: ${dataResp}`);
    }

    // Send email content
    const emailContent = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      ``,
      htmlBody,
      `.`
    ].join("\r\n");

    const sendResp = await sendCommand(emailContent);
    if (!sendResp.startsWith("250")) {
      throw new Error(`Send failed: ${sendResp}`);
    }

    // QUIT
    await sendCommand("QUIT");

    conn.close();
    return { success: true };

  } catch (error) {
    console.error("SMTP Error:", error);
    if (conn) {
      try { conn.close(); } catch {}
    }
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
    const ZOHO_SMTP_USER = Deno.env.get('ZOHO_SMTP_USER');
    const ZOHO_SMTP_PASSWORD = Deno.env.get('ZOHO_SMTP_PASSWORD');
    const ZOHO_SMTP_HOST = Deno.env.get('ZOHO_SMTP_HOST') || 'smtppro.zoho.com';
    
    if (!ZOHO_SMTP_USER || !ZOHO_SMTP_PASSWORD) {
      console.error("SMTP credentials not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Credenciais SMTP não configuradas", apiConfigured: false }),
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

    // Action: test-connection - verify SMTP connection by sending a test email to self
    if (action === 'test-connection') {
      console.log('Testing SMTP connection...');
      console.log(`Host: ${ZOHO_SMTP_HOST}, User: ${ZOHO_SMTP_USER}`);
      
      const result = await sendSmtpEmail(
        ZOHO_SMTP_HOST,
        465,
        ZOHO_SMTP_USER,
        ZOHO_SMTP_PASSWORD,
        ZOHO_SMTP_USER,
        ZOHO_SMTP_USER,
        'SMTP Connection Test',
        '<p>This is a test message to verify SMTP connection.</p>'
      );

      if (result.success) {
        console.log('✓ SMTP connection verified successfully');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Conexão SMTP verificada com sucesso',
            apiConfigured: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.error('SMTP verification failed:', result.error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: result.error || 'Falha na verificação SMTP',
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
        <p><strong>Se você recebeu este email, a integração SMTP está funcionando corretamente!</strong></p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">Enviado via SMTP Zoho Mail</p>
      </body>
      </html>
    `;

    const result = await sendSmtpEmail(
      ZOHO_SMTP_HOST,
      465,
      ZOHO_SMTP_USER,
      ZOHO_SMTP_PASSWORD,
      ZOHO_SMTP_USER,
      email,
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
      console.error(`Failed to send test email: ${result.error}`);
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
