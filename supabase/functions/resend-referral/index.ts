import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

// Declare EdgeRuntime for background processing
declare const EdgeRuntime: {
  waitUntil(promise: Promise<unknown>): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ResendRequest {
  referralId: string;
  channel: "whatsapp" | "email" | "sms" | "both" | "all";
}

interface SyndicReferralData {
  id: string;
  syndic_name: string;
  syndic_phone: string;
  syndic_email: string;
  condominium_name: string;
  referrer_name: string | null;
  whatsapp_sent: boolean | null;
  email_sent: boolean | null;
}

// Função para formatar telefone para WhatsApp
function formatPhoneForWhatsApp(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("55")) {
    return `+${cleanPhone}`;
  }
  return `+55${cleanPhone}`;
}

// Função para formatar telefone para SMSFire (apenas números, com 55)
function formatPhoneForSMSFire(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("55")) {
    return cleanPhone;
  }
  return `55${cleanPhone}`;
}

// Template de mensagem SMS (máx 160 caracteres)
function getSMSMessage(referrerName: string, condominiumName: string): string {
  const displayReferrer = referrerName || "Um morador";
  return `AVISO PRO: ${displayReferrer} do ${condominiumName} indicou voce. 3 meses GRATIS. Acesse clear-comms-hub.lovable.app`;
}

