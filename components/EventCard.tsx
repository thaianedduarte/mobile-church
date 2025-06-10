import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Event } from '@/types';
import { Calendar, MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react-native';
import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
  expanded?: boolean;
}

export default function EventCard({ event, expanded = false }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const eventDate = new Date(event.date);
  const isPastEvent = isPast(eventDate);
  
  const formatDate = (date: Date) => {
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <View style={[
      styles.card,
      isPastEvent && styles.pastEventCard
    ]}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.typeContainer}>
          <Text style={[
            styles.typeText,
            isPastEvent && styles.pastEventText
          ]}>
            {event.type}
          </Text>
          {isPastEvent && (
            <View style={styles.pastBadge}>
              <Text style={styles.pastBadgeText}>Passado</Text>
            </View>
          )}
        </View>
        
        <Text style={[
          styles.title,
          isPastEvent && styles.pastEventText
        ]}>
          {event.title}
        </Text>
        
        <View style={styles.dateContainer}>
          <Calendar size={16} color={isPastEvent ? '#9CA3AF' : '#5B21B6'} />
          <Text style={[
            styles.dateText,
            isPastEvent && styles.pastEventText
          ]}>
            {formatDate(eventDate)}
          </Text>
        </View>
        
        <View style={styles.expandButton}>
          {isExpanded ? (
            <ChevronUp size={20} color="#6B7280" />
          ) : (
            <ChevronDown size={20} color="#6B7280" />
          )}
        </View>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.details}>
          {event.location && (
            <View style={styles.detailItem}>
              <MapPin size={16} color={isPastEvent ? '#9CA3AF' : '#5B21B6'} />
              <Text style={[
                styles.detailText,
                isPastEvent && styles.pastEventText
              ]}>
                {event.location}
              </Text>
            </View>
          )}
          
          {event.time && (
            <View style={styles.detailItem}>
              <Clock size={16} color={isPastEvent ? '#9CA3AF' : '#5B21B6'} />
              <Text style={[
                styles.detailText,
                isPastEvent && styles.pastEventText
              ]}>
                {event.time}
              </Text>
            </View>
          )}
          
          {event.description && (
            <Text style={[
              styles.description,
              isPastEvent && styles.pastEventText
            ]}>
              {event.description}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
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
  pastEventCard: {
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#5B21B6',
    textTransform: 'uppercase',
    marginRight: 8,
  },
  pastEventText: {
    color: '#9CA3AF',
  },
  pastBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pastBadgeText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 10,
    color: '#6B7280',
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  expandButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  details: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  description: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#4B5563',
    marginTop: 8,
    lineHeight: 22,
  },
});