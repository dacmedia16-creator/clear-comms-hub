import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApiTokenData {
  id: string;
  condominium_id: string;
  permissions: string[];
  is_active: boolean;
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function validateToken(
  supabase: ReturnType<typeof createClient>,
  authHeader: string | null
): Promise<ApiTokenData | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token.startsWith("avp_")) {
    return null;
  }

  const tokenHash = await hashToken(token);

  const { data, error } = await supabase
    .from("api_tokens")
    .select("id, condominium_id, permissions, is_active, expires_at")
    .eq("token_hash", tokenHash)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return null;
  }

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null;
  }

  // Update last_used_at
  await supabase
    .from("api_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return {
    id: data.id,
    condominium_id: data.condominium_id,
    permissions: data.permissions || [],
    is_active: data.is_active,
  };
}

function hasPermission(tokenData: ApiTokenData, permission: string): boolean {
  return tokenData.permissions.includes(permission);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    
    // Remove 'public-api' from path if present
    const apiPath = pathParts[0] === "public-api" ? pathParts.slice(1) : pathParts;
    const resource = apiPath[0];
    const resourceId = apiPath[1];

    // Validate API token
    const tokenData = await validateToken(supabase, req.headers.get("authorization"));
    if (!tokenData) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Invalid or missing API token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[public-api] ${req.method} /${resource}${resourceId ? `/${resourceId}` : ""}`);

    // Route handling
    switch (resource) {
      case "announcements":
        return handleAnnouncements(supabase, req, tokenData, resourceId);
      case "members":
        return handleMembers(supabase, req, tokenData, resourceId);
      case "info":
        return handleInfo(supabase, tokenData);
      default:
        return new Response(
          JSON.stringify({
            error: "Not Found",
            message: "Available endpoints: /announcements, /members, /info",
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("[public-api] Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleAnnouncements(
  supabase: ReturnType<typeof createClient>,
  req: Request,
  tokenData: ApiTokenData,
  announcementId?: string
) {
  const method = req.method;

  if (method === "GET") {
    if (!hasPermission(tokenData, "read:announcements")) {
      return new Response(
        JSON.stringify({ error: "Forbidden", message: "Missing permission: read:announcements" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const category = url.searchParams.get("category");

    let query = supabase
      .from("announcements")
      .select("id, title, summary, content, category, is_pinned, is_urgent, published_at, created_at")
      .eq("condominium_id", tokenData.condominium_id)
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq("category", category);
    }

    if (announcementId) {
      query = query.eq("id", announcementId).single();
    }

    const { data, error } = await query;

    if (error) {
      return new Response(
        JSON.stringify({ error: "Database Error", message: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (method === "POST") {
    if (!hasPermission(tokenData, "write:announcements")) {
      return new Response(
        JSON.stringify({ error: "Forbidden", message: "Missing permission: write:announcements" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { title, summary, content, category, is_pinned, is_urgent } = body;

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "title and content are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabase
      .from("announcements")
      .insert({
        condominium_id: tokenData.condominium_id,
        title,
        summary: summary || null,
        content,
        category: category || "informativo",
        is_pinned: is_pinned || false,
        is_urgent: is_urgent || false,
      })
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: "Database Error", message: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Trigger webhooks for announcement.created
    try {
      await supabase.functions.invoke("trigger-webhook", {
        body: {
          condominiumId: tokenData.condominium_id,
          eventType: "announcement.created",
          data: {
            id: data.id,
            title: data.title,
            summary: data.summary,
            category: data.category,
            is_urgent: data.is_urgent,
            published_at: data.published_at,
          },
        },
      });
    } catch (webhookError) {
      console.error("[public-api] Error triggering webhooks:", webhookError);
    }

    return new Response(JSON.stringify({ data }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ error: "Method Not Allowed" }),
    { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleMembers(
  supabase: ReturnType<typeof createClient>,
  req: Request,
  tokenData: ApiTokenData,
  memberId?: string
) {
  const method = req.method;
  const url = new URL(req.url);
  const isBulk = url.pathname.endsWith("/bulk");

  if (method === "GET") {
    if (!hasPermission(tokenData, "read:members")) {
      return new Response(
        JSON.stringify({ error: "Forbidden", message: "Missing permission: read:members" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Get members through user_roles
    const { data: roles, error } = await supabase
      .from("user_roles")
      .select(`
        id,
        role,
        block,
        unit,
        is_approved,
        member_id,
        condo_members!user_roles_member_id_fkey (
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq("condominium_id", tokenData.condominium_id)
      .not("member_id", "is", null)
      .range(offset, offset + limit - 1);

    if (error) {
      return new Response(
        JSON.stringify({ error: "Database Error", message: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const members = roles?.map((role) => ({
      id: role.condo_members?.id,
      full_name: role.condo_members?.full_name,
      email: role.condo_members?.email,
      phone: role.condo_members?.phone,
      role: role.role,
      block: role.block,
      unit: role.unit,
      is_approved: role.is_approved,
    }));

    return new Response(JSON.stringify({ data: members }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (method === "POST") {
    if (!hasPermission(tokenData, "write:members")) {
      return new Response(
        JSON.stringify({ error: "Forbidden", message: "Missing permission: write:members" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    if (isBulk) {
      // Bulk import
      const { members } = body;
      if (!Array.isArray(members)) {
        return new Response(
          JSON.stringify({ error: "Bad Request", message: "members array is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const results: Array<{ success: boolean; name?: string; error?: string }> = [];

      for (const member of members) {
        try {
          const { data: newMember, error: memberError } = await supabase
            .from("condo_members")
            .insert({
              full_name: member.full_name || member.name,
              email: member.email || null,
              phone: member.phone || null,
            })
            .select()
            .single();

          if (memberError) throw memberError;

          await supabase.from("user_roles").insert({
            condominium_id: tokenData.condominium_id,
            member_id: newMember.id,
            role: member.role || "resident",
            block: member.block || null,
            unit: member.unit || null,
            is_approved: true,
          });

          results.push({ success: true, name: newMember.full_name });
        } catch (error) {
          results.push({
            success: false,
            name: member.full_name || member.name,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;

      return new Response(
        JSON.stringify({
          data: { total: members.length, successful: successCount, results },
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Single member creation
    const { full_name, name, email, phone, role, block, unit } = body;
    const memberName = full_name || name;

    if (!memberName) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "full_name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: newMember, error: memberError } = await supabase
      .from("condo_members")
      .insert({
        full_name: memberName,
        email: email || null,
        phone: phone || null,
      })
      .select()
      .single();

    if (memberError) {
      return new Response(
        JSON.stringify({ error: "Database Error", message: memberError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: roleError } = await supabase.from("user_roles").insert({
      condominium_id: tokenData.condominium_id,
      member_id: newMember.id,
      role: role || "resident",
      block: block || null,
      unit: unit || null,
      is_approved: true,
    });

    if (roleError) {
      return new Response(
        JSON.stringify({ error: "Database Error", message: roleError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Trigger webhook for member.created
    try {
      await supabase.functions.invoke("trigger-webhook", {
        body: {
          condominiumId: tokenData.condominium_id,
          eventType: "member.created",
          data: {
            id: newMember.id,
            full_name: newMember.full_name,
            email: newMember.email,
            role,
            block,
            unit,
          },
        },
      });
    } catch (webhookError) {
      console.error("[public-api] Error triggering webhooks:", webhookError);
    }

    return new Response(
      JSON.stringify({
        data: { ...newMember, role, block, unit },
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ error: "Method Not Allowed" }),
    { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleInfo(
  supabase: ReturnType<typeof createClient>,
  tokenData: ApiTokenData
) {
  const { data: condominium, error } = await supabase
    .from("condominiums")
    .select("id, name, slug, organization_type, created_at")
    .eq("id", tokenData.condominium_id)
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: "Database Error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      data: {
        organization: condominium,
        permissions: tokenData.permissions,
        api_version: "1.0.0",
      },
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
