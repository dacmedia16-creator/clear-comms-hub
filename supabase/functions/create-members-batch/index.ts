import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MemberInput {
  fullName: string;
  phone: string;
  phoneSecondary: string;
  email: string;
  block: string;
  unit: string;
  role: "admin" | "syndic" | "resident" | "collaborator";
}

interface BatchRequest {
  condominiumId: string;
  members: MemberInput[];
  listId?: string;
}

const REQUIRES_LOCATION = ["condominium", "franchise"];
const MAX_BATCH_SIZE = 500;

async function getExistingPhones(
  serviceClient: any,
  condominiumId: string,
  phones: string[]
): Promise<Set<string>> {
  const existing = new Set<string>();
  if (phones.length === 0) return existing;

  // Check condo_members phones
  const { data: cmRows } = await serviceClient
    .from("user_roles")
    .select("condo_members!inner(phone)")
    .eq("condominium_id", condominiumId)
    .in("condo_members.phone", phones);

  if (cmRows) {
    for (const row of cmRows) {
      if (row.condo_members?.phone) existing.add(row.condo_members.phone);
    }
  }

  // Check profiles phones
  const { data: pRows } = await serviceClient
    .from("user_roles")
    .select("profiles!inner(phone)")
    .eq("condominium_id", condominiumId)
    .in("profiles.phone", phones);

  if (pRows) {
    for (const row of pRows) {
      if (row.profiles?.phone) existing.add(row.profiles.phone);
    }
  }

  return existing;
}

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

    const body: BatchRequest = await req.json();
    const { condominiumId, members, listId } = body;

    if (!condominiumId || !members || !Array.isArray(members)) {
      return new Response(
        JSON.stringify({ error: "condominiumId e members são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (members.length === 0) {
      return new Response(
        JSON.stringify({ success: 0, failed: 0, skipped: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (members.length > MAX_BATCH_SIZE) {
      return new Response(
        JSON.stringify({ error: `Máximo ${MAX_BATCH_SIZE} membros por chamada` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check permission
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

    // Get org type
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

    // Validate members
    const validMembers: MemberInput[] = [];
    let failed = 0;

    for (const m of members) {
      if (!m.phone && !m.fullName) { failed++; continue; }
      if (requiresLocation && (!m.block || !m.unit)) { failed++; continue; }
      validMembers.push(m);
    }

    if (validMembers.length === 0) {
      return new Response(
        JSON.stringify({ success: 0, failed, skipped: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deduplicate internally (keep first occurrence of each phone)
    const seenPhones = new Set<string>();
    const dedupedMembers: MemberInput[] = [];
    let skippedInternal = 0;

    for (const m of validMembers) {
      if (m.phone) {
        if (seenPhones.has(m.phone)) {
          skippedInternal++;
          continue;
        }
        seenPhones.add(m.phone);
      }
      dedupedMembers.push(m);
    }

    // Check existing phones in the organization
    const phonesToCheck = dedupedMembers
      .map((m) => m.phone)
      .filter((p) => !!p);

    const existingPhones = await getExistingPhones(serviceClient, condominiumId, phonesToCheck);

    const newMembers: MemberInput[] = [];
    let skippedExisting = 0;

    for (const m of dedupedMembers) {
      if (m.phone && existingPhones.has(m.phone)) {
        skippedExisting++;
        continue;
      }
      newMembers.push(m);
    }

    const totalSkipped = skippedInternal + skippedExisting;

    if (newMembers.length === 0) {
      return new Response(
        JSON.stringify({ success: 0, failed, skipped: totalSkipped }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Inserting ${newMembers.length} condo_members (skipped ${totalSkipped} duplicates)...`);

    // Batch insert condo_members
    const condoMembersData = newMembers.map((m) => ({
      full_name: m.fullName || m.phone || "Sem nome",
      email: m.email || null,
      phone: m.phone || null,
      phone_secondary: m.phoneSecondary || null,
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

    // Batch insert user_roles
    const userRolesData = insertedMembers.map((cm, i) => ({
      condominium_id: condominiumId,
      member_id: cm.id,
      user_id: null,
      role: newMembers[i].role,
      block: newMembers[i].block?.trim() || null,
      unit: newMembers[i].unit?.trim() || null,
      is_approved: true,
      list_id: listId || null,
    }));

    const { error: rolesError } = await serviceClient
      .from("user_roles")
      .insert(userRolesData);

    if (rolesError) {
      console.error("Batch user_roles insert error:", rolesError);
      const idsToDelete = insertedMembers.map((cm) => cm.id);
      await serviceClient.from("condo_members").delete().in("id", idsToDelete);

      return new Response(
        JSON.stringify({ error: `Erro ao vincular membros: ${rolesError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Batch complete: ${insertedMembers.length} success, ${failed} failed, ${totalSkipped} skipped`);

    return new Response(
      JSON.stringify({ success: insertedMembers.length, failed, skipped: totalSkipped }),
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