// Função para enviar SMS via SMSFire
async function sendSMS(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    const username = Deno.env.get("SMSFIRE_USERNAME");
    const apiToken = Deno.env.get("SMSFIRE_API_TOKEN");

    if (!username || !apiToken) {
      console.log("[Resend] SMS credentials not configured");
      return { success: false, error: "SMS não configurado" };
    }

    const formattedPhone = formatPhoneForSMSFire(phone);
    console.log(`[Resend] Sending SMS to ${formattedPhone}`);

    // Higienizar mensagem removendo caracteres problemáticos
    const sanitizedMessage = message.replace(/[\[\]!]/g, "");

    const url = `https://api-v3.smsfire.com.br/sms/send/individual?to=${formattedPhone}&message=${encodeURIComponent(sanitizedMessage)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Username": username,
        "Api_Token": apiToken,
      },
    });

    const responseData = await response.json();
    console.log("[Resend] SMS API response:", JSON.stringify(responseData));

    if (response.ok && responseData.status === "OK") {
      console.log("[Resend] SMS sent successfully");
      return { success: true };
    } else {
      console.error(`[Resend] SMS API error: ${response.status} - ${JSON.stringify(responseData)}`);
      return { success: false, error: responseData.message || "Erro no envio" };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Resend] SMS send error:", error);
    return { success: false, error: errorMessage };
  }
}

// Função para enviar WhatsApp via ZionTalk
async function sendWhatsApp(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let apiKey = Deno.env.get("ZIONTALK_API_KEY");

    // Buscar remetente ativo do banco
    const { data: senders } = await supabaseAdmin
      .from("whatsapp_senders")
      .select("api_key")
      .eq("is_active", true)
      .order("is_default", { ascending: false })
      .limit(1);

    if (senders && senders.length > 0) {
      apiKey = senders[0].api_key;
    }

    if (!apiKey) {
      console.log("No WhatsApp API key configured");
      return { success: false, error: "WhatsApp não configurado" };
    }

    const formattedPhone = formatPhoneForWhatsApp(phone);
    console.log(`[Resend] Sending WhatsApp to ${formattedPhone}`);

    const authHeader = 'Basic ' + encode(`${apiKey}:`);

    const formData = new FormData();
    formData.append('msg', message);
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

    if (!success) {
      const errorText = await response.text();
      if (response.status === 500 && errorText.includes("Failed to send")) {
        console.error(`[Resend] WhatsApp: Número ${formattedPhone} provavelmente não tem WhatsApp`);
      } else {
        console.error(`[Resend] WhatsApp API error: ${response.status} - ${errorText}`);
      }
      return { success: false, error: errorText };
    }

    console.log("[Resend] WhatsApp sent successfully");
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Resend] WhatsApp send error:", error);
    return { success: false, error: errorMessage };
  }
}

// Função para enviar Email via SMTP
async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const smtpUser = Deno.env.get("ZOHO_SMTP_USER");
    const smtpPassword = Deno.env.get("ZOHO_SMTP_PASSWORD");
    const smtpHost = Deno.env.get("ZOHO_SMTP_HOST") || "smtppro.zoho.com";
    const fromEmail = Deno.env.get("ZOHO_FROM_EMAIL") || smtpUser;

    if (!smtpUser || !smtpPassword) {
      console.log("[Resend] SMTP credentials not configured");
      return { success: false, error: "Email não configurado" };
    }

    console.log(`[Resend] Sending email to ${to}`);

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: 465,
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPassword,
        },
      },
    });

    await client.send({
      from: fromEmail!,
      to: to,
      subject: subject,
      content: "auto",
      html: htmlContent,
    });

    await client.close();
    console.log("[Resend] Email sent successfully");
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Resend] Email send error:", error);
    return { success: false, error: errorMessage };
  }
}

// Template de mensagem WhatsApp
function getWhatsAppMessage(syndicName: string, referrerName: string, condominiumName: string): string {
  const siteUrl = "https://clear-comms-hub.lovable.app";
  const displayReferrer = referrerName || "Um morador";
  
  return `Olá ${syndicName}!

${displayReferrer} do ${condominiumName} indicou o *AVISO PRO* para você!

O AVISO PRO é a plataforma oficial de comunicação para condomínios:
✅ Avisos centralizados em uma timeline
✅ Notificações via WhatsApp, Email e SMS
✅ *3 meses GRÁTIS* para testar

Conheça agora: ${siteUrl}

Atenciosamente,
Equipe AVISO PRO`;
}

// Template de Email HTML
function getEmailHtml(syndicName: string, referrerName: string, condominiumName: string): string {
  const siteUrl = "https://clear-comms-hub.lovable.app";
  const displayReferrer = referrerName || "Um morador";

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Indicação AVISO PRO</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">AVISO PRO</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Comunicação Oficial para Condomínios</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 22px;">Olá ${syndicName}!</h2>
              
              <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                <strong>${displayReferrer}</strong> do <strong>${condominiumName}</strong> indicou o AVISO PRO para você!
              </p>
              
              <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <p style="color: #1e40af; margin: 0; font-size: 15px; font-weight: 500;">
                  "Um morador do seu condomínio acredita que você vai gostar do AVISO PRO!"
                </p>
              </div>
              
              <h3 style="color: #18181b; margin: 0 0 16px 0; font-size: 18px;">O que é o AVISO PRO?</h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7;">
                    <span style="color: #22c55e; font-size: 18px; margin-right: 12px;">✓</span>
                    <span style="color: #3f3f46; font-size: 15px;">Timeline oficial com todos os avisos do condomínio</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7;">
                    <span style="color: #22c55e; font-size: 18px; margin-right: 12px;">✓</span>
                    <span style="color: #3f3f46; font-size: 15px;">Notificações automáticas via WhatsApp, Email e SMS</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7;">
                    <span style="color: #22c55e; font-size: 18px; margin-right: 12px;">✓</span>
                    <span style="color: #3f3f46; font-size: 15px;">Registro histórico de todas as comunicações</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #22c55e; font-size: 18px; margin-right: 12px;">✓</span>
                    <span style="color: #3f3f46; font-size: 15px;">Configuração rápida em menos de 5 minutos</span>
                  </td>
                </tr>
              </table>
              
              <!-- CTA -->
              <div style="text-align: center; margin: 32px 0;">
                <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); display: inline-block; padding: 4px; border-radius: 10px;">
                  <a href="${siteUrl}" style="display: inline-block; background-color: #ffffff; color: #16a34a; text-decoration: none; font-weight: 700; font-size: 16px; padding: 14px 32px; border-radius: 8px;">
                    🎁 Começar 3 meses GRÁTIS
                  </a>
                </div>
              </div>
              
              <p style="color: #71717a; font-size: 14px; text-align: center; margin: 24px 0 0 0;">
                Sem compromisso • Sem cartão de crédito • Cancele quando quiser
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #18181b; padding: 24px 32px; text-align: center;">
              <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;">
                © ${new Date().getFullYear()} AVISO PRO. Todos os direitos reservados.
              </p>
              <p style="color: #71717a; font-size: 12px; margin: 0;">
                Você recebeu este email porque foi indicado por um morador.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Background processing function
async function resendNotificationsInBackground(
  referralId: string,
  referral: SyndicReferralData,
  channel: "whatsapp" | "email" | "sms" | "both" | "all"
): Promise<void> {
  console.log(`[Resend Background] Starting for ${referralId}, channel: ${channel}`);

  let whatsappSent = referral.whatsapp_sent;
  let emailSent = referral.email_sent;
  let smsSent = false;

  try {
    // Reenviar WhatsApp se solicitado
    if (channel === "whatsapp" || channel === "both" || channel === "all") {
      const whatsappMessage = getWhatsAppMessage(
        referral.syndic_name,
        referral.referrer_name || "",
        referral.condominium_name
      );
      const result = await sendWhatsApp(referral.syndic_phone, whatsappMessage);
      whatsappSent = result.success;
      console.log(`[Resend Background] WhatsApp: ${result.success ? "success" : "failed - " + result.error}`);
    }

    // Reenviar Email se solicitado
    if (channel === "email" || channel === "both" || channel === "all") {
      const displayReferrer = referral.referrer_name || "Um morador";
      const emailSubject = `${displayReferrer} do ${referral.condominium_name} indicou o AVISO PRO para você!`;
      const emailHtml = getEmailHtml(
        referral.syndic_name,
        referral.referrer_name || "",
        referral.condominium_name
      );
      const result = await sendEmail(referral.syndic_email, emailSubject, emailHtml);
      emailSent = result.success;
      console.log(`[Resend Background] Email: ${result.success ? "success" : "failed - " + result.error}`);
    }

    // Reenviar SMS se solicitado
    if (channel === "sms" || channel === "all") {
      const smsMessage = getSMSMessage(
        referral.referrer_name || "",
        referral.condominium_name
      );
      const result = await sendSMS(referral.syndic_phone, smsMessage);
      smsSent = result.success;
      console.log(`[Resend Background] SMS: ${result.success ? "success" : "failed - " + result.error}`);
    }

    // Atualizar status no banco
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const updateData: Record<string, boolean | null> = {};
    if (channel === "whatsapp" || channel === "both" || channel === "all") {
      updateData.whatsapp_sent = whatsappSent;
    }
    if (channel === "email" || channel === "both" || channel === "all") {
      updateData.email_sent = emailSent;
    }
    if (channel === "sms" || channel === "all") {
      updateData.sms_sent = smsSent;
    }

    await supabaseAdmin
      .from("syndic_referrals")
      .update(updateData)
      .eq("id", referralId);

    console.log(`[Resend Background] Completed for ${referralId} - WhatsApp: ${whatsappSent}, Email: ${emailSent}, SMS: ${smsSent}`);
  } catch (error) {
    console.error(`[Resend Background] Error for ${referralId}:`, error);
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { referralId, channel }: ResendRequest = await req.json();

    // Validação
    if (!referralId || !channel) {
      return new Response(
        JSON.stringify({ error: "referralId e channel são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["whatsapp", "email", "sms", "both", "all"].includes(channel)) {
      return new Response(
        JSON.stringify({ error: "channel deve ser 'whatsapp', 'email', 'sms', 'both' ou 'all'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar cliente Supabase
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar indicação
    const { data: referral, error: fetchError } = await supabaseAdmin
      .from("syndic_referrals")
      .select("*")
      .eq("id", referralId)
      .single();

    if (fetchError || !referral) {
      console.error("Referral not found:", fetchError);
      return new Response(
        JSON.stringify({ error: "Indicação não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Resend] Starting background processing for referral ${referralId}, channel: ${channel}`);

    // Process notifications in background
    EdgeRuntime.waitUntil(
      resendNotificationsInBackground(referralId, referral as SyndicReferralData, channel)
    );

    // Return immediate response
    return new Response(
      JSON.stringify({
        success: true,
        processing: true,
        message: "Reenvio iniciado. As notificações serão processadas em instantes.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Resend] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
