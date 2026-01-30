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
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Validate Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Create Supabase client with user's token to verify permissions
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // 3. Verify user authentication
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Failed to get claims:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    // 4. Parse request body
    const body: CreateMemberRequest = await req.json();
    const { condominiumId, fullName, phone, email, block, unit, role } = body;

    console.log("Create member request:", { condominiumId, fullName, email, block, unit, role });

    // Validate required fields
    if (!condominiumId || !fullName || !role || !block || !unit) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: condominiumId, fullName, role, block, unit" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Check if user can manage this condominium
    const { data: canManage, error: permError } = await userClient.rpc(
      "can_manage_condominium",
      { cond_id: condominiumId }
    );

    if (permError) {
      console.error("Permission check error:", permError);
      return new Response(
        JSON.stringify({ error: "Failed to verify permissions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!canManage) {
      console.error("User does not have permission to manage this condominium");
      return new Response(
        JSON.stringify({ error: "Você não tem permissão para gerenciar este condomínio" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User has permission to manage condominium");

    // 6. Create service role client to bypass RLS
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // 7. Create condo_member (for residents without auth account)
    const { data: memberData, error: memberError } = await serviceClient
      .from("condo_members")
      .insert({
        full_name: fullName,
        email: email || null,
        phone: phone || null,
      })
      .select("id")
      .single();

    if (memberError) {
      console.error("Error creating condo_member:", memberError);
      return new Response(
        JSON.stringify({ error: `Erro ao criar membro: ${memberError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Condo member created:", memberData.id);

    // 8. Create user_role linking condo_member to condominium (using member_id instead of user_id)
    const { error: roleError } = await serviceClient
      .from("user_roles")
      .insert({
        condominium_id: condominiumId,
        member_id: memberData.id,
        user_id: null, // No profile linked - this is a manual member
        role: role,
        block: block,
        unit: unit,
        is_approved: true,
      });

    if (roleError) {
      console.error("Error creating user_role:", roleError);
      // Rollback: delete the condo_member we just created
      await serviceClient.from("condo_members").delete().eq("id", memberData.id);
      
      return new Response(
        JSON.stringify({ error: `Erro ao vincular morador: ${roleError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User role created successfully for condo_member");

    return new Response(
      JSON.stringify({ 
        success: true, 
        memberId: memberData.id,
        message: "Morador cadastrado com sucesso" 
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
