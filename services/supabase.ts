
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

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

// Função para fazer login via Edge Function deployada
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

// Funções para acessar dados com RLS ativo
export const fetchUserEvents = async () => {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('data', { ascending: true });

  if (error) throw error;
  return data;
};

export const fetchUserNotices = async () => {
  const { data, error } = await supabase
    .from('avisos')
    .select('*')
    .eq('ativo', true)
    .order('data', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchUserDonations = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('doacoes')
    .select('*')
    .eq('membro_id', user.user_metadata?.member_id)
    .order('data', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('membros')
    .select(`
      *,
      profiles!inner(*)
    `)
    .eq('id', user.user_metadata?.member_id)
    .single();

  if (error) throw error;
  return data;
};
