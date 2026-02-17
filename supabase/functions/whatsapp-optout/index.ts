import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Token inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find the opt-out record by token
    const { data: record, error: findError } = await supabase
      .from('whatsapp_optouts')
      .select('id, phone, opted_out_at')
      .eq('token', token)
      .maybeSingle();

    if (findError) {
      console.error('Error finding opt-out record:', findError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro interno' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!record) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Already opted out
    if (record.opted_out_at) {
      return new Response(
        JSON.stringify({ success: true, already: true, message: 'Você já foi descadastrado anteriormente.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark as opted out
    const { error: updateError } = await supabase
      .from('whatsapp_optouts')
      .update({ opted_out_at: new Date().toISOString() })
      .eq('id', record.id);

    if (updateError) {
      console.error('Error updating opt-out:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao processar descadastro' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Phone ${record.phone} opted out successfully (token: ${token})`);

    return new Response(
      JSON.stringify({ success: true, message: 'Descadastrado com sucesso.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro inesperado' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
