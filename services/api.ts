import axios from 'axios';
import { 
  DonationMonth, 
  MemberProfile,
  Birthday,
  MemberBasicInfo,
  DashboardData,
  ChurchFinances
} from '@/types';
import { supabase } from './supabase';
import { cacheService } from './cache';

// Test authentication key - DO NOT use in production!
export const TEST_AUTH_KEY = "test_member_2024";

// Base URL for the API
const API_BASE_URL = 'https://api.igrejademocristofake.com/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add token to requests
const addAuthHeader = (token: string) => {
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// API Functions - Updated to use Supabase with cache
export const fetchDashboardData = async (token: string): Promise<DashboardData> => {
  const { cacheService } = await import('./cache');
  
  return cacheService.getOrFetch(
    'dashboard_data',
    async () => {
      try {
        const { fetchDashboardData: supabaseFetchDashboard } = await import('./supabase');
        return await supabaseFetchDashboard();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
      }
    },
    10 // Cache por 10 minutos para dados do dashboard
  );
};

export const fetchDonations = async (token: string): Promise<DonationMonth[]> => {
  const { cacheService } = await import('./cache');
  
  return cacheService.getOrFetch(
    'donations',
    async () => {
      try {
        const { fetchDonations: supabaseFetchDonations } = await import('./supabase');
        return await supabaseFetchDonations();
      } catch (error) {
        console.error('Error fetching donations:', error);
        throw error;
      }
    },
    30 // Cache por 30 minutos para doações
  );
};

export const fetchChurchFinances = async (token: string): Promise<ChurchFinances> => {
  const { cacheService } = await import('./cache');
  
  return cacheService.getOrFetch(
    'church_finances',
    async () => {
      try {
        const { fetchChurchFinances: supabaseFetchChurchFinances } = await import('./supabase');
        return await supabaseFetchChurchFinances();
      } catch (error) {
        console.error('Error fetching church finances:', error);
        throw error;
      }
    },
    20 // Cache por 20 minutos para finanças da igreja
  );
};

// ===================================================================
// NOVA FUNÇÃO PARA A TELA DE PERFIL
// ===================================================================
const PROFILE_CACHE_KEY = 'member_profile';

/**
 * Busca os dados combinados do perfil e do registro de membro do usuário logado.
 * Usa cache para performance, pois esses dados mudam raramente.
 */
export const fetchMemberProfile = async (): Promise<MemberProfile | null> => {
    // 1. Tenta buscar do cache primeiro
    const cachedProfile = await cacheService.get(PROFILE_CACHE_KEY);
    if (cachedProfile) {
      console.log('[fetchMemberProfile] Retornando dados do cache');
      return cachedProfile;
    }

    console.log('[fetchMemberProfile] Buscando dados do banco');
    
    // 2. Busca os dados do usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('[fetchMemberProfile] Erro ao buscar usuário:', userError);
      throw new Error('Usuário não autenticado');
    }

    // 3. Busca os dados do perfil do membro
    const { data, error } = await supabase
      .from('membros')
      .select(`
        *,
        profiles (
          papel
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('[fetchMemberProfile] Erro ao buscar perfil:', error);
      throw error;
    }

    console.log('[fetchMemberProfile] Dados brutos do banco:', JSON.stringify(data, null, 2));
    console.log('[fetchMemberProfile] Created at:', data?.created_at);

    // 4. Formata os dados para o tipo que a tela espera
    const formatDate = (dateString: string | null) => {
      if (!dateString) return 'Não informado';
      // Adiciona 'T00:00:00' para garantir que a data seja interpretada corretamente como local
      return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    };

    // Função específica para formatar o created_at
    const formatCreatedAt = (dateString: string | null) => {
      if (!dateString) {
        console.log('[formatCreatedAt] Data nula recebida');
        return 'Não informado';
      }
      try {
        console.log('[formatCreatedAt] Data recebida:', dateString);
        // Remove a parte do timezone e milissegundos
        const cleanDate = dateString.split('+')[0].trim();
        console.log('[formatCreatedAt] Data limpa:', cleanDate);
        const formattedDate = new Date(cleanDate).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
        console.log('[formatCreatedAt] Data formatada:', formattedDate);
        return formattedDate;
      } catch (error) {
        console.error('[formatCreatedAt] Erro ao formatar created_at:', error);
        return 'Data inválida';
      }
    };

    // CORREÇÃO: Mapeia `data.nome` para o nome e `data.profiles.papel` para o cargo.
    const profileData: MemberProfile = {
      name: data.nome || 'Nome não encontrado',
      role: data.profiles?.[0].papel || 'Papel não informado',
      status: data.ativo ? 'active' : 'inactive',
      cpf: data.cpf || 'Não informado',
      birthDate: formatDate(data.nascimento),
      memberSince: formatCreatedAt(data.created_at)
    };

    console.log('[fetchMemberProfile] Dados formatados:', JSON.stringify(profileData, null, 2));

    // 5. Salva no cache por 60 minutos
    await cacheService.set(PROFILE_CACHE_KEY, profileData, 60 * 60 * 1000);

    return profileData;
};

// ===================================================================
// NOVA FUNÇÃO PARA A TELA DE ANIVERSARIANTES
// ===================================================================
const BIRTHDAYS_CACHE_KEY_PREFIX = 'birthdays_month_';

/**
 * Busca os aniversariantes de um mês específico.
 * @param month - O número do mês (1 para Janeiro, 2 para Fevereiro, etc.).
 */
export const fetchBirthdays = async (month: number): Promise<Birthday[]> => {
    const cacheKey = `${BIRTHDAYS_CACHE_KEY_PREFIX}${month}`;
    
    // 1. Tenta buscar do cache primeiro
    const cachedBirthdays = await cacheService.get<Birthday[]>(cacheKey);
    if (cachedBirthdays) {
        return cachedBirthdays;
    }
    
    console.log(`[API] Cache para aniversariantes do mês ${month} não encontrado. Buscando dados novos...`);

    // 2. Se não há cache, busca no Supabase via RPC
    if (!supabase) {
        throw new Error('Cliente Supabase não inicializado. Verifique suas variáveis de ambiente.');
    }

    const { data, error } = await supabase.rpc('get_birthdays_by_month', {
        p_month: month,
    });

    if (error) {
        console.error('Erro ao buscar aniversariantes:', error);
        throw new Error(`Não foi possível carregar os aniversariantes: ${error.message}`);
    }

    const birthdaysData: Birthday[] = (data || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        birthDate: b.birthdate, // Garante que o nome da propriedade seja o esperado pelo tipo
    }));

    // 3. Salva os dados no cache
    await cacheService.set(cacheKey, birthdaysData, 60); // Cache por 60 minutos

    console.log(`Aniversariantes do mês ${month} carregados e cacheados com sucesso.`);
    return birthdaysData;
};

export const fetchMemberBasicInfo = async (): Promise<MemberBasicInfo> => {
  const { data, error } = await supabase
    .from('members')
    .select('id, name, role, active, uuid')
    .eq('active', true)
    .single();

  if (error) {
    console.error('Error fetching member basic info:', error);
    throw error;
  }

  return data;
};