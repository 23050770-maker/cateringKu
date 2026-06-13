import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, XCircle, Home } from 'lucide-react-native';

const GREEN = '#16a34a';

export default function PaymentStatusScreen() {
  const router = useRouter();
  const { status, orderId } = useLocalSearchParams();
  const isSuccess = status === 'paid';

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar style="auto" />

      <View className="flex-1 px-6 justify-center items-center">
        {/* Status Icon */}
        <View
          className={`w-28 h-28 rounded-3xl items-center justify-center mb-6 ${
            isSuccess
              ? 'bg-green-50 dark:bg-green-950/30 border-2 border-green-100 dark:border-green-900/50'
              : 'bg-red-50 dark:bg-red-950/30 border-2 border-red-100 dark:border-red-900/50'
          }`}
          style={{
            shadowColor: isSuccess ? GREEN : '#ef4444',
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          {isSuccess ? (
            <CheckCircle2 size={56} color={GREEN} strokeWidth={1.5} />
          ) : (
            <XCircle size={56} color="#ef4444" strokeWidth={1.5} />
          )}
        </View>

        {/* Message */}
        <Text className="text-slate-800 dark:text-white text-2xl font-extrabold text-center mb-2">
          {isSuccess ? 'Pembayaran Berhasil!' : 'Pembayaran Gagal!'}
        </Text>
        <Text className="text-slate-400 dark:text-slate-500 text-sm text-center px-6 leading-6 mb-8">
          {isSuccess
            ? 'Hore! Transaksi dikonfirmasi dan pesanan pre-order dikirim ke dapur katering.'
            : 'Transaksi ditolak atau saldo tidak mencukupi. Silakan coba lagi.'}
        </Text>

        {/* Info Card */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-10 w-full shadow-sm shadow-slate-100 dark:shadow-none">
          <View className="flex-row justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800">
            <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Status
            </Text>
            <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${
              isSuccess
                ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50'
                : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50'
            }`}>
              {isSuccess ? (
                <CheckCircle2 size={12} color={GREEN} strokeWidth={2.5} />
              ) : (
                <XCircle size={12} color="#ef4444" strokeWidth={2.5} />
              )}
              <Text className={`text-xs font-extrabold ${isSuccess ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isSuccess ? 'LUNAS' : 'GAGAL'}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center py-3">
            <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
              ID Pesanan
            </Text>
            <Text className="text-slate-600 dark:text-slate-300 text-xs font-bold" numberOfLines={1} style={{ maxWidth: '60%' }}>
              {orderId}
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={() => router.replace('/customer')}
          activeOpacity={0.85}
          accessibilityLabel="Kembali ke dashboard"
          accessibilityRole="button"
          className="bg-green-600 w-full h-[56px] rounded-2xl items-center justify-center flex-row gap-3"
          style={{ shadowColor: GREEN, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}
        >
          <Home size={20} color="white" strokeWidth={2} />
          <Text className="text-white font-extrabold text-base">Kembali ke Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
