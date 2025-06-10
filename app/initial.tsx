import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, Church } from 'lucide-react-native';

export default function InitialScreen() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const handleEnterApp = () => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Church size={72} color="#5B21B6" />
        
        <Text style={styles.title}>Bem-vindo à Igreja Digital</Text>
        <Text style={styles.subtitle}>
          Tenha acesso aos eventos, avisos e sua carteirinha digital
        </Text>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Seu acesso está confirmado</Text>
            <Text style={styles.cardDescription}>
              Toque no botão abaixo para acessar todas as funcionalidades
            </Text>
            
            <TouchableOpacity
              style={styles.button}
              onPress={handleEnterApp}
            >
              <LogIn size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Entrar no App</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
        >
          <Text style={styles.logoutText}>Usar outra chave de acesso</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Igreja Digital • v1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 28,
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 32,
  },
  subtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 48,
  },
  cardContainer: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#5B21B6',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
  },
  buttonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  logoutButton: {
    marginTop: 24,
    padding: 8,
  },
  logoutText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#5B21B6',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
});