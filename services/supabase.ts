
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { DashboardData, Event, Notice, Donation, MemberProfile, Birthday } from '@/types';

// Storage abstraction
const secureStoreOrLocalStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  deleteItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  }
};

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://crevcbopbhjptuedfzfz.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente Supabase configurado
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: secureStoreOrLocalStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// ===================================================================
// FUNÇÃO DE LOGIN
// ===================================================================

export const loginWithQRCode = async (qrCode: string) => {
  try {
    console.log('Tentando login com QR Code:', qrCode);
    
    // 1. CHAMA A EDGE FUNCTION (usando o método invoke do Supabase)
    const { data: functionData, error: functionError } = await supabase.functions.invoke(
      'edge-login',
      { body: { qrCode } }
    );
    
    if (functionError) {
      console.error('Erro na edge function:', functionError);
      throw new Error(functionError.message || 'Falha ao contatar o servidor de login.');
    }

    if (functionData.error) {
      console.error('Erro retornado pela edge function:', functionData.error);
      throw new Error(functionData.error);
    }

    console.log('Resposta da edge function:', functionData);

    // 2. EXTRAI O TOKEN DA RESPOSTA DO SERVIDOR
    // O servidor retorna um link mágico; precisamos do token contido nele.
    const actionLink = functionData.properties?.action_link;
    if (!actionLink) {
        throw new Error('Resposta do servidor inválida: link de ação não encontrado.');
    }
    
    const tokenHash = new URL(actionLink).searchParams.get('token');
    if (!tokenHash) {
        throw new Error('Resposta do servidor inválida: token não encontrado no link.');
    }

    console.log('Token extraído:', tokenHash);

    // 3. TROCA O TOKEN POR UMA SESSÃO DE LOGIN VÁLIDA
    // Esta é a etapa final que autentica o usuário no app.
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      type: 'magiclink',
      token_hash: tokenHash,
    });

    if (sessionError) {
      console.error('Erro ao verificar o token:', sessionError);
      throw new Error(`Erro ao verificar o token: ${sessionError.message}`);
    }

    // SUCESSO! O usuário está logado. Retorna a sessão.
    console.log('✅ Login via QR Code bem-sucedido!', sessionData.session?.user?.email);
    
    // Retorna os dados no formato esperado pelo AuthContext
    return {
      valid: true,
      memberId: sessionData.session?.user?.id,
      email: sessionData.session?.user?.email,
      name: sessionData.session?.user?.user_metadata?.member_name || 'Usuário',
      role: sessionData.session?.user?.user_metadata?.member_role || 'Membro',
      user_id: sessionData.session?.user?.id,
      access_token: sessionData.session?.access_token
    };

  } catch (error) {
    console.error('Erro no processo de login com QR Code:', error);
    // Propaga o erro para que a tela de login possa exibi-lo.
    throw error;
  }
};

// ===================================================================
// FUNÇÕES DE DADOS (API)
// ===================================================================

/**
 * Busca todos os dados necessários para a tela inicial (Dashboard).
 */
export const fetchDashboardData = async (): Promise<DashboardData> => {
  console.log("Iniciando busca de dados para o dashboard...");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuário não autenticado. Não é possível buscar dados do dashboard.');
  }

  try {
    const [
      profileResult,
      eventsResult,
      noticesResult,
      financialResult,
      birthdaysResult,
    ] = await Promise.all([
      supabase.from('profiles').select('nome').eq('id', user.id).single(),
      supabase.from('eventos').select('*').gte('data', new Date().toISOString()).order('data', { ascending: true }).limit(5),
      supabase.from('avisos').select('*').eq('ativo', true).order('created_at', { ascending: false }).limit(3),
      supabase.rpc('get_financial_summary').catch(() => ({ data: { currentMonthAmount: 0, previousMonthAmount: 0 } })),
      supabase.rpc('get_birthdays_of_the_month').catch(() => ({ data: [] })),
    ]);

    if (profileResult.error) throw new Error(`Erro ao buscar perfil: ${profileResult.error.message}`);
    if (eventsResult.error) throw new Error(`Erro ao buscar eventos: ${eventsResult.error.message}`);
    if (noticesResult.error) throw new Error(`Erro ao buscar avisos: ${noticesResult.error.message}`);

    const dashboardData: DashboardData = {
      memberName: profileResult.data?.nome || user.user_metadata?.member_name || 'Membro',
      upcomingEvents: eventsResult.data || [],
      recentNotices: noticesResult.data || [],
      financialSummary: financialResult.data || { currentMonthAmount: 0, previousMonthAmount: 0 },
      birthdaysThisMonth: birthdaysResult.data || [],
    };
    
    console.log("Dados do dashboard carregados com sucesso.");
    return dashboardData;
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    throw error;
  }
};

/**
 * Busca eventos da igreja com base em um filtro.
 */
