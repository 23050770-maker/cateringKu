import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../hooks/useAuthStore';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  UtensilsCrossed,
  User,
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
} from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { loginMock, isLoading, error, setError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'TENANT'>('CUSTOMER');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email) {
      setError('Silakan masukkan email Anda.');
      return;
    }
    let name = 'User Baru';
    if (email === 'customer@gmail.com') name = 'Budi Raharjo';
    else if (email === 'tenant@gmail.com') name = 'Hendra Owner Penyetan';

    const user = await loginMock(email, name, role);
    if (user) {
      if (user.role === 'CUSTOMER') router.replace('/customer');
      else if (user.role === 'TENANT') router.replace('/tenant');
    }
  };

  const handleQuickDemo = async (type: 'customer' | 'tenant') => {
    const isCustomer = type === 'customer';
    const demoEmail = isCustomer ? 'customer@gmail.com' : 'tenant@gmail.com';
    const demoName = isCustomer ? 'Budi Raharjo' : 'Hendra Owner Penyetan';
    const demoRole: 'CUSTOMER' | 'TENANT' = isCustomer ? 'CUSTOMER' : 'TENANT';

    setEmail(demoEmail);
    setRole(demoRole);

    const user = await loginMock(demoEmail, demoName, demoRole);
    if (user) {
      if (user.role === 'CUSTOMER') router.replace('/customer');
      else if (user.role === 'TENANT') router.replace('/tenant');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Green Hero Header */}
          <View className="bg-green-600 pt-10 pb-16 px-6 items-center">
            <View className="w-20 h-20 bg-white/20 rounded-3xl items-center justify-center mb-4 border-2 border-white/30">
              <UtensilsCrossed size={36} color="white" strokeWidth={2} />
            </View>
            <Text className="text-white text-3xl font-extrabold tracking-tight">CateringGo</Text>
            <Text className="text-green-100 text-sm mt-1 font-medium">
              Pesan makan harian, mudah & terpercaya
            </Text>
          </View>

          {/* White Card Form (overlapping the green) */}
          <View
            className="flex-1 bg-white dark:bg-slate-950 rounded-t-3xl -mt-8 px-6 pt-8"
            style={{ shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, elevation: 8 }}
          >
            <Text className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
              Masuk ke Akun
            </Text>
            <Text className="text-slate-400 dark:text-slate-500 text-sm mb-8">
              Selamat datang kembali! 👋
            </Text>

            {/* Role Switcher - Gojek style pill */}
            <View className="flex-row bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6">
              <TouchableOpacity
                onPress={() => setRole('CUSTOMER')}
                activeOpacity={0.8}
                accessibilityLabel="Login sebagai Customer"
                accessibilityRole="button"
                className={`flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2 ${
                  role === 'CUSTOMER' ? 'bg-green-600 shadow-md' : ''
                }`}
              >
                <User
                  size={14}
                  color={role === 'CUSTOMER' ? 'white' : '#94a3b8'}
                  strokeWidth={2.5}
                />
                <Text
                  className={`font-bold text-sm ${
                    role === 'CUSTOMER' ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  Customer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRole('TENANT')}
                activeOpacity={0.8}
                accessibilityLabel="Login sebagai Mitra Catering"
                accessibilityRole="button"
                className={`flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2 ${
                  role === 'TENANT' ? 'bg-green-600 shadow-md' : ''
                }`}
              >
                <Store
                  size={14}
                  color={role === 'TENANT' ? 'white' : '#94a3b8'}
                  strokeWidth={2.5}
                />
                <Text
                  className={`font-bold text-sm ${
                    role === 'TENANT' ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  Mitra Catering
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email Field */}
            <View className="mb-4">
              <Text className="text-slate-700 dark:text-slate-300 text-xs font-bold mb-2 uppercase tracking-wider">
                Email
              </Text>
              <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 h-[52px]">
                <Mail size={16} color="#94a3b8" strokeWidth={2} />
                <TextInput
                  className="flex-1 ml-3 text-slate-900 dark:text-white text-sm font-medium"
                  placeholder="nama@email.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  accessibilityLabel="Input email"
                />
              </View>
            </View>

            {/* Password Field (mock) */}
            <View className="mb-6">
              <Text className="text-slate-700 dark:text-slate-300 text-xs font-bold mb-2 uppercase tracking-wider">
                Kata Sandi
              </Text>
              <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 h-[52px]">
                <Lock size={16} color="#94a3b8" strokeWidth={2} />
                <TextInput
                  className="flex-1 ml-3 text-slate-900 dark:text-white text-sm font-medium"
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  textContentType="password"
                  accessibilityLabel="Input kata sandi"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityLabel={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="p-1"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={16} color="#94a3b8" strokeWidth={2} />
                  ) : (
                    <Eye size={16} color="#94a3b8" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {error && (
              <View className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-5">
                <Text className="text-red-600 dark:text-red-400 text-xs font-semibold text-center">
                  {error}
                </Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
              accessibilityLabel="Masuk"
              accessibilityRole="button"
              className="bg-green-600 h-[52px] rounded-2xl items-center justify-center shadow-lg mb-4"
              style={{ shadowColor: '#16a34a', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-extrabold text-base">Masuk</Text>
              )}
            </TouchableOpacity>

            {/* Register link */}
            <TouchableOpacity
              onPress={() => {
                setError(null);
                router.push('/register');
              }}
              className="items-center py-4"
              accessibilityLabel="Belum punya akun? Daftar Sekarang"
              accessibilityRole="link"
            >
              <Text className="text-slate-500 dark:text-slate-400 text-sm">
                Belum punya akun?{' '}
                <Text className="text-green-600 dark:text-green-400 font-extrabold">
                  Daftar Sekarang
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              <Text className="text-slate-300 dark:text-slate-600 text-xs px-4 font-semibold">
                ATAU COBA DEMO
              </Text>
              <View className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            </View>

            {/* Quick Demo Buttons */}
            <View className="flex-row gap-3 mb-8">
              <TouchableOpacity
                onPress={() => handleQuickDemo('customer')}
                activeOpacity={0.8}
                accessibilityLabel="Demo sebagai Customer"
                accessibilityRole="button"
                className="flex-1 border-2 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 h-[48px] rounded-2xl items-center justify-center flex-row gap-2"
              >
                <User size={14} color="#16a34a" strokeWidth={2.5} />
                <Text className="text-green-700 dark:text-green-400 font-bold text-xs">
                  Customer Demo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleQuickDemo('tenant')}
                activeOpacity={0.8}
                accessibilityLabel="Demo sebagai Mitra Catering"
                accessibilityRole="button"
                className="flex-1 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 h-[48px] rounded-2xl items-center justify-center flex-row gap-2"
              >
                <Store size={14} color="#64748b" strokeWidth={2.5} />
                <Text className="text-slate-600 dark:text-slate-300 font-bold text-xs">
                  Mitra Demo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
