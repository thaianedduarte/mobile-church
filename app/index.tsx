import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { fetchBirthdays } from '@/services/api';

export default function Index() {
  const { session, loading } = useAuth();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Carrega os aniversariantes do mês atual em background
        fetchBirthdays(new Date().getMonth() + 1).catch(console.error);

        // Pequeno delay para garantir que a UI esteja pronta
        await new Promise(resolve => setTimeout(resolve, 500));

        // Redireciona baseado no estado de autenticação
        if (session) {
          router.replace('/(tabs)');
        } else {
          router.replace('/access');
        }
      } catch (error) {
        console.error('[Index] Erro ao inicializar app:', error);
        router.replace('/access');
      }
    };

    if (!loading) {
      initializeApp();
    }
  }, [session, loading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
      <ActivityIndicator size="large" color="#5B21B6" />
    </View>
  );
}