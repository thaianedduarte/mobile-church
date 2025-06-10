import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { fetchNotices } from '@/services/api';
import { Notice } from '@/types';
import Header from '@/components/Header';
import NoticeCard from '@/components/NoticeCard';
import { Bell } from 'lucide-react-native';

export default function NoticesScreen() {
  const { userToken } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'important' | 'regular'>('all');

  const loadNotices = async () => {
    if (!userToken) return;
    
    try {
      setError(null);
      const fetchedNotices = await fetchNotices(userToken);
      setNotices(fetchedNotices);
    } catch (err) {
      setError('Não foi possível carregar os avisos. Tente novamente.');
      console.error('Notices error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, [userToken]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotices();
  };

  const getFilteredNotices = () => {
    if (filter === 'all') {
      return notices;
    } else if (filter === 'important') {
      return notices.filter(notice => notice.priority === 'high');
    } else {
      return notices.filter(notice => notice.priority === 'normal');
    }
  };

  const filteredNotices = getFilteredNotices();

  return (
    <View style={styles.container}>
      <Header title="Avisos" />
      
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.activeFilterButton
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterText,
            filter === 'all' && styles.activeFilterText
          ]}>Todos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'important' && styles.activeFilterButton
          ]}
          onPress={() => setFilter('important')}
        >
          <Text style={[
            styles.filterText,
            filter === 'important' && styles.activeFilterText
          ]}>Importantes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'regular' && styles.activeFilterButton
          ]}
          onPress={() => setFilter('regular')}
        >
          <Text style={[
            styles.filterText,
            filter === 'regular' && styles.activeFilterText
          ]}>Regulares</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadNotices}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : loading && !refreshing ? (
        <View style={styles.messageContainer}>
          <Text style={styles.loadingText}>Carregando avisos...</Text>
        </View>
      ) : filteredNotices.length === 0 ? (
        <View style={styles.messageContainer}>
          <Bell size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>
            {filter === 'important' 
              ? 'Não há avisos importantes para exibir' 
              : filter === 'regular' 
                ? 'Não há avisos regulares para exibir'
                : 'Não há avisos para exibir'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <NoticeCard notice={item} expanded />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.resultsText}>
                {filteredNotices.length} {filteredNotices.length === 1 ? 'aviso encontrado' : 'avisos encontrados'}
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
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#EDE9FE',
  },
  filterText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#5B21B6',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  listHeader: {
    marginBottom: 16,
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
});