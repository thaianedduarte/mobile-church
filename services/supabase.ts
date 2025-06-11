
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
      storage: {
        getItem: async (key: string) => {
          return await secureStoreOrLocalStorage.getItem(key);
        },
        setItem: async (key: string, value: string) => {
          await secureStoreOrLocalStorage.setItem(key, value);
        },
        removeItem: async (key: string) => {
          await secureStoreOrLocalStorage.deleteItem(key);
        },
      },
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
    console.log('URL da Edge Function:', `${supabaseUrl}/functions/v1/edge-login`);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/edge-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ qrCode }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    let data;
    const responseText = await response.text();
    console.log('Response text:', responseText);

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta:', parseError);
      throw new Error('Resposta inválida do servidor');
    }

    if (!response.ok) {
      console.error('Erro na response:', data);
      throw new Error(data.error || `Erro HTTP ${response.status}`);
    }

    if (!data.valid) {
      console.error('QR Code inválido:', data);
      throw new Error(data.error || 'QR Code inválido');
    }

    console.log('Login bem-sucedido:', data);
    return data;
  } catch (error) {
    console.error('Erro no login:', error);
    throw new Error(error.message || 'Erro ao fazer login');
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
