import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

interface MemberInfo {
  memberId: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  memberInfo: MemberInfo | null;
  login: (data: MemberInfo) => Promise<void>;
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
  login: async () => {},
  logout: async () => {},
});

// Storage keys
const MEMBER_INFO_KEY = 'church_app_member_info';

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

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);

  // Check if the user is already authenticated
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Check current Supabase session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Load member info from cache or user metadata
          const memberInfoString = await secureStoreOrLocalStorage.getItem(MEMBER_INFO_KEY);
          
          if (memberInfoString) {
            const info = JSON.parse(memberInfoString);
            setMemberInfo(info);
            setIsAuthenticated(true);
          } else if (session.user.user_metadata) {
            // Fallback to user metadata if cached info is missing
            const info: MemberInfo = {
              memberId: session.user.user_metadata.member_id || session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata.member_name || 'Usuário',
              role: session.user.user_metadata.member_role || 'Membro'
            };
            
            await secureStoreOrLocalStorage.setItem(MEMBER_INFO_KEY, JSON.stringify(info));
            setMemberInfo(info);
            setIsAuthenticated(true);
          }
        }
      } catch (e) {
        console.error('Failed to load authentication data', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in - update state if not already set
          if (!isAuthenticated) {
            const memberInfoString = await secureStoreOrLocalStorage.getItem(MEMBER_INFO_KEY);
            if (memberInfoString) {
              const info = JSON.parse(memberInfoString);
              setMemberInfo(info);
              setIsAuthenticated(true);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out - clear state
          setMemberInfo(null);
          setIsAuthenticated(false);
          await secureStoreOrLocalStorage.deleteItem(MEMBER_INFO_KEY);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isAuthenticated]);

  // Login function
  const login = async (data: MemberInfo & { user_id?: string; access_token?: string }) => {
    try {
      // Store member info
      await secureStoreOrLocalStorage.setItem(MEMBER_INFO_KEY, JSON.stringify(data));
      
      // If we have auth data, establish Supabase session
      if (data.user_id) {
        // For this implementation, we'll use the edge function response
        // to establish the session through the member data
        setMemberInfo(data);
        setIsAuthenticated(true);
      } else {
        setMemberInfo(data);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('Login failed', e);
      throw new Error('Login failed');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local storage
      await secureStoreOrLocalStorage.deleteItem(MEMBER_INFO_KEY);
      
      // Clear cache
      try {
        const { cacheService } = await import('../services/cache');
        await cacheService.clear();
      } catch (cacheError) {
        console.warn('Erro ao limpar cache no logout:', cacheError);
      }
      
      setMemberInfo(null);
      setIsAuthenticated(false);
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      memberInfo,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};