import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, QrCode, KeyRound } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import AccessScanner from '@/components/AccessScanner';

export default function AccessScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [accessKey, setAccessKey] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualLogin = async () => {
    if (!accessKey.trim()) {
      setError('Por favor, insira uma chave de acesso');
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      console.log('🔑 Tentando login manual com chave:', accessKey);
      
      // Use the Supabase service to login
      const { loginWithQRCode } = await import('@/services/supabase');
      const data = await loginWithQRCode(accessKey);

      if (!data.valid) {
        throw new Error(data.error || 'Chave de acesso inválida');
      }

      console.log('✅ Login bem-sucedido, redirecionando...');
      
      // Store member info and proceed with login
      await login(data);
      router.replace('/initial');
    } catch (err: any) {
      console.error('❌ Erro no login manual:', err);
      setError(err.message || 'Erro ao fazer login. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanSuccess = async (qrCode: string) => {
    setShowScanner(false);
    setIsLoading(true);
    
    try {
      console.log('📱 QR Code escaneado:', qrCode);
      
      // Extract QR code from scanned data
      const codeMatch = qrCode.match(/key=([^&]+)/);
      const code = codeMatch ? codeMatch[1] : qrCode;
      
      console.log('🔑 Chave extraída do QR Code:', code);
      
      // Use the Supabase service to login
      const { loginWithQRCode } = await import('@/services/supabase');
      const data = await loginWithQRCode(code);

      if (!data.valid) {
        throw new Error(data.error || 'QR Code inválido');
      }

      console.log('✅ Login por QR Code bem-sucedido, redirecionando...');
      
      // Store member info and proceed with login
      await login(data);
      router.replace('/initial');
    } catch (err: any) {
      console.error('❌ Erro no login por QR Code:', err);
      setError(err.message || 'QR Code inválido. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showScanner) {
    return <AccessScanner onScanSuccess={handleScanSuccess} onClose={() => setShowScanner(false)} />;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <KeyRound size={56} color="#5B21B6" />
            <Text style={styles.title}>Acesso ao Aplicativo</Text>
            <Text style={styles.subtitle}>
              Escaneie o QR Code ou insira sua chave de acesso
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={[styles.optionButton, isLoading && styles.disabledButton]}
              onPress={() => {
                setError(null);
                setShowScanner(true);
              }}
              disabled={isLoading}
            >
              <View style={styles.optionIcon}>
                <QrCode size={32} color="#5B21B6" />
              </View>
              <Text style={styles.optionText}>Escanear QR Code</Text>
              <Text style={styles.optionDescription}>
                Aponte a câmera para o QR Code fornecido pela igreja
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.manualContainer}>
              <Text style={styles.manualTitle}>Insira a Chave Manualmente</Text>
              
              <TextInput
                style={[styles.input, isLoading && styles.disabledInput]}
                placeholder="Insira sua chave de acesso"
                value={accessKey}
                onChangeText={setAccessKey}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  isLoading && styles.disabledButton
                ]}
                onPress={handleManualLogin}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Processando...' : 'Acessar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Verificando credenciais...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
    opacity: 0.6,
  },
  optionIcon: {
    backgroundColor: '#EDE9FE',
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  optionText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: '#374151',
    marginBottom: 8,
  },
  optionDescription: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontFamily: 'Montserrat-Medium',
    color: '#9CA3AF',
    paddingHorizontal: 16,
  },
  manualContainer: {
    marginBottom: 24,
  },
  manualTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'Montserrat-Regular',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Montserrat-Medium',
    color: '#DC2626',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#5B21B6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: '#5B21B6',
    marginTop: 16,
  },
});