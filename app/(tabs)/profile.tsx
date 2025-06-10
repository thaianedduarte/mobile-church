import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { fetchMemberProfile } from '@/services/api';
import { MemberProfile } from '@/types';
import Header from '@/components/Header';
import { User, QrCode, LogOut, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { userToken, logout } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    if (!userToken) return;
    
    try {
      setError(null);
      const fetchedProfile = await fetchMemberProfile(userToken);
      setProfile(fetchedProfile);
    } catch (err) {
      setError('Não foi possível carregar seu perfil. Tente novamente.');
      console.error('Profile error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userToken]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/access');
  };

  const navigateToDigitalCard = () => {
    router.push('/profile/card');
  };

  return (
    <View style={styles.container}>
      <Header title="Meu Perfil" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <View style={styles.messageContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : loading && !refreshing ? (
          <View style={styles.messageContainer}>
            <Text style={styles.loadingText}>Carregando informações do perfil...</Text>
          </View>
        ) : !profile ? (
          <View style={styles.messageContainer}>
            <User size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>
              Não foi possível encontrar informações do seu perfil
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {profile.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </Text>
              </View>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileRole}>{profile.role}</Text>
              <View style={[
                styles.statusBadge,
                profile.status === 'active' ? styles.activeStatus : styles.inactiveStatus
              ]}>
                <Text style={[
                  styles.statusText,
                  profile.status === 'active' ? styles.activeStatusText : styles.inactiveStatusText
                ]}>
                  {profile.status === 'active' ? 'Ativo' : 'Inativo'}
                </Text>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
              
              <View style={styles.infoCard}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Nome Completo</Text>
                  <Text style={styles.infoValue}>{profile.name}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>CPF</Text>
                  <Text style={styles.infoValue}>{profile.cpf}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Data de Nascimento</Text>
                  <Text style={styles.infoValue}>{profile.birthDate}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Função na Igreja</Text>
                  <Text style={styles.infoValue}>{profile.role}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Membro desde</Text>
                  <Text style={styles.infoValue}>{profile.memberSince}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Acesso</Text>
              
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={navigateToDigitalCard}
              >
                <View style={styles.actionContent}>
                  <View style={styles.actionIconContainer}>
                    <QrCode size={24} color="#1E40AF" />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>Carteirinha Digital</Text>
                    <Text style={styles.actionDescription}>Visualize e compartilhe seu QR Code</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionCard, styles.logoutCard]}
                onPress={handleLogout}
              >
                <View style={styles.actionContent}>
                  <View style={[styles.actionIconContainer, styles.logoutIconContainer]}>
                    <LogOut size={24} color="#B91C1C" />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={[styles.actionTitle, styles.logoutTitle]}>Sair do Aplicativo</Text>
                    <Text style={styles.actionDescription}>Encerrar sessão atual</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 300,
  },
  loadingText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  errorText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    fontFamily: 'Montserrat-Medium',
    color: '#FFFFFF',
  },
  emptyText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#5B21B6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 36,
    color: '#FFFFFF',
  },
  profileName: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileRole: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 4,
  },
  activeStatus: {
    backgroundColor: '#DCFCE7',
  },
  inactiveStatus: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
  },
  activeStatusText: {
    color: '#16A34A',
  },
  inactiveStatusText: {
    color: '#DC2626',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#1F2937',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  logoutCard: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FFFFFF',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutIconContainer: {
    backgroundColor: '#FEE2E2',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  logoutTitle: {
    color: '#B91C1C',
  },
  actionDescription: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
});