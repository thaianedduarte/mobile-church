import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { supabase } from '@/services/supabase';

interface MemberInfo {
  memberId: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  memberSince?: string;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  memberInfo: MemberInfo | null;
  userToken: string | null;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

// Create context with default values
export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isLoading: true,
  memberInfo: null,
  userToken: null,
  login: async () => {},
  logout: async () => {},
});

// Storage keys
const MEMBER_INFO_KEY = 'church_app_member_info';
const USER_TOKEN_KEY = 'church_app_user_token';
const SESSION_KEY = 'church_app_session';

// For web platform, use localStorage as fallback
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  // Check if the user is already authenticated
  useEffect(() => {
    let isMounted = true;

    const bootstrapAsync = async () => {
      try {
        console.log('🔄 Verificando sessão existente...');

        // 1. Primeiro, verifica se há uma sessão do Supabase ativa
        if (supabase) {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session?.user && !error) {
            console.log('✅ Sessão do Supabase encontrada:', session.user.email);
            
            // Carrega informações do membro do cache
            const [memberInfoString, tokenString] = await Promise.all([
              secureStoreOrLocalStorage.getItem(MEMBER_INFO_KEY),
              secureStoreOrLocalStorage.getItem(USER_TOKEN_KEY)
            ]);
            
            if (memberInfoString && tokenString && isMounted) {
              const info = JSON.parse(memberInfoString);
              setMemberInfo(info);
              setUserToken(tokenString);
              setIsAuthenticated(true);
              console.log('✅ Dados do membro carregados do cache');
            } else if (session.user.user_metadata && isMounted) {
              // Fallback para metadados do usuário se o cache estiver vazio
              const info: MemberInfo = {
                memberId: session.user.user_metadata.member_id || session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata.member_name || 'Usuário',
                role: session.user.user_metadata.member_role || 'Membro',
                status: session.user.user_metadata.member_status || 'active',
                memberSince: session.user.user_metadata.member_since
              };
              
              const token = session.access_token;
              
              // Salva no cache para próximas sessões
              await Promise.all([
                secureStoreOrLocalStorage.setItem(MEMBER_INFO_KEY, JSON.stringify(info)),
                secureStoreOrLocalStorage.setItem(USER_TOKEN_KEY, token),
                secureStoreOrLocalStorage.setItem(SESSION_KEY, JSON.stringify({
                  timestamp: Date.now(),
                  userId: session.user.id
                }))
              ]);
              
              setMemberInfo(info);
              setUserToken(token);
              setIsAuthenticated(true);
              console.log('✅ Sessão restaurada dos metadados do usuário');
            }
          } else {
            console.log('❌ Nenhuma sessão ativa do Supabase encontrada');
          }
        }

        // 2. Se não há sessão do Supabase, verifica cache local
        if (!isAuthenticated) {
          const [memberInfoString, tokenString, sessionString] = await Promise.all([
            secureStoreOrLocalStorage.getItem(MEMBER_INFO_KEY),
            secureStoreOrLocalStorage.getItem(USER_TOKEN_KEY),
            secureStoreOrLocalStorage.getItem(SESSION_KEY)
          ]);

          if (memberInfoString && tokenString && sessionString && isMounted) {
            const sessionData = JSON.parse(sessionString);
            const now = Date.now();
            const sessionAge = now - sessionData.timestamp;
            const maxSessionAge = 30 * 24 * 60 * 60 * 1000; // 30 dias

            // Verifica se a sessão não expirou
            if (sessionAge < maxSessionAge) {
              const info = JSON.parse(memberInfoString);
              setMemberInfo(info);
              setUserToken(tokenString);
              setIsAuthenticated(true);
              console.log('✅ Sessão local válida encontrada');
            } else {
              console.log('⏰ Sessão local expirada, limpando dados');
              await clearStoredData();
            }
          }
        }

      } catch (e) {
        console.error('❌ Erro ao carregar dados de autenticação:', e);
        await clearStoredData();
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log('✅ Verificação de autenticação concluída');
        }
      }
    };

    bootstrapAsync();

    // Listen for auth state changes only if supabase is initialized
    let subscription: any = null;
    if (supabase) {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
          if (!isMounted) return;

          console.log('🔄 Mudança de estado de autenticação:', event);

          if (event === 'SIGNED_IN' && session?.user) {
            // Usuário fez login - atualiza estado se necessário
            if (!isAuthenticated) {
              const memberInfoString = await secureStoreOrLocalStorage.getItem(MEMBER_INFO_KEY);
              if (memberInfoString) {
                const info = JSON.parse(memberInfoString);
                setMemberInfo(info);
                setUserToken(session.access_token);
                setIsAuthenticated(true);
                console.log('✅ Estado atualizado após login do Supabase');
              }
            }
          } else if (event === 'SIGNED_OUT') {
            // Usuário fez logout - limpa estado
            console.log('🚪 Usuário fez logout');
            await clearStoredData();
            setMemberInfo(null);
            setUserToken(null);
            setIsAuthenticated(false);
          } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
            // Token foi renovado - atualiza token armazenado
            setUserToken(session.access_token);
            await secureStoreOrLocalStorage.setItem(USER_TOKEN_KEY, session.access_token);
            console.log('🔄 Token renovado automaticamente');
          }
          
          setIsLoading(false);
        }
      );
      subscription = authSubscription;
    }

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Helper function to clear stored data
  const clearStoredData = async () => {
    try {
      await Promise.all([
        secureStoreOrLocalStorage.deleteItem(MEMBER_INFO_KEY),
        secureStoreOrLocalStorage.deleteItem(USER_TOKEN_KEY),
        secureStoreOrLocalStorage.deleteItem(SESSION_KEY)
      ]);
    } catch (error) {
      console.error('Erro ao limpar dados armazenados:', error);
    }
  };

  // Login function
  const login = async (data: any) => {
    try {
      console.log('🔐 Iniciando processo de login...');

      // Extrai informações do retorno da edge function
      const memberInfo: MemberInfo = {
        memberId: data.memberId || data.user_id || '',
        email: data.email || '',
        name: data.name || 'Usuário',
        role: data.role || 'Membro',
        status: data.status || 'active',
        memberSince: data.memberSince
      };

      const token = data.access_token || data.userToken || '';

      // Salva dados no storage seguro
      await Promise.all([
        secureStoreOrLocalStorage.setItem(MEMBER_INFO_KEY, JSON.stringify(memberInfo)),
        secureStoreOrLocalStorage.setItem(USER_TOKEN_KEY, token),
        secureStoreOrLocalStorage.setItem(SESSION_KEY, JSON.stringify({
          timestamp: Date.now(),
          userId: memberInfo.memberId
        }))
      ]);

      // Atualiza estado
      setMemberInfo(memberInfo);
      setUserToken(token);
      setIsAuthenticated(true);

      console.log('✅ Login realizado com sucesso para:', memberInfo.name);
    } catch (e) {
      console.error('❌ Erro no login:', e);
      throw new Error('Falha ao realizar login');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('🚪 Iniciando logout...');

      // Sign out from Supabase if client is available
      if (supabase) {
        await supabase.auth.signOut();
      }
      
      // Clear local storage
      await clearStoredData();
      
      // Clear cache
      try {
        const { cacheService } = await import('../services/cache');
        await cacheService.clear();
      } catch (cacheError) {
        console.warn('⚠️ Erro ao limpar cache no logout:', cacheError);
      }
      
      setMemberInfo(null);
      setUserToken(null);
      setIsAuthenticated(false);

      console.log('✅ Logout realizado com sucesso');
    } catch (e) {
      console.error('❌ Erro no logout:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      memberInfo,
      userToken,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};