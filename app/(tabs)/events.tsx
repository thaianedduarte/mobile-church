import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { fetchEvents } from '@/services/api';
import { Event } from '@/types';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import { Calendar, Filter } from 'lucide-react-native';

export default function EventsScreen() {
  const { userToken } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  const loadEvents = async () => {
    if (!userToken) return;
    
    try {
      setError(null);
      const fetchedEvents = await fetchEvents(userToken, filter);
      setEvents(fetchedEvents);
    } catch (err) {
      setError('Não foi possível carregar os eventos. Tente novamente.');
      console.error('Events error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [userToken, filter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  // Server-side filtering is now handled in the API call
  const filteredEvents = events;

  return (
    <View style={styles.container}>
      <Header title="Eventos" />
      
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'upcoming' && styles.activeFilterButton
          ]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[
            styles.filterText,
            filter === 'upcoming' && styles.activeFilterText
          ]}>Próximos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'past' && styles.activeFilterButton
          ]}
          onPress={() => setFilter('past')}
        >
          <Text style={[
            styles.filterText,
            filter === 'past' && styles.activeFilterText
          ]}>Anteriores</Text>
        </TouchableOpacity>
        
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
      </View>

      {error ? (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadEvents}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : loading && !refreshing ? (
        <View style={styles.messageContainer}>
          <Text style={styles.loadingText}>Carregando eventos...</Text>
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={styles.messageContainer}>
          <Calendar size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>
            {filter === 'upcoming' 
              ? 'Não há eventos futuros programados' 
              : filter === 'past' 
                ? 'Não há eventos anteriores para exibir'
                : 'Não há eventos para exibir'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <EventCard event={item} expanded />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.resultsText}>
                {filteredEvents.length} {filteredEvents.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
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