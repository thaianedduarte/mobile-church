import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { fetchDashboardData } from '@/services/api';
import { DashboardData } from '@/types';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import NoticeCard from '@/components/NoticeCard';
import StatisticsCard from '@/components/StatisticsCard';
import { Church, Calendar, Bell, Receipt, CakeSlice, QrCode, User } from 'lucide-react-native';

export default function HomeScreen() {
  const { userToken } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    if (!userToken) return;
    
    try {
      setError(null);
      const data = await fetchDashboardData(userToken);
      setDashboardData(data);
    } catch (err) {
      setError('Não foi possível carregar os dados. Tente novamente.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [userToken]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const navigateTo = (screen: string) => {
    router.push(screen);
  };

  return (
    <View style={styles.container}>
      <Header title="Igreja Digital" showLogo />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadDashboard}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : loading && !dashboardData ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando informações...</Text>
          </View>
        ) : (
          <>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>
                Olá, {dashboardData?.memberName || 'Membro'}
              </Text>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>

            <View style={styles.quickAccessContainer}>
              <Text style={styles.sectionTitle}>Acesso Rápido</Text>
              <View style={styles.quickAccessGrid}>
                <TouchableOpacity 
                  style={styles.quickAccessItem}
                  onPress={() => navigateTo('/profile')}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#EDE9FE' }]}>
                    <User size={24} color="#5B21B6" />
                  </View>
                  <Text style={styles.quickAccessText}>Meus Dados</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickAccessItem}
                  onPress={() => navigateTo('/profile/card')}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
                    <QrCode size={24} color="#0284C7" />
                  </View>
                  <Text style={styles.quickAccessText}>Carteirinha</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickAccessItem}
                  onPress={() => navigateTo('/events')}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                    <Calendar size={24} color="#B45309" />
                  </View>
                  <Text style={styles.quickAccessText}>Eventos</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickAccessItem}
                  onPress={() => navigateTo('/finance')}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
                    <Receipt size={24} color="#16A34A" />
                  </View>
                  <Text style={styles.quickAccessText}>Finanças</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Upcoming Events */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Próximos Eventos</Text>
                <TouchableOpacity onPress={() => navigateTo('/events')}>
                  <Text style={styles.seeAllText}>Ver todos</Text>
                </TouchableOpacity>
              </View>

              {dashboardData?.upcomingEvents && dashboardData.upcomingEvents.length > 0 ? (
                dashboardData.upcomingEvents.slice(0, 2).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <Text style={styles.emptyText}>Não há eventos programados</Text>
              )}
            </View>

            {/* Recent Notices */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Avisos Recentes</Text>
                <TouchableOpacity onPress={() => navigateTo('/notices')}>
                  <Text style={styles.seeAllText}>Ver todos</Text>
                </TouchableOpacity>
              </View>

              {dashboardData?.recentNotices && dashboardData.recentNotices.length > 0 ? (
                dashboardData.recentNotices.slice(0, 2).map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))
              ) : (
                <Text style={styles.emptyText}>Não há avisos recentes</Text>
              )}
            </View>

            {/* Financial Summary */}
            {dashboardData?.financialSummary && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Resumo Financeiro</Text>
                  <TouchableOpacity onPress={() => navigateTo('/finance')}>
                    <Text style={styles.seeAllText}>Ver detalhes</Text>
                  </TouchableOpacity>
                </View>
                <StatisticsCard 
                  title="Contribuições deste mês"
                  value={dashboardData.financialSummary.currentMonthAmount} 
                  previousValue={dashboardData.financialSummary.previousMonthAmount}
                  type="currency"
                />
              </View>
            )}

            {/* Birthdays */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Aniversariantes do Mês</Text>
                <TouchableOpacity onPress={() => navigateTo('/birthdays')}>
                  <Text style={styles.seeAllText}>Ver todos</Text>
                </TouchableOpacity>
              </View>

              {dashboardData?.birthdaysThisMonth && dashboardData.birthdaysThisMonth.length > 0 ? (
                <View style={styles.birthdayList}>
                  {dashboardData.birthdaysThisMonth.slice(0, 3).map((person) => (
                    <View key={person.id} style={styles.birthdayItem}>
                      <CakeSlice size={20} color="#B45309" />
                      <Text style={styles.birthdayName}>{person.name}</Text>
                      <Text style={styles.birthdayDate}>{person.birthDate}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>Não há aniversariantes este mês</Text>
              )}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    marginVertical: 16,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Montserrat-Medium',
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 8,
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
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Montserrat-Medium',
    color: '#6B7280',
  },
  welcomeContainer: {
    marginBottom: 24,
  },
  welcomeText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    color: '#1F2937',
  },
  dateText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  quickAccessContainer: {
    marginBottom: 24,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginHorizontal: -8,
  },
  quickAccessItem: {
    width: '25%',
    alignItems: 'center',
    padding: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAccessText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: '#1F2937',
  },
  seeAllText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#5B21B6',
  },
  emptyText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  birthdayList: {
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
  birthdayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  birthdayName: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#374151',
    flex: 1,
    marginLeft: 12,
  },
  birthdayDate: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
});