import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil(promise: Promise<unknown>): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface Announcement {
  id: string;
  title: string;
  summary: string | null;
  category: string;
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
  profiles: ContactInfo | null;
  condo_members: ContactInfo | null;
}

interface UnifiedMember {
  email: string;
  full_name: string | null;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  informativo: { label: 'Informativo', emoji: 'ℹ️', color: '#3B82F6' },
  financeiro: { label: 'Financeiro', emoji: '💰', color: '#10B981' },
  manutencao: { label: 'Manutenção', emoji: '🔧', color: '#F59E0B' },
  convivencia: { label: 'Convivência', emoji: '🤝', color: '#8B5CF6' },
  seguranca: { label: 'Segurança', emoji: '🔒', color: '#EF4444' },
  urgente: { label: 'Urgente', emoji: '⚠️', color: '#DC2626' },
};

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

    // EHLO
    const ehloResp = await sendCommand(`EHLO localhost`);
    if (!ehloResp.startsWith("250")) {
      throw new Error(`EHLO failed: ${ehloResp}`);
    }

    // AUTH LOGIN
    const authResp = await sendCommand("AUTH LOGIN");
    if (!authResp.startsWith("334")) {
      throw new Error(`AUTH LOGIN failed: ${authResp}`);
    }

    // Send username (base64)
    const userResp = await sendCommand(btoa(username));
    if (!userResp.startsWith("334")) {
      throw new Error(`Username rejected: ${userResp}`);
    }

    // Send password (base64)
    const passResp = await sendCommand(btoa(password));
    if (!passResp.startsWith("235")) {
      throw new Error(`Authentication failed: ${passResp.trim()}`);
    }

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
    if (conn) {
      try { conn.close(); } catch {}
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

function generateEmailHtml(
  announcement: Announcement,
  condominium: Condominium,
  baseUrl: string
): string {
  const category = CATEGORY_LABELS[announcement.category] || CATEGORY_LABELS.informativo;
  const timelineUrl = `${baseUrl}/c/${condominium.slug}`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${announcement.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #18181b; padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">
                ${condominium.name}
              </h1>
            </td>
          </tr>
          
          <!-- Category Badge -->
          <tr>
            <td style="padding: 24px 32px 0 32px;">
              <span style="display: inline-block; padding: 6px 12px; background-color: ${category.color}; color: #ffffff; font-size: 12px; font-weight: 600; border-radius: 16px; text-transform: uppercase;">
                ${category.emoji} ${category.label}
              </span>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 20px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 24px; font-weight: 700; line-height: 1.3;">
                ${announcement.title}
              </h2>
              ${announcement.summary ? `
              <p style="margin: 0 0 24px 0; color: #52525b; font-size: 16px; line-height: 1.6;">
                ${announcement.summary}
              </p>
              ` : ''}
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #18181b; border-radius: 8px;">
                    <a href="${timelineUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600;">
                      Ver aviso completo →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 20px 32px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; color: #71717a; font-size: 12px; line-height: 1.5;">
                Você está recebendo este email porque faz parte do ${condominium.name}.
              </p>
              <p style="margin: 8px 0 0 0; color: #a1a1aa; font-size: 11px;">
                Enviado por AvisoPro
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Random delay between min and max seconds
function randomDelay(minSeconds: number, maxSeconds: number): Promise<void> {
  const ms = Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds) * 1000;
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Background task to send emails with delays
async function sendEmailsInBackground(
  members: UnifiedMember[],
  announcement: Announcement,
  condominium: Condominium,
  baseUrl: string,
  supabase: SupabaseClient
) {
  console.log(`[Background] Iniciando envio de emails para ${members.length} membros...`);

  const host = Deno.env.get('ZOHO_SMTP_HOST') || 'smtppro.zoho.com';
  const username = Deno.env.get('ZOHO_SMTP_USER')!;
  const password = Deno.env.get('ZOHO_SMTP_PASSWORD')!;
  
  const subject = `[${condominium.name}] ${announcement.title}`;
  const htmlContent = generateEmailHtml(announcement, condominium, baseUrl);

  for (let i = 0; i < members.length; i++) {
    const member = members[i];

    // Wait before sending (except for first member)
    if (i > 0) {
      const delaySeconds = Math.floor(Math.random() * 16) + 15; // 15-30 seconds
      console.log(`[Background] Aguardando ${delaySeconds}s antes do próximo envio...`);
      await randomDelay(15, 30);
    }

    console.log(`[Background] Enviando email ${i + 1} de ${members.length}: ${member.email} (${member.full_name || 'Unknown'})`);

    const result = await sendSmtpEmail(
      host,
      465,
      username,
      password,
      username,
      member.email,
      subject,
      htmlContent
    );

    if (result.success) {
      console.log(`[Background] ✓ Email enviado com sucesso para ${member.email}`);
    } else {
      console.error(`[Background] Falha ao enviar para ${member.email}: ${result.error}`);
    }

    // Log the result
    await supabase.from('email_logs').insert({
      announcement_id: announcement.id,
      condominium_id: condominium.id,
      recipient_email: member.email,
      recipient_name: member.full_name,
      status: result.success ? 'sent' : 'failed',
      error_message: result.error || null,
    });
  }

  console.log(`[Background] ✓ Processamento de emails concluído para ${members.length} membros`);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check required environment variables
    const ZOHO_SMTP_USER = Deno.env.get('ZOHO_SMTP_USER');
    const ZOHO_SMTP_PASSWORD = Deno.env.get('ZOHO_SMTP_PASSWORD');

    if (!ZOHO_SMTP_USER || !ZOHO_SMTP_PASSWORD) {
      console.error("SMTP credentials not configured");
      return new Response(
        JSON.stringify({ error: "Credenciais SMTP não configuradas" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { announcement, condominium, baseUrl }: RequestBody = await req.json();

    console.log(`Processing email send for announcement ${announcement.id} in condominium ${condominium.id}`);

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch members from BOTH sources: profiles (authenticated) and condo_members (manual)
    const { data: rolesData, error: membersError } = await supabase
      .from('user_roles')
      .select(`
        user_id, member_id,
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

    // Unify members from both sources, filtering those with valid email addresses
    const validMembers: UnifiedMember[] = memberRows
      .map(role => {
        const source = role.profiles || role.condo_members;
        if (!source || !source.email || source.email.trim() === '') return null;
        return {
          email: source.email,
          full_name: source.full_name,
        };
      })
      .filter((m): m is UnifiedMember => m !== null);

    if (validMembers.length === 0) {
      console.log("No members with email addresses found");
      return new Response(
        JSON.stringify({ total: 0, sent: 0, failed: 0, results: [], message: "Nenhum membro com email cadastrado" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${validMembers.length} members with email addresses (from profiles + condo_members)`);

    // Start background processing with delays
    EdgeRuntime.waitUntil(
      sendEmailsInBackground(validMembers, announcement, condominium, baseUrl, supabase)
    );

    // Return immediate response
    console.log(`Returning immediate response, ${validMembers.length} emails will be sent in background with 15-30s delays`);

    return new Response(
      JSON.stringify({ 
        total: validMembers.length, 
        status: 'processing',
        message: `Enviando emails para ${validMembers.length} moradores em segundo plano. Cada envio terá um intervalo de 15-30 segundos.`
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
