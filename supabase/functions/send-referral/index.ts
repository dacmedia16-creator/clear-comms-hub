import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReferralRequest {
  syndicName: string;
  syndicPhone: string;
  syndicEmail: string;
  condominiumName: string;
  referrerName?: string;
}

// Função para formatar telefone para WhatsApp (apenas números com código do país)
function formatPhoneForWhatsApp(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("55")) {
    return cleanPhone;
  }
  return `55${cleanPhone}`;
}

// Função para enviar WhatsApp via ZionTalk
async function sendWhatsApp(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Buscar remetente ativo do banco ou usar variável de ambiente
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let apiKey = Deno.env.get("ZIONTALK_API_KEY");

    // Tentar buscar do banco primeiro
    const { data: senders } = await supabaseAdmin
      .from("whatsapp_senders")
      .select("api_key")
      .eq("is_active", true)
      .eq("is_default", true)
      .limit(1);

    if (senders && senders.length > 0) {
      apiKey = senders[0].api_key;
    }

    if (!apiKey) {
      console.log("No WhatsApp API key configured");
      return { success: false, error: "WhatsApp não configurado" };
    }

    const formattedPhone = formatPhoneForWhatsApp(phone);
    console.log(`Sending WhatsApp to ${formattedPhone}`);

    const response = await fetch("https://api.z-api.io/instances/send-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Token": apiKey,
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WhatsApp API error:", errorText);
      return { success: false, error: errorText };
    }

    console.log("WhatsApp sent successfully");
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("WhatsApp send error:", error);
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
      console.log("SMTP credentials not configured");
      return { success: false, error: "Email não configurado" };
    }

    console.log(`Sending email to ${to}`);

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
    console.log("Email sent successfully");
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Email send error:", error);
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

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { syndicName, syndicPhone, syndicEmail, condominiumName, referrerName }: ReferralRequest = await req.json();

    // Validação básica
    if (!syndicName || !syndicPhone || !syndicEmail || !condominiumName) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios não preenchidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(syndicEmail)) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar cliente Supabase com service role para bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Saving referral to database...");

    // 1. Salvar no banco de dados
    const { data: referral, error: insertError } = await supabaseAdmin
      .from("syndic_referrals")
      .insert({
        syndic_name: syndicName.trim(),
        syndic_phone: syndicPhone.trim(),
        syndic_email: syndicEmail.trim().toLowerCase(),
        condominium_name: condominiumName.trim(),
        referrer_name: referrerName?.trim() || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro ao salvar indicação" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Referral saved:", referral.id);

    // 2. Enviar WhatsApp
    const whatsappMessage = getWhatsAppMessage(syndicName, referrerName || "", condominiumName);
    const whatsappResult = await sendWhatsApp(syndicPhone, whatsappMessage);

    // 3. Enviar Email
    const emailSubject = `${referrerName || "Um morador"} do ${condominiumName} indicou o AVISO PRO para você!`;
    const emailHtml = getEmailHtml(syndicName, referrerName || "", condominiumName);
    const emailResult = await sendEmail(syndicEmail, emailSubject, emailHtml);

    // 4. Atualizar status de envio no banco
    await supabaseAdmin
      .from("syndic_referrals")
      .update({
        whatsapp_sent: whatsappResult.success,
        email_sent: emailResult.success,
      })
      .eq("id", referral.id);

    console.log("Referral completed:", {
      id: referral.id,
      whatsapp: whatsappResult.success,
      email: emailResult.success,
    });

    return new Response(
      JSON.stringify({
        success: true,
        referralId: referral.id,
        whatsappSent: whatsappResult.success,
        emailSent: emailResult.success,
        message: "Indicação enviada com sucesso!",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
