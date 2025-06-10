import { StyleSheet, Text, View, StatusBar, Platform } from 'react-native';
import { Church } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  showLogo?: boolean;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
}

export default function Header({ 
  title, 
  showLogo = false,
  leftComponent,
  rightComponent,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {leftComponent}
          {showLogo && (
            <Church size={24} color="#5B21B6" style={styles.logo} />
          )}
        </View>
        
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.rightSection}>
          {rightComponent}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  logo: {
    marginRight: 8,
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
  },
  rightSection: {
    width: 60,
    alignItems: 'flex-end',
  },
});