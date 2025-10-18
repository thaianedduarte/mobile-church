import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { Church } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { getRedirectUrl } from '@/config/auth';

export default function AccessScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      console.log('[AccessScreen] Iniciando login com QR Code');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('[AccessScreen] Erro no login:', error);
        Alert.alert('Erro', 'Não foi possível fazer login. Tente novamente.');
        return;
      }

      console.log('[AccessScreen] Login iniciado com sucesso');
    } catch (error) {
      console.error('[AccessScreen] Erro ao iniciar login:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar fazer login.');
    } finally {
      setLoading(false);
    }
  };

  // Se já estiver autenticado, redireciona para a tela inicial
  if (session) {
    router.replace('/(tabs)');
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Church size={80} color="#5B21B6" />
        <Text style={styles.title}>Igreja Digital</Text>
        <Text style={styles.subtitle}>
          Faça login para acessar o aplicativo
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Entrando...' : 'Entrar no Aplicativo'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 28,
    marginTop: 24,
    color: '#1F2937',
  },
  subtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 18,
    marginTop: 8,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#5B21B6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    fontSize: 16,
  },
});