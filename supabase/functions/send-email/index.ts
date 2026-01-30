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

interface MemberProfile {
  id: string;
  email: string;
  full_name: string | null;
}

interface MemberRow {
  user_id: string;
  profiles: MemberProfile;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  informativo: { label: 'Informativo', emoji: 'ℹ️', color: '#3B82F6' },
  financeiro: { label: 'Financeiro', emoji: '💰', color: '#10B981' },
  manutencao: { label: 'Manutenção', emoji: '🔧', color: '#F59E0B' },
  convivencia: { label: 'Convivência', emoji: '🤝', color: '#8B5CF6' },
  seguranca: { label: 'Segurança', emoji: '🔒', color: '#EF4444' },
  urgente: { label: 'Urgente', emoji: '⚠️', color: '#DC2626' },
};

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

// Renew Zoho access token using refresh token
async function renewZohoAccessToken(): Promise<string> {
  const ZOHO_CLIENT_ID = Deno.env.get('ZOHO_CLIENT_ID');
  const ZOHO_CLIENT_SECRET = Deno.env.get('ZOHO_CLIENT_SECRET');
  const ZOHO_REFRESH_TOKEN = Deno.env.get('ZOHO_REFRESH_TOKEN');

  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
    throw new Error('Zoho OAuth credentials not configured');
  }

  const tokenUrl = `https://accounts.zoho.com/oauth/v2/token?` +
    `refresh_token=${ZOHO_REFRESH_TOKEN}&` +
    `grant_type=refresh_token&` +
    `client_id=${ZOHO_CLIENT_ID}&` +
    `client_secret=${ZOHO_CLIENT_SECRET}`;

  console.log('[Zoho] Renewing access token...');

  const response = await fetch(tokenUrl, { method: 'POST' });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Zoho] Token renewal failed:', response.status, errorText);
    throw new Error(`Failed to renew Zoho token: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.access_token) {
    console.error('[Zoho] No access_token in response:', data);
    throw new Error('No access_token in Zoho response');
  }

  console.log('[Zoho] ✓ Access token renewed successfully');
  return data.access_token;
}

// Send email via Zoho Mail API
async function sendZohoEmail(
  accessToken: string,
  toEmail: string,
  subject: string,
  htmlContent: string
): Promise<{ success: boolean; error?: string }> {
  const ZOHO_ACCOUNT_ID = Deno.env.get('ZOHO_ACCOUNT_ID');
  const ZOHO_FROM_EMAIL = Deno.env.get('ZOHO_FROM_EMAIL');

  if (!ZOHO_ACCOUNT_ID || !ZOHO_FROM_EMAIL) {
    throw new Error('Zoho account configuration missing');
  }

  const response = await fetch(
    `https://mail.zoho.com/api/accounts/${ZOHO_ACCOUNT_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromAddress: ZOHO_FROM_EMAIL,
        toAddress: toEmail,
        subject: subject,
        content: htmlContent,
        mailFormat: 'html',
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return { success: false, error: `${response.status} - ${errorText}` };
  }

  return { success: true };
}

// Background task to send emails with delays
async function sendEmailsInBackground(
  members: MemberRow[],
  announcement: Announcement,
  condominium: Condominium,
  baseUrl: string,
  supabase: SupabaseClient
) {
  console.log(`[Background] Iniciando envio de emails para ${members.length} membros...`);

  let accessToken: string;
  
  try {
    accessToken = await renewZohoAccessToken();
  } catch (tokenError) {
    console.error('[Background] Failed to get access token:', tokenError);
    
    // Log failure for all members
    for (const member of members) {
      await supabase.from('email_logs').insert({
        announcement_id: announcement.id,
        condominium_id: condominium.id,
        recipient_email: member.profiles.email,
        recipient_name: member.profiles.full_name,
        status: 'failed',
        error_message: tokenError instanceof Error ? tokenError.message : 'Token renewal failed',
      });
    }
    return;
  }

  const subject = `[${condominium.name}] ${announcement.title}`;
  const htmlContent = generateEmailHtml(announcement, condominium, baseUrl);

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const profile = member.profiles;

    // Wait before sending (except for first member)
    if (i > 0) {
      const delaySeconds = Math.floor(Math.random() * 16) + 15; // 15-30 seconds
      console.log(`[Background] Aguardando ${delaySeconds}s antes do próximo envio...`);
      await randomDelay(15, 30);
    }

    console.log(`[Background] Enviando email ${i + 1} de ${members.length}: ${profile.email} (${profile.full_name || 'Unknown'})`);

    try {
      const result = await sendZohoEmail(accessToken, profile.email, subject, htmlContent);

      if (result.success) {
        console.log(`[Background] ✓ Email enviado com sucesso para ${profile.email}`);
      } else {
        console.error(`[Background] Falha ao enviar para ${profile.email}: ${result.error}`);
      }

      // Log the send attempt
      await supabase.from('email_logs').insert({
        announcement_id: announcement.id,
        condominium_id: condominium.id,
        recipient_email: profile.email,
        recipient_name: profile.full_name,
        status: result.success ? 'sent' : 'failed',
        error_message: result.error || null,
      });

    } catch (sendError) {
      console.error(`[Background] Exceção ao enviar para ${profile.email}:`, sendError);

      await supabase.from('email_logs').insert({
        announcement_id: announcement.id,
        condominium_id: condominium.id,
        recipient_email: profile.email,
        recipient_name: profile.full_name,
        status: 'failed',
        error_message: sendError instanceof Error ? sendError.message : 'Unknown error',
      });
    }
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
    const requiredEnvVars = [
      'ZOHO_CLIENT_ID',
      'ZOHO_CLIENT_SECRET', 
      'ZOHO_REFRESH_TOKEN',
      'ZOHO_ACCOUNT_ID',
      'ZOHO_FROM_EMAIL',
    ];

    for (const envVar of requiredEnvVars) {
      if (!Deno.env.get(envVar)) {
        console.error(`${envVar} not configured`);
        return new Response(
          JSON.stringify({ error: `${envVar} não configurado` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const { announcement, condominium, baseUrl }: RequestBody = await req.json();

    console.log(`Processing email send for announcement ${announcement.id} in condominium ${condominium.id}`);

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch members with registered email addresses (only approved members)
    const { data: membersData, error: membersError } = await supabase
      .from('user_roles')
      .select('user_id, profiles!inner(id, email, full_name)')
      .eq('condominium_id', condominium.id)
      .eq('is_approved', true)
      .not('profiles.email', 'is', null);

    if (membersError) {
      console.error("Error fetching members:", membersError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar membros", details: membersError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const members = membersData as unknown as MemberRow[];

    // Filter out empty emails
    const validMembers = members.filter(m => m.profiles.email && m.profiles.email.trim() !== '');

    if (validMembers.length === 0) {
      console.log("No members with email addresses found");
      return new Response(
        JSON.stringify({ total: 0, sent: 0, failed: 0, results: [], message: "Nenhum membro com email cadastrado" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${validMembers.length} members with email addresses`);

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
