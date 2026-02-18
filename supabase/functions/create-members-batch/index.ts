import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MemberInput {
  fullName: string;
  phone: string;
  email: string;
  block: string;
  unit: string;
  role: "admin" | "syndic" | "resident" | "collaborator";
}

interface BatchRequest {
  condominiumId: string;
  members: MemberInput[];
}

const REQUIRES_LOCATION = ["condominium", "franchise"];
const MAX_BATCH_SIZE = 500;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify authentication
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Batch import by user:", userId);

    // Parse body
    const body: BatchRequest = await req.json();
    const { condominiumId, members } = body;

    if (!condominiumId || !members || !Array.isArray(members)) {
      return new Response(
        JSON.stringify({ error: "condominiumId e members são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (members.length === 0) {
      return new Response(
        JSON.stringify({ success: 0, failed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (members.length > MAX_BATCH_SIZE) {
      return new Response(
        JSON.stringify({ error: `Máximo ${MAX_BATCH_SIZE} membros por chamada` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check permission ONCE
    const { data: canManage, error: permError } = await userClient.rpc(
      "can_manage_condominium",
      { cond_id: condominiumId }
    );

    if (permError || !canManage) {
      return new Response(
        JSON.stringify({ error: "Você não tem permissão para gerenciar esta organização" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get org type ONCE
    const { data: condoData, error: condoError } = await serviceClient
      .from("condominiums")
      .select("organization_type")
      .eq("id", condominiumId)
      .single();

    if (condoError) {
      return new Response(
        JSON.stringify({ error: "Erro ao verificar tipo de organização" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orgType = condoData?.organization_type || "condominium";
    const requiresLocation = REQUIRES_LOCATION.includes(orgType);

    // Validate all members
    const validMembers: MemberInput[] = [];
    let failed = 0;

    for (const m of members) {
      if (!m.phone && !m.fullName) { failed++; continue; }
      if (requiresLocation && (!m.block || !m.unit)) { failed++; continue; }
      validMembers.push(m);
    }

    if (validMembers.length === 0) {
      return new Response(
        JSON.stringify({ success: 0, failed }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Inserting ${validMembers.length} condo_members in batch...`);

    // Batch insert condo_members
    const condoMembersData = validMembers.map((m) => ({
      full_name: m.fullName || m.phone || "Sem nome",
      email: m.email || null,
      phone: m.phone || null,
    }));

    const { data: insertedMembers, error: membersError } = await serviceClient
      .from("condo_members")
      .insert(condoMembersData)
      .select("id");

    if (membersError || !insertedMembers) {
      console.error("Batch condo_members insert error:", membersError);
      return new Response(
        JSON.stringify({ error: `Erro ao criar membros: ${membersError?.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Inserted ${insertedMembers.length} condo_members, now creating user_roles...`);

    // Batch insert user_roles
    const userRolesData = insertedMembers.map((cm, i) => ({
      condominium_id: condominiumId,
      member_id: cm.id,
      user_id: null,
      role: validMembers[i].role,
      block: validMembers[i].block?.trim() || null,
      unit: validMembers[i].unit?.trim() || null,
      is_approved: true,
    }));

    const { error: rolesError } = await serviceClient
      .from("user_roles")
      .insert(userRolesData);

    if (rolesError) {
      console.error("Batch user_roles insert error:", rolesError);
      // Rollback: delete inserted condo_members
      const idsToDelete = insertedMembers.map((cm) => cm.id);
      await serviceClient.from("condo_members").delete().in("id", idsToDelete);

      return new Response(
        JSON.stringify({ error: `Erro ao vincular membros: ${rolesError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Batch import complete: ${insertedMembers.length} success, ${failed} failed`);

    return new Response(
      JSON.stringify({ success: insertedMembers.length, failed }),
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
