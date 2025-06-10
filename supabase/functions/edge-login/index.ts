import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { qrCode } = await req.json();

    if (!qrCode) {
      throw new Error('QR code is required');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Query the membros table to find the member with matching UUID
    const { data: member, error: memberError } = await supabase
      .from('membros')
      .select('*')
      .eq('uuid', qrCode)
      .single();

    if (memberError || !member) {
      throw new Error('Invalid QR code');
    }

    // Check if member is active
    if (!member.ativo) {
      throw new Error('Member is inactive');
    }

    // Query the profiles table to get the associated auth profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', member.id)
      .single();

    if (profileError || !profile) {
      throw new Error('No associated profile found');
    }

    return new Response(
      JSON.stringify({
        valid: true,
        memberId: member.id,
        email: profile.email,
        name: member.nome,
        role: member.funcao,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        valid: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});