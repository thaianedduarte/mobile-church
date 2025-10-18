// Configuração de URLs de redirecionamento para autenticação
export const getRedirectUrl = () => {
  // Para desenvolvimento local
  if (__DEV__) {
    // Substitua pelo seu IP local
    return 'exp://192.168.1.100:8081/--/auth/callback';
  }
  
  // Para produção (quando o app for publicado)
  return 'churchapp://auth/callback';
};

// URLs que devem ser adicionados no Supabase Dashboard
export const SUPABASE_REDIRECT_URLS = [
  // Desenvolvimento
  'exp://192.168.1.100:8081/--/auth/callback',
  'exp://localhost:8081/--/auth/callback',
  
  // Produção (quando publicar o app)
  'churchapp://auth/callback',
  'com.yourcompany.churchapp://auth/callback',
]; 