import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, CheckCircle2, XCircle, ChevronLeft, ShieldCheck } from 'lucide-react-native';

const GREEN = '#16a34a';

export default function PaymentSimulatorScreen() {
  const router = useRouter();
  const { orderId, totalAmount } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [successLoading, setSuccessLoading] = useState(false);
  const [failLoading, setFailLoading] = useState(false);

  const amount = parseFloat(totalAmount as string) || 0;

  const handlePayment = async (status: 'PAID' | 'FAILED') => {
    if (status === 'PAID') setSuccessLoading(true);
    else setFailLoading(true);
    setLoading(true);
    try {
      await api.payOrder(orderId as string, status);
      router.replace({
        pathname: '/payment-status',
        params: { status: status.toLowerCase(), orderId },
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Gagal memproses simulasi pembayaran.');
      setLoading(false);
      setSuccessLoading(false);
      setFailLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar style="auto" />

      {/* Header */}
      <View className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={loading}
          accessibilityLabel="Kembali"
          accessibilityRole="button"
          className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl items-center justify-center mr-4"
        >
          <ChevronLeft size={20} color="#374151" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="text-slate-800 dark:text-white font-extrabold text-lg flex-1">
          Pembayaran
        </Text>
        <View className="flex-row items-center gap-1.5 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-900/50">
          <ShieldCheck size={12} color={GREEN} strokeWidth={2.5} />
          <Text className="text-green-700 dark:text-green-400 text-[10px] font-bold">Aman & Terpercaya</Text>
        </View>
      </View>

      <View className="flex-1 px-5 pt-6">
        {/* Payment Icon */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-green-50 dark:bg-green-950/30 rounded-3xl items-center justify-center border-2 border-green-100 dark:border-green-900/50 mb-4">
            <CreditCard size={42} color={GREEN} strokeWidth={1.5} />
          </View>
          <Text className="text-slate-800 dark:text-white text-2xl font-extrabold text-center">
            Simulator Pembayaran
          </Text>
          <Text className="text-slate-400 dark:text-slate-500 text-sm text-center mt-2 leading-5 px-6">
            Pilih hasil transaksi di bawah untuk melanjutkan pengujian
          </Text>
        </View>

        {/* Info Card - GoPay style */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-8 shadow-sm shadow-slate-100 dark:shadow-none">
          <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-slate-50 dark:border-slate-800">
            <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
              ID Pesanan
            </Text>
            <Text className="text-slate-700 dark:text-slate-300 text-xs font-bold" numberOfLines={1} style={{ maxWidth: '65%' }}>
              {orderId}
            </Text>
          </View>

          <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Total Tagihan
          </Text>
          <Text className="text-4xl font-black text-green-600 dark:text-green-400">
            Rp {amount.toLocaleString('id-ID')}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="gap-4">
          {/* Pay Success */}
          <TouchableOpacity
            onPress={() => handlePayment('PAID')}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityLabel="Simulasi pembayaran sukses"
            accessibilityRole="button"
            className="bg-green-600 h-[56px] rounded-2xl items-center justify-center flex-row gap-3"
            style={{ shadowColor: GREEN, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}
          >
            {successLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <CheckCircle2 size={20} color="white" strokeWidth={2.5} />
                <Text className="text-white font-extrabold text-base">Bayar Lunas (SUKSES)</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Pay Fail */}
          <TouchableOpacity
            onPress={() => handlePayment('FAILED')}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityLabel="Simulasi pembayaran gagal"
            accessibilityRole="button"
            className="bg-red-500 h-[56px] rounded-2xl items-center justify-center flex-row gap-3"
            style={{ shadowColor: '#ef4444', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 }}
          >
            {failLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <XCircle size={20} color="white" strokeWidth={2.5} />
                <Text className="text-white font-extrabold text-base">Pembayaran Ditolak</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={loading}
            activeOpacity={0.7}
            accessibilityLabel="Bayar nanti"
            accessibilityRole="button"
            className="h-[52px] items-center justify-center"
          >
            <Text className="text-slate-400 dark:text-slate-500 font-bold text-sm">
              Kembali & Bayar Nanti
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
