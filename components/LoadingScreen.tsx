import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Church } from 'lucide-react-native';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Church size={60} color="#5B21B6" />
      <ActivityIndicator size="large" color="#5B21B6" style={styles.spinner} />
      <Text style={styles.text}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  spinner: {
    marginTop: 24,
    marginBottom: 16,
  },
  text: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: '#6B7280',
  },
});