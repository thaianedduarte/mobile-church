import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Church } from 'lucide-react-native';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If auth state is determined, redirect accordingly
    if (!isLoading) {
      // Short delay for smoother transition
      const timer = setTimeout(() => {
        router.replace(isAuthenticated ? '/initial' : '/access');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <Church size={80} color="#5B21B6" />
      <Text style={styles.title}>Igreja Digital</Text>
      <Text style={styles.subtitle}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  },
});