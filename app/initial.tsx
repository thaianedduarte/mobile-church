import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, Church, User } from 'lucide-react-native';

export default function InitialScreen() {
  const router = useRouter();
  const { isAuthenticated, logout, memberInfo } = useAuth();

  const handleEnterApp = () => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/access');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Church size={72} color="#5B21B6" />
        
        <Text style={styles.title}>Bem-vindo à Igreja Digital</Text>
        <Text style={styles.subtitle}>
          Tenha acesso aos eventos, avisos e sua carteirinha digital
        </Text>

        {memberInfo && (
          <View style={styles.memberInfoCard}>
            <View style={styles.memberHeader}>
              <View style={styles.avatarContainer}>
                <User size={24} color="#FFFFFF" />
              </View>
              <View style={styles.memberDetails}>
                <Text style={styles.memberName}>{memberInfo.name}</Text>
                <Text style={styles.memberRole}>{memberInfo.role}</Text>
                <View style={[
                  styles.statusBadge,
                  memberInfo.status === 'active' ? styles.activeStatus : styles.inactiveStatus
                ]}>
                  <Text style={[
                    styles.statusText,
                    memberInfo.status === 'active' ? styles.activeStatusText : styles.inactiveStatusText
                  ]}>
                    {memberInfo.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

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
          onPress={handleLogout}
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
    marginBottom: 32,
  },
  memberInfoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5B21B6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  memberRole: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  activeStatus: {
    backgroundColor: '#DCFCE7',
  },
  inactiveStatus: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 10,
  },
  activeStatusText: {
    color: '#16A34A',
  },
  inactiveStatusText: {
    color: '#DC2626',
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