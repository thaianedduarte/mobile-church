import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Share, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import QRCode from '@/components/QRCode';
import { ChevronLeft, Share2, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

export default function DigitalCardScreen() {
  const router = useRouter();
  const { userToken, memberInfo } = useAuth();
  const [qrCodeValue, setQrCodeValue] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userToken) {
      // Generate QR code with proper format
      const value = `realm://auth?key=${userToken}`;
      setQrCodeValue(value);
      setLoading(false);
    } else {
      // Fallback para quando não há token (modo demo)
      const fallbackToken = 'test_member_2024';
      const value = `realm://auth?key=${fallbackToken}`;
      setQrCodeValue(value);
      setLoading(false);
    }
  }, [userToken]);

  const handleGoBack = () => {
    router.back();
  };

  const handleCopyCode = async () => {
    const codeToShare = userToken || 'test_member_2024';
    await Clipboard.setStringAsync(codeToShare);
    Alert.alert('Chave copiada', 'A chave de acesso foi copiada para a área de transferência.');
  };

  const handleShare = async () => {
    const codeToShare = userToken || 'test_member_2024';
    
    try {
      await Share.share({
        message: `Minha chave de acesso para a Igreja Digital: ${codeToShare}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Carteirinha Digital"
        leftComponent={
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={24} color="#1F2937" />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.content}>
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Igreja Digital</Text>
            <Text style={styles.cardSubtitle}>Carteirinha de Membro</Text>
          </View>
          
          <View style={styles.memberInfoContainer}>
            <Text style={styles.memberName}>{memberInfo?.name || 'Membro'}</Text>
            <Text style={styles.memberRole}>{memberInfo?.role || 'Membro'}</Text>
            <View style={[
              styles.statusBadge,
              memberInfo?.status === 'active' ? styles.activeStatus : styles.inactiveStatus
            ]}>
              <Text style={[
                styles.statusText,
                memberInfo?.status === 'active' ? styles.activeStatusText : styles.inactiveStatusText
              ]}>
                {memberInfo?.status === 'active' ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
          </View>
          
          <View style={styles.qrCodeContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando QR Code...</Text>
              </View>
            ) : (
              <QRCode value={qrCodeValue} size={200} />
            )}
          </View>
          
          <Text style={styles.cardFooter}>
            {memberInfo?.memberSince 
              ? `Membro desde ${memberInfo.memberSince}`
              : 'Membro da Igreja Digital'}
          </Text>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCopyCode}>
            <Copy size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Copiar Chave</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Compartilhar</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.helpText}>
          Apresente este QR Code para identificação na igreja ou compartilhe sua chave de acesso
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    color: '#5B21B6',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: '#6B7280',
  },
  memberInfoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  memberName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  memberRole: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  activeStatus: {
    backgroundColor: '#DCFCE7',
  },
  inactiveStatus: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
  },
  activeStatusText: {
    color: '#16A34A',
  },
  inactiveStatusText: {
    color: '#DC2626',
  },
  qrCodeContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  loadingContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#6B7280',
  },
  cardFooter: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#5B21B6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  actionButtonText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  helpText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 300,
  },
});