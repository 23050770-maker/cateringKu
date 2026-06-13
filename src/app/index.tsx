import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../hooks/useAuthStore';

export default function IndexPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user) {
      if (user.role === 'CUSTOMER') {
        router.replace('/customer');
      } else if (user.role === 'TENANT') {
        router.replace('/tenant');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  return (
    <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}
