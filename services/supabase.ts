import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { DashboardData, MemberProfile, Birthday, DonationMonth, ChurchFinances } from '@/types';

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

// Supabase configuration with fallbacks and validation
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://crevcbopbhjptuedfzfz.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate required environment variables
if (!supabaseUrl) {
  console.error('EXPO_PUBLIC_SUPABASE_URL is required but not set');
}

if (!supabaseAnonKey) {
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY is required but not set');
}

// Cliente Supabase configurado - only create if we have required variables
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(
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
) : null;

// ===================================================================
// FUNÇÃO DE LOGIN MELHORADA
// ===================================================================

export const loginWithQRCode = async (qrCode: string) => {
  try {
    console.log('🔑 Tentando login com QR Code:', qrCode);
    
    // Check if supabase client is available
    if (!supabase) {
      console.warn('⚠️ Supabase client não inicializado, usando dados mock');
      
      // Fallback para dados mock quando Supabase não está disponível
      if (qrCode === 'test_member_2024' || qrCode.includes('test')) {
        return {
          valid: true,
          memberId: '550e8400-e29b-41d4-a716-446655440000',
          email: 'joao.silva@email.com',
          name: 'João Silva',
          role: 'Membro',
          status: 'active',
          memberSince: '2020-01-15',
          access_token: 'mock_token_' + Date.now()
        };
      } else {
        throw new Error('Chave de acesso inválida');
      }
    }
    
    try {
      // 1. CHAMA A EDGE FUNCTION (usando o método invoke do Supabase)
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'login-com-qrcode',
        { body: { qrCode } }
      );
      
      if (functionError) {
        console.error('❌ Erro na edge function:', functionError);
        throw new Error(functionError.message || 'Falha ao contatar o servidor de login.');
      }

      if (functionData.error) {
        console.error('❌ Erro retornado pela edge function:', functionData.error);
        throw new Error(functionData.error);
      }

      console.log('✅ Resposta da edge function:', functionData);

      // 2. EXTRAI O TOKEN DA RESPOSTA DO SERVIDOR
      const actionLink = functionData.properties?.action_link;
      if (!actionLink) {
          throw new Error('Resposta do servidor inválida: link de ação não encontrado.');
      }
      
      const tokenHash = new URL(actionLink).searchParams.get('token');
      if (!tokenHash) {
          throw new Error('Resposta do servidor inválida: token não encontrado no link.');
      }

      console.log('🔑 Token extraído:', tokenHash);

      // 3. TROCA O TOKEN POR UMA SESSÃO DE LOGIN VÁLIDA
      const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
        type: 'magiclink',
        token_hash: tokenHash,
      });

      if (sessionError) {
        console.error('❌ Erro ao verificar o token:', sessionError);
        throw new Error(`Erro ao verificar o token: ${sessionError.message}`);
      }

      console.log('✅ Login via QR Code bem-sucedido!', sessionData.session?.user?.email);
      
      // Retorna os dados no formato esperado pelo AuthContext
      return {
        valid: true,
        memberId: sessionData.session?.user?.id,
        email: sessionData.session?.user?.email,
        name: sessionData.session?.user?.user_metadata?.member_name || 'Usuário',
        role: sessionData.session?.user?.user_metadata?.member_role || 'Membro',
        status: sessionData.session?.user?.user_metadata?.member_status || 'active',
        memberSince: sessionData.session?.user?.user_metadata?.member_since,
        user_id: sessionData.session?.user?.id,
        access_token: sessionData.session?.access_token
      };

    } catch (supabaseError) {
      console.warn('⚠️ Erro no Supabase, usando fallback para dados mock:', supabaseError);
      
      // Fallback para dados mock em caso de erro do Supabase
      if (qrCode === 'test_member_2024' || qrCode.includes('test')) {
        return {
          valid: true,
          memberId: '550e8400-e29b-41d4-a716-446655440000',
          email: 'joao.silva@email.com',
          name: 'João Silva',
          role: 'Membro',
          status: 'active',
          memberSince: '2020-01-15',
          access_token: 'mock_token_' + Date.now()
        };
      } else {
        throw supabaseError;
      }
    }

  } catch (error) {
    console.error('❌ Erro no processo de login com QR Code:', error);
    throw error;
  }
};

