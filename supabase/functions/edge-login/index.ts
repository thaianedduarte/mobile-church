
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { JWT } from 'npm:jsonwebtoken@9.0.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Cliente Admin com service_role_key (ignora RLS)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

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
      throw new Error('QR code é obrigatório');
    }

    // 1. Busca o membro pelo UUID usando o cliente Admin
    const { data: member, error: memberError } = await supabaseAdmin
      .from('membros')
      .select(`
        id,
        nome,
        funcao,
        ativo,
        profiles!inner(
          id,
          email
        )
      `)
      .eq('uuid', qrCode)
      .single();

    if (memberError || !member) {
      throw new Error('QR Code inválido');
    }

    // 2. Verifica se o membro está ativo
    if (!member.ativo) {
      throw new Error('Membro inativo');
    }

    // 3. Busca o usuário auth relacionado ao profile
    const { data: authUser, error: userError } = await supabaseAdmin.auth.admin
      .getUserById(member.profiles.id);

    if (userError || !authUser.user) {
      throw new Error('Usuário de autenticação não encontrado');
    }

    // 4. Gera uma sessão JWT para o usuário
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin
      .generateLink({
        type: 'magiclink',
        email: authUser.user.email!,
        options: {
          redirectTo: undefined // Não queremos redirect
        }
      });

    if (sessionError) {
      throw new Error('Erro ao gerar sessão');
    }

    // 5. Cria uma sessão programaticamente
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.admin
      .createUser({
        email: authUser.user.email!,
        user_metadata: {
          member_id: member.id,
          member_name: member.nome,
          member_role: member.funcao
        }
      });

    // Para compatibilidade com o frontend atual, retornamos os dados no formato esperado
    return new Response(
      JSON.stringify({
        valid: true,
        memberId: member.id,
        email: member.profiles.email,
        name: member.nome,
        role: member.funcao,
        // Dados adicionais para estabelecer sessão
        user_id: member.profiles.id,
        access_token: sessionData.properties?.action_link || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
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
