import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { fetchDonations, fetchChurchFinances } from '@/services/api';
import { DonationMonth, ChurchFinances } from '@/types';
import Header from '@/components/Header';
import { Receipt, TrendingUp, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';

export default function FinanceScreen() {
  const { userToken } = useAuth();
  const [donations, setDonations] = useState<DonationMonth[]>([]);
  const [churchFinances, setChurchFinances] = useState<ChurchFinances | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'personal' | 'church'>('personal');

  const loadData = async () => {
    if (!userToken) return;
    
    try {
      setError(null);
      const [donationsData, financesData] = await Promise.all([
        fetchDonations(userToken),
        fetchChurchFinances(userToken)
      ]);
      setDonations(donationsData);
      setChurchFinances(financesData);
      
      // Auto-expand current month
      const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      setExpandedMonths([currentMonth]);
    } catch (err) {
      setError('Não foi possível carregar as informações financeiras. Tente novamente.');
      console.error('Finance error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userToken]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => 
      prev.includes(monthKey)
        ? prev.filter(m => m !== monthKey)
        : [...prev, monthKey]
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateTotal = () => {
    return donations.reduce((total, month) => total + month.total, 0);
  };

  const calculateYearlyTotal = () => {
    const currentYear = new Date().getFullYear();
    return donations
      .filter(month => month.date.includes(currentYear.toString()))
      .reduce((total, month) => total + month.total, 0);
  };

  return (
    <View style={styles.container}>
      <Header title="Finanças" />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
          onPress={() => setActiveTab('personal')}
        >
          <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>
            Minhas Contribuições
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'church' && styles.activeTab]}
          onPress={() => setActiveTab('church')}
        >
          <Text style={[styles.tabText, activeTab === 'church' && styles.activeTabText]}>
            Balanço da Igreja
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <View style={styles.messageContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : loading && !refreshing ? (
          <View style={styles.messageContainer}>
            <Text style={styles.loadingText}>Carregando informações financeiras...</Text>
          </View>
        ) : activeTab === 'personal' ? (
          <>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Total Anual</Text>
                <Text style={styles.summaryValue}>{formatCurrency(calculateYearlyTotal())}</Text>
                <Text style={styles.summaryCaption}>Contribuições em {new Date().getFullYear()}</Text>
              </View>
              
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Total Histórico</Text>
                <Text style={styles.summaryValue}>{formatCurrency(calculateTotal())}</Text>
                <Text style={styles.summaryCaption}>Todas as contribuições</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Histórico de Contribuições</Text>
            
            {donations.map((month) => (
              <View key={month.date} style={styles.monthCard}>
                <TouchableOpacity 
                  style={styles.monthHeader}
                  onPress={() => toggleMonth(month.date)}
                >
                  <View style={styles.monthTitleContainer}>
                    <Text style={styles.monthTitle}>{month.date}</Text>
                    <Text style={styles.monthTotal}>{formatCurrency(month.total)}</Text>
                  </View>
                  {expandedMonths.includes(month.date) ? (
                    <ChevronUp size={20} color="#6B7280" />
                  ) : (
                    <ChevronDown size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
                
                {expandedMonths.includes(month.date) && (
                  <View style={styles.donationsList}>
                    {month.donations.map((donation, index) => (
                      <View 
                        key={index} 
                        style={[
                          styles.donationItem,
                          index !== month.donations.length - 1 && styles.donationItemBorder
                        ]}
                      >
                        <Text style={styles.donationType}>{donation.type}</Text>
                        <Text style={styles.donationValue}>{formatCurrency(donation.amount)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </>
        ) : (
          <>
            {churchFinances && (
              <>
                <View style={styles.churchSummaryContainer}>
                  <View style={[styles.churchCard, styles.incomeCard]}>
                    <View style={styles.churchCardHeader}>
                      <Text style={styles.churchCardTitle}>Entradas</Text>
                      <ArrowUpRight size={24} color="#16A34A" />
                    </View>
                    <Text style={[styles.churchCardValue, styles.incomeValue]}>
                      {formatCurrency(churchFinances.currentMonth.income)}
                    </Text>
                    <Text style={styles.churchCardCaption}>Este mês</Text>
                  </View>

                  <View style={[styles.churchCard, styles.expenseCard]}>
                    <View style={styles.churchCardHeader}>
                      <Text style={styles.churchCardTitle}>Saídas</Text>
                      <ArrowDownRight size={24} color="#DC2626" />
                    </View>
                    <Text style={[styles.churchCardValue, styles.expenseValue]}>
                      {formatCurrency(churchFinances.currentMonth.expenses)}
                    </Text>
                    <Text style={styles.churchCardCaption}>Este mês</Text>
                  </View>
                </View>

                <View style={styles.balanceCard}>
                  <Text style={styles.balanceTitle}>Saldo Atual</Text>
                  <Text style={[
                    styles.balanceValue,
                    churchFinances.balance >= 0 ? styles.positiveBalance : styles.negativeBalance
                  ]}>
                    {formatCurrency(churchFinances.balance)}
                  </Text>
                </View>

                <View style={styles.categoriesContainer}>
                  <Text style={styles.categoriesTitle}>Despesas por Categoria</Text>
                  {churchFinances.expenseCategories.map((category, index) => (
                    <View key={index} style={styles.categoryItem}>
                      <View style={styles.categoryHeader}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.categoryValue}>
                          {formatCurrency(category.amount)}
                        </Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <View 
                          style={[
                            styles.progressBar,
                            { width: `${(category.amount / churchFinances.currentMonth.expenses) * 100}%` }
                          ]} 
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#EDE9FE',
  },
  tabText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#5B21B6',
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  summaryTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  summaryValue: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    color: '#1F2937',
    marginBottom: 4,
  },
  summaryCaption: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  sectionTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 16,
  },
  monthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  monthTitleContainer: {
    flex: 1,
  },
  monthTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#374151',
    textTransform: 'capitalize',
  },
  monthTotal: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#5B21B6',
    marginTop: 4,
  },
  donationsList: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  donationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  donationItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  donationType: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#4B5563',
  },
  donationValue: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#1F2937',
  },
  churchSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  churchCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  churchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  churchCardTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#374151',
  },
  churchCardValue: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    marginBottom: 4,
  },
  incomeValue: {
    color: '#16A34A',
  },
  expenseValue: {
    color: '#DC2626',
  },
  churchCardCaption: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  balanceTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: '#374151',
    marginBottom: 8,
  },
  balanceValue: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 32,
  },
  positiveBalance: {
    color: '#16A34A',
  },
  negativeBalance: {
    color: '#DC2626',
  },
  categoriesContainer: {
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
  categoriesTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#4B5563',
  },
  categoryValue: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#1F2937',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5B21B6',
    borderRadius: 4,
  },
});