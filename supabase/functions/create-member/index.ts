import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CreateMemberRequest {
  condominiumId: string;
  fullName: string;
  phone: string;
  email: string;
  block: string;
  unit: string;
  role: "admin" | "syndic" | "resident" | "collaborator";
  listId?: string | null;
}

const REQUIRES_LOCATION = ["condominium", "franchise"];

async function findExistingPhone(
  serviceClient: any,
  condominiumId: string,
  phone: string
): Promise<boolean> {
  if (!phone) return false;

  // Check condo_members with same phone in this org
  const { data: cmRows } = await serviceClient
    .from("user_roles")
    .select("id, condo_members!inner(phone)")
    .eq("condominium_id", condominiumId)
    .eq("condo_members.phone", phone)
    .limit(1);

  if (cmRows && cmRows.length > 0) return true;

  // Check profiles with same phone in this org
  const { data: pRows } = await serviceClient
    .from("user_roles")
    .select("id, profiles!inner(phone)")
    .eq("condominium_id", condominiumId)
    .eq("profiles.phone", phone)
    .limit(1);

  if (pRows && pRows.length > 0) return true;

  return false;
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
    console.log("Authenticated user:", userId);

    const body: CreateMemberRequest = await req.json();
    const { condominiumId, fullName, phone, email, block, unit, role, listId } = body;

    if (!condominiumId || !role) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: condominiumId, role" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!phone && !fullName) {
      return new Response(
        JSON.stringify({ error: "Telefone é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Check for duplicate phone
    if (phone) {
      const exists = await findExistingPhone(serviceClient, condominiumId, phone);
      if (exists) {
        return new Response(
          JSON.stringify({ error: "Membro com este telefone já está cadastrado nesta organização" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

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

    if (requiresLocation && (!block || !unit)) {
      return new Response(
        JSON.stringify({ error: "Campos block e unit são obrigatórios para este tipo de organização" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: memberData, error: memberError } = await serviceClient
      .from("condo_members")
      .insert({
        full_name: fullName || phone || "Sem nome",
        email: email || null,
        phone: phone || null,
      })
      .select("id")
      .single();

    if (memberError) {
      return new Response(
        JSON.stringify({ error: `Erro ao criar membro: ${memberError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: roleError } = await serviceClient
      .from("user_roles")
      .insert({
        condominium_id: condominiumId,
        member_id: memberData.id,
        user_id: null,
        role: role,
        block: block?.trim() || null,
        unit: unit?.trim() || null,
        is_approved: true,
        list_id: listId || null,
      });

    if (roleError) {
      await serviceClient.from("condo_members").delete().eq("id", memberData.id);
      return new Response(
        JSON.stringify({ error: `Erro ao vincular membro: ${roleError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, memberId: memberData.id, message: "Membro cadastrado com sucesso" }),
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
