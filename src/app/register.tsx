import React, { useState, useEffect } from 'react';
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
import { api } from '../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Store,
  Mail,
  ArrowLeft,
  CheckCircle2,
  UtensilsCrossed,
} from 'lucide-react-native';

interface Tenant {
  id: string;
  name: string;
  description?: string;
  address?: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { loginMock, isLoading: authLoading, error, setError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'TENANT'>('CUSTOMER');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [tenantMode, setTenantMode] = useState<'CREATE' | 'JOIN'>('CREATE');
  const [tenantName, setTenantName] = useState('');
  const [tenantDesc, setTenantDesc] = useState('');
  const [tenantAddress, setTenantAddress] = useState('');

  useEffect(() => {
    if (role === 'TENANT') fetchTenants();
  }, [role]);

  const fetchTenants = async () => {
    setLoadingTenants(true);
    try {
      const { setAuthToken } = require('../hooks/api');
      setAuthToken('mock_register_temp');
      const data = await api.getTenants();
      setTenants(data);
      if (data.length > 0) setSelectedTenantId(data[0].id);
      setAuthToken(null);
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setLoadingTenants(false);
    }
  };

  const handleRegister = async () => {
    setError(null);
    if (!name || !email) {
      setError('Silakan lengkapi semua field.');
      return;
    }

    let tenantId = selectedTenantId;

    if (role === 'TENANT') {
      if (tenantMode === 'CREATE') {
        if (!tenantName || !tenantAddress) {
          setError('Silakan lengkapi data katering baru Anda.');
          return;
        }
        try {
          const newTenant = await api.createTenant({
            name: tenantName,
            description: tenantDesc || undefined,
            address: tenantAddress || undefined,
          });
          tenantId = newTenant.id;
        } catch (err: any) {
          setError(err.message || 'Gagal mendaftarkan catering baru.');
          return;
        }
      } else {
        if (!tenantId) {
          setError('Silakan pilih salah satu katering (tenant) Anda.');
          return;
        }
      }
    }

    const user = await loginMock(email, name, role, role === 'TENANT' ? tenantId : undefined);
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
          {/* Header */}
          <View className="bg-green-600 pt-10 pb-16 px-6">
            <TouchableOpacity
              onPress={() => { setError(null); router.back(); }}
              className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center mb-6"
              accessibilityLabel="Kembali"
              accessibilityRole="button"
            >
              <ArrowLeft size={20} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
            <View className="flex-row items-center gap-3">
              <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center border-2 border-white/30">
                <UtensilsCrossed size={26} color="white" strokeWidth={2} />
              </View>
              <View>
                <Text className="text-white text-2xl font-extrabold">Buat Akun</Text>
                <Text className="text-green-100 text-sm font-medium">CateringGo</Text>
              </View>
            </View>
          </View>

          {/* Form Card */}
          <View className="bg-white dark:bg-slate-950 rounded-t-3xl -mt-8 px-6 pt-8">
            <Text className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
              Lengkapi Data Diri
            </Text>
            <Text className="text-slate-400 dark:text-slate-500 text-sm mb-6">
              Daftar dan mulai pesan makanan harianmu!
            </Text>

            {/* Role Switcher */}
            <View className="flex-row bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6">
              <TouchableOpacity
                onPress={() => setRole('CUSTOMER')}
                activeOpacity={0.8}
                accessibilityLabel="Daftar sebagai Customer"
                accessibilityRole="button"
                className={`flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2 ${
                  role === 'CUSTOMER' ? 'bg-green-600 shadow-md' : ''
                }`}
              >
                <User size={14} color={role === 'CUSTOMER' ? 'white' : '#94a3b8'} strokeWidth={2.5} />
                <Text className={`font-bold text-sm ${role === 'CUSTOMER' ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                  Customer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRole('TENANT')}
                activeOpacity={0.8}
                accessibilityLabel="Daftar sebagai Mitra Catering"
                accessibilityRole="button"
                className={`flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2 ${
                  role === 'TENANT' ? 'bg-green-600 shadow-md' : ''
                }`}
              >
                <Store size={14} color={role === 'TENANT' ? 'white' : '#94a3b8'} strokeWidth={2.5} />
                <Text className={`font-bold text-sm ${role === 'TENANT' ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                  Mitra Catering
                </Text>
              </TouchableOpacity>
            </View>

            {/* Name Input */}
            <View className="mb-4">
              <Text className="text-slate-700 dark:text-slate-300 text-xs font-bold mb-2 uppercase tracking-wider">
                Nama Lengkap
              </Text>
              <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 h-[52px]">
                <User size={16} color="#94a3b8" strokeWidth={2} />
                <TextInput
                  className="flex-1 ml-3 text-slate-900 dark:text-white text-sm font-medium"
                  placeholder="Budi Raharjo"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                  autoComplete="name"
                  textContentType="name"
                  accessibilityLabel="Input nama lengkap"
                />
              </View>
            </View>

            {/* Email Input */}
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

            {/* Tenant Selection / Creation (shown when TENANT role) */}
            {role === 'TENANT' && (
              <View className="mb-4">
                <Text className="text-slate-700 dark:text-slate-300 text-xs font-bold mb-2 uppercase tracking-wider">
                  Mitra Catering Usaha
                </Text>
                
                {/* Mode Selector */}
                <View className="flex-row bg-slate-50 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4">
                  <TouchableOpacity
                    onPress={() => setTenantMode('CREATE')}
                    activeOpacity={0.8}
                    className={`flex-1 py-2.5 rounded-xl items-center ${
                      tenantMode === 'CREATE' ? 'bg-green-600 shadow-sm' : ''
                    }`}
                  >
                    <Text className={`font-bold text-xs ${tenantMode === 'CREATE' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      Daftar Baru
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setTenantMode('JOIN')}
                    activeOpacity={0.8}
                    className={`flex-1 py-2.5 rounded-xl items-center ${
                      tenantMode === 'JOIN' ? 'bg-green-600 shadow-sm' : ''
                    }`}
                  >
                    <Text className={`font-bold text-xs ${tenantMode === 'JOIN' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      Gabung yang Ada
                    </Text>
                  </TouchableOpacity>
                </View>

                {tenantMode === 'CREATE' ? (
                  <View className="gap-3">
                    {/* Nama Catering */}
                    <View>
                      <TextInput
                        className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 h-[52px] rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-medium"
                        placeholder="Nama Usaha Catering *"
                        placeholderTextColor="#94a3b8"
                        value={tenantName}
                        onChangeText={setTenantName}
                        accessibilityLabel="Nama Catering"
                      />
                    </View>
                    {/* Deskripsi */}
                    <View>
                      <TextInput
                        className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 h-[52px] rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-medium"
                        placeholder="Deskripsi Singkat"
                        placeholderTextColor="#94a3b8"
                        value={tenantDesc}
                        onChangeText={setTenantDesc}
                        accessibilityLabel="Deskripsi Catering"
                      />
                    </View>
                    {/* Alamat */}
                    <View>
                      <TextInput
                        className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 h-[52px] rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-medium"
                        placeholder="Alamat Usaha Catering *"
                        placeholderTextColor="#94a3b8"
                        value={tenantAddress}
                        onChangeText={setTenantAddress}
                        accessibilityLabel="Alamat Catering"
                      />
                    </View>
                  </View>
                ) : (
                  <>
                    {loadingTenants ? (
                      <View className="h-[52px] items-center justify-center">
                        <ActivityIndicator size="small" color="#16a34a" />
                      </View>
                    ) : (
                      <View className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {tenants.map((t, idx) => (
                          <TouchableOpacity
                            key={t.id}
                            onPress={() => setSelectedTenantId(t.id)}
                            activeOpacity={0.7}
                            accessibilityLabel={`Pilih ${t.name}`}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: selectedTenantId === t.id }}
                            className={`flex-row items-center px-4 py-4 ${
                              idx < tenants.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''
                            } ${selectedTenantId === t.id ? 'bg-green-50 dark:bg-green-950/30' : ''}`}
                          >
                            <View className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${
                              selectedTenantId === t.id ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-700'
                            }`}>
                              <Store size={16} color={selectedTenantId === t.id ? 'white' : '#94a3b8'} strokeWidth={2} />
                            </View>
                            <View className="flex-1">
                              <Text className={`font-bold text-sm ${
                                selectedTenantId === t.id ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'
                              }`}>
                                {t.name}
                              </Text>
                              <Text className="text-slate-400 dark:text-slate-500 text-xs mt-0.5" numberOfLines={1}>
                                {t.description || 'Mitra Catering'}
                              </Text>
                            </View>
                            {selectedTenantId === t.id && (
                              <CheckCircle2 size={20} color="#16a34a" strokeWidth={2.5} />
                            )}
                          </TouchableOpacity>
                        ))}
                        {tenants.length === 0 && (
                          <View className="py-6 items-center">
                            <Text className="text-slate-400 text-xs font-medium">Tidak ada tenant tersedia</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </>
                )}
              </View>
            )}

            {/* Error */}
            {error && (
              <View className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-5">
                <Text className="text-red-600 dark:text-red-400 text-xs font-semibold text-center">{error}</Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={authLoading}
              activeOpacity={0.85}
              accessibilityLabel="Daftar Akun"
              accessibilityRole="button"
              className="bg-green-600 h-[52px] rounded-2xl items-center justify-center shadow-lg mb-5"
              style={{ shadowColor: '#16a34a', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}
            >
              {authLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-extrabold text-base">Daftar Akun</Text>
              )}
            </TouchableOpacity>

            {/* Login link */}
            <TouchableOpacity
              onPress={() => { setError(null); router.back(); }}
              className="items-center py-4 mb-8"
              accessibilityLabel="Sudah punya akun? Masuk di sini"
              accessibilityRole="link"
            >
              <Text className="text-slate-500 dark:text-slate-400 text-sm">
                Sudah punya akun?{' '}
                <Text className="text-green-600 dark:text-green-400 font-extrabold">Masuk di sini</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
