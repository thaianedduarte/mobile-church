
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { fetchBirthdays } from '@/services/api';
import { Birthday } from '@/types';
import Header from '@/components/Header';
import { CakeSlice } from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BirthdaysScreen() {
  const { userToken } = useAuth();
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  const loadBirthdays = async () => {
    if (!userToken) return;
    
    try {
      setError(null);
      // selectedMonth vai de 0 a 11, mas a função do banco espera de 1 a 12
      const fetchedBirthdays = await fetchBirthdays(userToken, selectedMonth + 1);
      setBirthdays(fetchedBirthdays);
    } catch (err) {
      setError('Não foi possível carregar os aniversariantes. Tente novamente.');
      console.error('Birthdays error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // useEffect reage à mudança do mês e do token
  useEffect(() => {
    setLoading(true);
    loadBirthdays();
  }, [userToken, selectedMonth]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBirthdays();
  };

  const handleMonthChange = (monthIndex: number) => {
    if (monthIndex !== selectedMonth) {
      setSelectedMonth(monthIndex);
      // O useEffect vai disparar automaticamente e recarregar os dados
    }
  };

  const monthNames = Array.from({ length: 12 }, (_, i) => 
    format(new Date(2000, i, 1), 'MMM', { locale: ptBR })
  );

  const renderMonthItem = ({ item, index }: { item: string, index: number }) => (
    <TouchableOpacity
      style={[
        styles.monthItem,
        selectedMonth === index && styles.selectedMonthItem
      ]}
      onPress={() => handleMonthChange(index)}
    >
      <Text 
        style={[
          styles.monthText,
          selectedMonth === index && styles.selectedMonthText
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const formatBirthDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM", { locale: ptBR });
  };

  return (
    <View style={styles.container}>
      <Header title="Aniversariantes" />
      
      <View style={styles.monthsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={monthNames}
          renderItem={renderMonthItem}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.monthsList}
        />
      </View>

      {error ? (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBirthdays}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : loading && !refreshing ? (
        <View style={styles.messageContainer}>
          <Text style={styles.loadingText}>Carregando aniversariantes...</Text>
        </View>
      ) : birthdays.length === 0 ? (
        <View style={styles.messageContainer}>
          <CakeSlice size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>
            Não há aniversariantes em {format(new Date(2000, selectedMonth, 1), 'MMMM', { locale: ptBR })}
          </Text>
        </View>
      ) : (
        <FlatList
          data={birthdays}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.birthdayCard}>
              <View style={styles.birthdayIconContainer}>
                <CakeSlice size={24} color="#B45309" />
              </View>
              <View style={styles.birthdayInfo}>
                <Text style={styles.birthdayName}>{item.name}</Text>
                <Text style={styles.birthdayDate}>{formatBirthDate(item.birthDate)}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.monthTitle}>
                {format(new Date(2000, selectedMonth, 1), 'MMMM', { locale: ptBR })}
              </Text>
              <Text style={styles.resultsText}>
                {birthdays.length} {birthdays.length === 1 ? 'aniversariante' : 'aniversariantes'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  monthsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  monthsList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  monthItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  selectedMonthItem: {
    backgroundColor: '#FEF3C7',
  },
  monthText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  selectedMonthText: {
    color: '#B45309',
    fontFamily: 'Montserrat-SemiBold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  listHeader: {
    marginBottom: 16,
  },
  monthTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    color: '#1F2937',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  resultsText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
  birthdayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
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
  birthdayIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  birthdayInfo: {
    flex: 1,
  },
  birthdayName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  birthdayDate: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
});
