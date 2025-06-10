import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Notice } from '@/types';
import { Bell, CircleAlert as AlertCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NoticeCardProps {
  notice: Notice;
  expanded?: boolean;
}

export default function NoticeCard({ notice, expanded = false }: NoticeCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const noticeDate = new Date(notice.date);
  
  const formatDate = (date: Date) => {
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };
  
  const getRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, { 
      locale: ptBR,
      addSuffix: true 
    });
  };

  const isPriorityHigh = notice.priority === 'alta';

  return (
    <View style={[
      styles.card,
      !notice.active && styles.inactiveCard,
      isPriorityHigh && styles.priorityCard
    ]}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.priorityContainer}>
          {isPriorityHigh ? (
            <AlertCircle size={16} color="#DC2626" />
          ) : (
            <Bell size={16} color="#6B7280" />
          )}
          <Text style={[
            styles.priorityText,
            isPriorityHigh && styles.highPriorityText
          ]}>
            {notice.priority === 'alta' ? 'Alta Prioridade' : 
             notice.priority === 'média' ? 'Média Prioridade' : 
             'Baixa Prioridade'}
          </Text>
          {!notice.active && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>Inativo</Text>
            </View>
          )}
        </View>
        
        <Text style={[
          styles.title,
          !notice.active && styles.inactiveText
        ]}>{notice.title}</Text>
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {getRelativeTime(noticeDate)}
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
          <Text style={styles.content}>
            {notice.content}
          </Text>
          
          <View style={styles.footer}>
            <Text style={styles.authorText}>
              Por {notice.author}
            </Text>
            <Text style={styles.fullDate}>
              {formatDate(noticeDate)}
            </Text>
          </View>
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
  inactiveCard: {
    opacity: 0.7,
    backgroundColor: '#F9FAFB',
  },
  priorityCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  header: {
    padding: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  highPriorityText: {
    color: '#DC2626',
  },
  inactiveBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  inactiveBadgeText: {
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
  inactiveText: {
    color: '#6B7280',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#6B7280',
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
  content: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  fullDate: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
});