export const fetchEvents = async (filter: 'upcoming' | 'past' | 'all' = 'all'): Promise<Event[]> => {
  console.log(`Buscando eventos com o filtro: ${filter}`);
  
  try {
    let query = supabase.from('eventos').select('*');
    
    const now = new Date().toISOString();
    
    if (filter === 'upcoming') {
      query = query.gte('data', now);
    } else if (filter === 'past') {
      query = query.lt('data', now);
    }
    
    query = query.order('data', { ascending: filter === 'past' ? false : true });
    
    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar eventos:', error);
      throw new Error(`Não foi possível carregar os eventos: ${error.message}`);
    }

    console.log(`${data?.length || 0} eventos encontrados.`);
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    throw error;
  }
};

/**
 * Busca avisos da igreja com base em um filtro.
 */
export const fetchNotices = async (filter: 'all' | 'important' | 'regular' = 'all'): Promise<Notice[]> => {
  console.log(`Buscando avisos com o filtro: ${filter}`);
  
  try {
    let query = supabase.from('avisos').select('*').eq('ativo', true);
    
    if (filter === 'important') {
      query = query.eq('prioridade', 'alta');
    } else if (filter === 'regular') {
      query = query.neq('prioridade', 'alta');
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar avisos:', error);
      throw new Error(`Não foi possível carregar os avisos: ${error.message}`);
    }

    console.log(`${data?.length || 0} avisos encontrados.`);
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar avisos:', error);
    throw error;
  }
};

/**
 * Busca doações/contribuições do usuário agrupadas por mês.
 */
export const fetchDonations = async () => {
  console.log("Buscando contribuições do usuário...");
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  try {
    const { data, error } = await supabase.rpc('get_my_contributions');

    if (error) {
      console.error('Erro ao buscar contribuições:', error);
      throw new Error(`Não foi possível carregar as contribuições: ${error.message}`);
    }

    console.log(`Contribuições carregadas com sucesso.`);
    
    // A função do banco já retorna os dados agrupados por mês
    // Se necessário, podemos fazer transformações adicionais aqui
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar contribuições:', error);
    throw error;
  }
};

/**
 * Busca os dados combinados do perfil e do registro de membro do usuário logado.
 */
export const fetchMemberProfile = async (): Promise<MemberProfile | null> => {
  console.log("Buscando dados do perfil do membro...");
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuário não autenticado.');
  }

  try {
    // A consulta usa um JOIN implícito para buscar dados das tabelas 'membros' e 'profiles' de uma vez.
    const { data, error } = await supabase
      .from('membros')
      .select(`
        cpf,
        nascimento,
        ativo,
        created_at,
        profiles (
          nome,
          papel
        )
      `)
      .eq('profile_id', user.id)
      .single(); // Esperamos apenas um resultado

    if (error) {
      console.error("Erro ao buscar perfil do membro:", error);
      throw new Error(`Não foi possível carregar os dados do perfil: ${error.message}`);
    }

    if (!data) {
      return null;
    }
    
    // Formata a data para um formato legível
    const formatDate = (dateString: string | null) => {
      if (!dateString) return 'Não informado';
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    // Mapeia os dados brutos para o tipo que a tela espera
    const profileData: MemberProfile = {
      name: data.profiles?.nome || 'Nome não encontrado',
      role: data.profiles?.papel || 'Papel não informado',
      status: data.ativo ? 'active' : 'inactive',
      cpf: data.cpf || 'Não informado',
      birthDate: formatDate(data.nascimento),
      memberSince: formatDate(data.created_at)
    };

    console.log("Perfil do membro carregado com sucesso.");
    return profileData;
  } catch (error) {
    console.error('Erro ao buscar perfil do membro:', error);
    throw error;
  }
};

/**
 * Busca aniversariantes do mês.
 */
export const fetchBirthdays = async (): Promise<Birthday[]> => {
  console.log("Buscando aniversariantes do mês...");
  
  try {
    const { data, error } = await supabase.rpc('get_birthdays_of_the_month');

    if (error) {
      console.error('Erro ao buscar aniversariantes:', error);
      throw new Error(`Não foi possível carregar os aniversariantes: ${error.message}`);
    }

    console.log(`${data?.length || 0} aniversariantes encontrados.`);
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar aniversariantes:', error);
    throw error;
  }
};

/**
 * Busca relatório completo das finanças da igreja.
 */
export const fetchChurchFinances = async () => {
  console.log("Buscando relatório financeiro da igreja...");
  
  try {
    const { data, error } = await supabase.rpc('get_church_finances_report');

    if (error) {
      console.error('Erro ao buscar finanças da igreja:', error);
      throw new Error(`Não foi possível carregar o relatório financeiro: ${error.message}`);
    }

    console.log("Relatório financeiro carregado com sucesso.");
    return data;
  } catch (error) {
    console.error('Erro ao buscar relatório financeiro:', error);
    throw error;
  }
};