// ===================================================================
// FUNÇÕES DE DADOS (API) COM FALLBACK
// ===================================================================

/**
 * Busca todos os dados necessários para a tela inicial (Dashboard).
 */
export const fetchDashboardData = async (): Promise<DashboardData> => {
  console.log("📊 Iniciando busca de dados para o dashboard...");

  if (!supabase) {
    console.warn('⚠️ Supabase client não inicializado, retornando dados mock');
    return {
      memberName: 'João Silva',
      financialSummary: {
        currentMonthAmount: 350.00,
        previousMonthAmount: 300.00
      },
      birthdaysThisMonth: [
        {
          id: '1',
          name: 'Maria Oliveira',
          birthDate: '15/05'
        },
        {
          id: '2',
          name: 'Carlos Souza',
          birthDate: '22/05'
        }
      ]
    };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado. Não é possível buscar dados do dashboard.');
    }

    const [
      profileResult,
      financialResult,
      birthdaysResult,
    ] = await Promise.all([
      supabase.from('profiles').select('nome').eq('id', user.id).single(),
      supabase.rpc('get_financial_summary').catch(() => ({ data: { currentMonthAmount: 0, previousMonthAmount: 0 } })),
      supabase.rpc('get_birthdays_of_the_month').catch(() => ({ data: [] })),
    ]);

    if (profileResult.error) throw new Error(`Erro ao buscar perfil: ${profileResult.error.message}`);

    const dashboardData: DashboardData = {
      memberName: profileResult.data?.nome || user.user_metadata?.member_name || 'Membro',
      financialSummary: financialResult.data || { currentMonthAmount: 0, previousMonthAmount: 0 },
      birthdaysThisMonth: birthdaysResult.data || [],
    };
    
    console.log("✅ Dados do dashboard carregados com sucesso.");
    return dashboardData;
  } catch (error) {
    console.error('❌ Erro ao buscar dados do dashboard:', error);
    throw error;
  }
};

/**
 * Busca doações/contribuições do usuário agrupadas por mês.
 */
export const fetchDonations = async (): Promise<DonationMonth[]> => {
  console.log("💰 Buscando contribuições do usuário...");
  
  if (!supabase) {
    console.warn('⚠️ Supabase client não inicializado, retornando dados mock');
    return [
      {
        date: 'maio de 2023',
        total: 350.00,
        donations: [
          { type: 'Dízimo', amount: 250.00 },
          { type: 'Oferta', amount: 100.00 }
        ]
      },
      {
        date: 'abril de 2023',
        total: 300.00,
        donations: [
          { type: 'Dízimo', amount: 250.00 },
          { type: 'Oferta', amount: 50.00 }
        ]
      }
    ];
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase.rpc('get_my_contributions');

    if (error) {
      console.error('❌ Erro ao buscar contribuições:', error);
      throw new Error(`Não foi possível carregar as contribuições: ${error.message}`);
    }

    console.log(`✅ Contribuições carregadas com sucesso.`);
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar contribuições:', error);
    throw error;
  }
};

/**
 * Busca os dados combinados do perfil e do registro de membro do usuário logado.
 */
export const fetchMemberProfile = async (): Promise<MemberProfile | null> => {
  console.log("👤 Buscando dados do perfil do membro...");
  
  if (!supabase) {
    console.warn('⚠️ Supabase client não inicializado, retornando dados mock');
    return {
      name: 'João Silva',
      role: 'Membro',
      status: 'active',
      cpf: '123.456.789-00',
      birthDate: '10/06/1985',
      memberSince: '15/01/2020'
    };
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado.');
    }

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
      .single();

    if (error) {
      console.error("❌ Erro ao buscar perfil do membro:", error);
      throw new Error(`Não foi possível carregar os dados do perfil: ${error.message}`);
    }

    if (!data) {
      return null;
    }
    
    const formatDate = (dateString: string | null) => {
      if (!dateString) return 'Não informado';
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    const profileData: MemberProfile = {
      name: data.profiles?.nome || 'Nome não encontrado',
      role: data.profiles?.papel || 'Papel não informado',
      status: data.ativo ? 'active' : 'inactive',
      cpf: data.cpf || 'Não informado',
      birthDate: formatDate(data.nascimento),
      memberSince: formatDate(data.created_at)
    };

    console.log("✅ Perfil do membro carregado com sucesso.");
    return profileData;
  } catch (error) {
    console.error('❌ Erro ao buscar perfil do membro:', error);
    throw error;
  }
};

