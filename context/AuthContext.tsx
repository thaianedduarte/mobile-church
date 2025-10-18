import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createClient, Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import { router } from 'expo-router';

interface MemberInfo {
  memberId: string;
  email: string;
  name: string;
  role: string;
}

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Create context with default values
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se há uma sessão salva
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('[AuthProvider] Sessão atual:', currentSession ? 'Existe' : 'Nula');
        setSession(currentSession);
      } catch (error) {
        console.error('[AuthProvider] Erro ao verificar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Monitora mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthProvider] Estado de autenticação alterado. Sessão:', session ? 'Existe' : 'Nula');
      setSession(session);
      setLoading(false);

      // Se não houver sessão, redireciona para a tela de acesso
      if (!session) {
        router.replace('/access');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      console.log('[AuthProvider] Iniciando logout');
      await supabase.auth.signOut();
      router.replace('/access');
    } catch (error) {
      console.error('[AuthProvider] Erro ao fazer logout:', error);
    }
  };

  const value = {
    session,
    loading,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};