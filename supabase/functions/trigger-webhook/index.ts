import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const hashArray = Array.from(new Uint8Array(signature));
  return "sha256=" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { condominiumId, eventType, data } = await req.json();

    if (!condominiumId || !eventType || !data) {
      throw new Error("Missing required fields: condominiumId, eventType, data");
    }

    console.log(`[trigger-webhook] Processing ${eventType} for condominium ${condominiumId}`);

    // Fetch active webhooks for this condominium and event
    const { data: webhooks, error: webhooksError } = await supabase
      .from("webhooks")
      .select("*")
      .eq("condominium_id", condominiumId)
      .eq("is_active", true)
      .contains("events", [eventType]);

    if (webhooksError) {
      console.error("[trigger-webhook] Error fetching webhooks:", webhooksError);
      throw webhooksError;
    }

    if (!webhooks || webhooks.length === 0) {
      console.log("[trigger-webhook] No active webhooks found for this event");
      return new Response(
        JSON.stringify({ success: true, message: "No webhooks configured", triggered: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[trigger-webhook] Found ${webhooks.length} active webhook(s)`);

    // Fetch condominium details for context
    const { data: condominium } = await supabase
      .from("condominiums")
      .select("id, name, organization_type, slug")
      .eq("id", condominiumId)
      .single();

    const payload: WebhookPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data: {
        ...data,
        organization: condominium
          ? {
              id: condominium.id,
              name: condominium.name,
              type: condominium.organization_type,
              slug: condominium.slug,
            }
          : null,
      },
    };

    const payloadString = JSON.stringify(payload);
    const results: Array<{ webhookId: string; success: boolean; status?: number }> = [];

    // Send to each webhook
    for (const webhook of webhooks) {
      let success = false;
      let responseStatus: number | undefined;
      let responseBody: string | undefined;

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "User-Agent": "AVISO-PRO-Webhook/1.0",
          "X-AVISO-Event": eventType,
          "X-AVISO-Delivery": crypto.randomUUID(),
        };

        // Add signature if secret is configured
        if (webhook.secret) {
          headers["X-AVISO-Signature"] = await generateSignature(payloadString, webhook.secret);
        }

        console.log(`[trigger-webhook] Sending to ${webhook.url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(webhook.url, {
          method: "POST",
          headers,
          body: payloadString,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        responseStatus = response.status;
        responseBody = await response.text();
        success = response.ok;

        console.log(`[trigger-webhook] Response from ${webhook.name}: ${responseStatus}`);
      } catch (error) {
        console.error(`[trigger-webhook] Error sending to ${webhook.name}:`, error);
        responseBody = error instanceof Error ? error.message : "Unknown error";
      }

      // Log the webhook delivery
      await supabase.from("webhook_logs").insert({
        webhook_id: webhook.id,
        event_type: eventType,
        payload: payload,
        response_status: responseStatus,
        response_body: responseBody?.substring(0, 1000), // Limit response body size
        success,
      });

      // Update last_triggered_at
      await supabase
        .from("webhooks")
        .update({ last_triggered_at: new Date().toISOString() })
        .eq("id", webhook.id);

      results.push({ webhookId: webhook.id, success, status: responseStatus });
    }

    const successCount = results.filter((r) => r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        triggered: webhooks.length,
        successful: successCount,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[trigger-webhook] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
