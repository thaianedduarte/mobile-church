import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/services/supabase';

export default function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('[AuthCallback] Processando callback de autenticação');
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthCallback] Erro ao obter sessão:', error);
          router.replace('/access');
          return;
        }

        if (data.session) {
          console.log('[AuthCallback] Sessão criada com sucesso');
          router.replace('/(tabs)');
        } else {
          console.log('[AuthCallback] Nenhuma sessão encontrada');
          router.replace('/access');
        }
      } catch (error) {
        console.error('[AuthCallback] Erro no callback:', error);
        router.replace('/access');
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
      <ActivityIndicator size="large" color="#5B21B6" />
    </View>
  );
} 