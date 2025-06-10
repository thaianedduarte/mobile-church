import { StyleSheet, Text, View } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

interface StatisticsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  type?: 'currency' | 'number' | 'percent';
  status?: 'positive' | 'negative' | 'neutral';
}

export default function StatisticsCard({ 
  title, 
  value, 
  previousValue, 
  type = 'number',
  status
}: StatisticsCardProps) {
  
  const formatValue = (val: number) => {
    if (type === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(val);
    } else if (type === 'percent') {
      return `${val.toFixed(1)}%`;
    } else {
      return val.toString();
    }
  };

  const calculateChange = () => {
    if (previousValue === undefined || previousValue === 0) {
      return null;
    }
    
    const changePercent = ((value - previousValue) / previousValue) * 100;
    return {
      percent: changePercent,
      isPositive: changePercent >= 0,
      formatted: `${Math.abs(changePercent).toFixed(1)}%`
    };
  };

  const change = calculateChange();
  const finalStatus = status || (change?.isPositive ? 'positive' : 'negative');

  return (
    <View style={[
      styles.card,
      finalStatus === 'positive' && styles.positiveCard,
      finalStatus === 'negative' && styles.negativeCard
    ]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[
        styles.value,
        finalStatus === 'positive' && styles.positiveValue,
        finalStatus === 'negative' && styles.negativeValue
      ]}>{formatValue(value)}</Text>
      
      {change && (
        <View style={[
          styles.changeContainer,
          finalStatus === 'positive' ? styles.positiveChange : styles.negativeChange
        ]}>
          {finalStatus === 'positive' ? (
            <TrendingUp size={16} color="#16A34A" />
          ) : (
            <TrendingDown size={16} color="#DC2626" />
          )}
          <Text style={[
            styles.changeText,
            finalStatus === 'positive' ? styles.positiveChangeText : styles.negativeChangeText
          ]}>
            {change.formatted} {change.isPositive ? 'a mais' : 'a menos'} que o período anterior
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
    borderLeftWidth: 4,
    borderLeftColor: '#6B7280',
  },
  positiveCard: {
    borderLeftColor: '#16A34A',
  },
  negativeCard: {
    borderLeftColor: '#DC2626',
  },
  title: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  value: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    color: '#1F2937',
    marginBottom: 12,
  },
  positiveValue: {
    color: '#16A34A',
  },
  negativeValue: {
    color: '#DC2626',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  positiveChange: {
    backgroundColor: '#DCFCE7',
  },
  negativeChange: {
    backgroundColor: '#FEE2E2',
  },
  changeText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    marginLeft: 8,
  },
  positiveChangeText: {
    color: '#16A34A',
  },
  negativeChangeText: {
    color: '#DC2626',
  },
});