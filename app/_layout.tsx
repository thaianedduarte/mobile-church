import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { CacheProvider } from '@/context/CacheContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CacheProvider>
        <ThemeProvider>
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
            }}
          />
        </ThemeProvider>
      </CacheProvider>
    </AuthProvider>
  );
}