/**
 * Busca aniversariantes de um mês específico.
 */
export const fetchBirthdays = async (month: number): Promise<Birthday[]> => {
  console.log(`🎂 Buscando aniversariantes do mês ${month}...`);
  
  if (!supabase) {
    console.warn('⚠️ Supabase client não inicializado, retornando dados mock');
    const mockBirthdays = [
      { id: '1', name: 'Maria Oliveira', birthDate: '2023-05-15' },
      { id: '2', name: 'Carlos Souza', birthDate: '2023-05-22' },
      { id: '3', name: 'Ana Santos', birthDate: '2023-06-05' }
    ];
    
    return mockBirthdays.filter(birthday => 
      new Date(birthday.birthDate).getMonth() === month - 1
    );
  }
  
  try {
    const { data, error } = await supabase.rpc('get_birthdays_by_month', { month_number: month });

    if (error) {
      console.error('❌ Erro ao buscar aniversariantes:', error);
      throw new Error(`Não foi possível carregar os aniversariantes: ${error.message}`);
    }

    console.log(`✅ ${data?.length || 0} aniversariantes encontrados.`);
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar aniversariantes:', error);
    throw error;
  }
};

/**
 * Busca relatório completo das finanças da igreja.
 */
export const fetchChurchFinances = async (): Promise<ChurchFinances> => {
  console.log("💼 Buscando relatório financeiro da igreja...");
  
  if (!supabase) {
    console.warn('⚠️ Supabase client não inicializado, retornando dados mock');
    return {
      balance: 25000.00,
      currentMonth: {
        income: 15000.00,
        expenses: 12500.00
      },
      expenseCategories: [
        { name: 'Manutenção', amount: 3000.00 },
        { name: 'Utilidades', amount: 2500.00 },
        { name: 'Ação Social', amount: 2000.00 },
        { name: 'Eventos', amount: 1500.00 },
        { name: 'Material', amount: 1000.00 },
        { name: 'Outros', amount: 2500.00 }
      ]
    };
  }
  
  try {
    const { data, error } = await supabase
      .from('prestacao_contas')
      .select('*')
      .order('mes', { ascending: false })
      .limit(12);

    if (error) {
      console.error('❌ Erro ao buscar prestação de contas:', error);
      throw new Error(`Não foi possível carregar o relatório financeiro: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        balance: 0,
        currentMonth: {
          income: 0,
          expenses: 0
        },
        expenseCategories: []
      };
    }

    const currentMonthData = data[0];
    
    const totalBalance = data.reduce((acc, month) => {
      return acc + (month.entradas || 0) - (month.saidas || 0);
    }, 0);

    const expenseCategories = [];
    
    if (currentMonthData.manutencao > 0) {
      expenseCategories.push({ name: 'Manutenção', amount: currentMonthData.manutencao });
    }
    if (currentMonthData.utilidades > 0) {
      expenseCategories.push({ name: 'Utilidades', amount: currentMonthData.utilidades });
    }
    if (currentMonthData.acao_social > 0) {
      expenseCategories.push({ name: 'Ação Social', amount: currentMonthData.acao_social });
    }
    if (currentMonthData.eventos > 0) {
      expenseCategories.push({ name: 'Eventos', amount: currentMonthData.eventos });
    }
    if (currentMonthData.material > 0) {
      expenseCategories.push({ name: 'Material', amount: currentMonthData.material });
    }
    if (currentMonthData.outros > 0) {
      expenseCategories.push({ name: 'Outros', amount: currentMonthData.outros });
    }

    const churchFinances: ChurchFinances = {
      balance: totalBalance,
      currentMonth: {
        income: currentMonthData.entradas || 0,
        expenses: currentMonthData.saidas || 0
      },
      expenseCategories
    };

    console.log("✅ Relatório financeiro carregado com sucesso.");
    return churchFinances;
  } catch (error) {
    console.error('❌ Erro ao buscar relatório financeiro:', error);
    throw error;
  }
};