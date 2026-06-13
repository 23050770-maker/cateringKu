import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider, DefaultTheme, DarkTheme } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import '../global.css';
import { useAuthStore } from '../hooks/useAuthStore';

// Protected routes that require authentication
const PROTECTED_SEGMENTS = ['customer', 'tenant', 'payment-simulator', 'payment-status'];

function AuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const currentSegment = segments[0] as string | undefined;
    const isProtected = PROTECTED_SEGMENTS.includes(currentSegment ?? '');

    if (isProtected && !isAuthenticated) {
      // Not logged in but trying to access protected page → redirect to login
      router.replace('/login');
    }
  }, [segments, isAuthenticated]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="customer" />
        <Stack.Screen name="tenant" />
        <Stack.Screen name="payment-simulator" options={{ presentation: 'modal' }} />
        <Stack.Screen name="payment-status" />
      </Stack>
    </ThemeProvider>
  );
}
