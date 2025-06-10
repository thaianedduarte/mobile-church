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
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);

  // Check if the user is already authenticated
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Load cached member info
        const memberInfoString = await secureStoreOrLocalStorage.getItem(MEMBER_INFO_KEY);
        
        if (memberInfoString) {
          const info = JSON.parse(memberInfoString);
          setMemberInfo(info);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error('Failed to load authentication data', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Login function
  const login = async (data: MemberInfo) => {
    try {
      // Store member info
      await secureStoreOrLocalStorage.setItem(MEMBER_INFO_KEY, JSON.stringify(data));
      setMemberInfo(data);
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Login failed', e);
      throw new Error('Login failed');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await secureStoreOrLocalStorage.deleteItem(MEMBER_INFO_KEY);
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