import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../hooks/useAuthStore';
import { api } from '../../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChefHat,
  UtensilsCrossed,
  CalendarDays,
  RotateCcw,
  Plus,
  X,
  TrendingUp,
  Package,
  Banknote,
  LogOut,
  Bell,
  ClipboardList,
  CheckCheck,
  XCircle,
} from 'lucide-react-native';

interface Menu {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  maxQuota: number;
  availableAt: string;
}

interface RekapItem {
  menuId: string;
  name: string;
  description?: string | null;
  price: number;
  totalQuantity: number;
}

const GREEN = '#16a34a';

export default function TenantDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'menus'>('dashboard');
  const [stats, setStats] = useState<{ menuCount: number; orderCount: number; totalRevenue: number } | null>(null);

  const loadStats = async () => {
    try {
      const data = await api.getTenantStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load tenant stats:', err);
    }
  };

  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    loadStats();
  }, [activeTab, isAuthenticated]);

  const tabs = [
    { id: 'dashboard' as const, label: 'Rekap Dapur', Icon: ChefHat },
    { id: 'orders' as const, label: 'Pesanan', Icon: ClipboardList },
    { id: 'menus' as const, label: 'Kelola Menu', Icon: UtensilsCrossed },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* GoBiz-style Green Header */}
      <View className="bg-green-600 px-5 pt-4 pb-8">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 mr-3">
            <Text className="text-green-100 text-xs font-semibold">Mitra Catering</Text>
            <Text className="text-white text-xl font-extrabold mt-0.5" numberOfLines={1}>
              {user?.tenant?.name || 'Dapur Anda'}
            </Text>
          </View>
          <View className="flex-row items-center gap-2.5">
            <TouchableOpacity
              className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center"
              accessibilityLabel="Notifikasi"
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Bell size={18} color="white" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { logout(); router.replace('/login'); }}
              className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center"
              accessibilityLabel="Keluar"
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <LogOut size={18} color="white" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Stats Card (overlapping header) */}
      <View className="px-4 -mt-4 mb-4">
        <View className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800">
          <View className="flex-row">
            <View className="flex-1 items-center py-4 border-r border-slate-100 dark:border-slate-800">
              <View className="w-9 h-9 bg-green-50 dark:bg-green-950/30 rounded-2xl items-center justify-center mb-2">
                <Package size={16} color={GREEN} strokeWidth={2} />
              </View>
              <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">Menu Aktif</Text>
              <Text className="text-slate-800 dark:text-white font-extrabold text-lg mt-0.5">
                {stats !== null ? stats.menuCount : '—'}
              </Text>
            </View>
            <View className="flex-1 items-center py-4 border-r border-slate-100 dark:border-slate-800">
              <View className="w-9 h-9 bg-blue-50 dark:bg-blue-950/30 rounded-2xl items-center justify-center mb-2">
                <TrendingUp size={16} color="#2563eb" strokeWidth={2} />
              </View>
              <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">Pesanan</Text>
              <Text className="text-slate-800 dark:text-white font-extrabold text-lg mt-0.5">
                {stats !== null ? stats.orderCount : '—'}
              </Text>
            </View>
            <View className="flex-1 items-center py-4">
              <View className="w-9 h-9 bg-orange-50 dark:bg-orange-950/30 rounded-2xl items-center justify-center mb-2">
                <Banknote size={16} color="#ea580c" strokeWidth={2} />
              </View>
              <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">Pendapatan</Text>
              <Text className="text-slate-800 dark:text-white font-extrabold text-sm mt-1" numberOfLines={1}>
                {stats !== null ? `Rp ${stats.totalRevenue.toLocaleString('id-ID')}` : '—'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Main Body */}
      <View className="flex-1">
        {activeTab === 'dashboard' && <DashboardTab refreshStats={loadStats} />}
        {activeTab === 'orders' && <OrdersTab refreshStats={loadStats} />}
        {activeTab === 'menus' && <MenusTab refreshStats={loadStats} />}
      </View>

      {/* Bottom Tab Bar */}
      <SafeAreaView edges={['bottom']} className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <View className="flex-row px-2 pt-2 pb-1">
          {tabs.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setActiveTab(id)}
                activeOpacity={0.7}
                accessibilityLabel={label}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                className="flex-1 items-center py-2"
              >
                <View className={`w-10 h-10 rounded-2xl items-center justify-center ${isActive ? 'bg-green-50 dark:bg-green-950/40' : ''}`}>
                  <Icon size={22} color={isActive ? GREEN : '#94a3b8'} strokeWidth={isActive ? 2.5 : 2} />
                </View>
                <Text className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

// ==========================================
// TABS 1: DASHBOARD TAB (KITCHEN REKAP)
// ==========================================
function DashboardTab({ refreshStats }: { refreshStats?: () => void }) {
  const [rekap, setRekap] = useState<RekapItem[]>([]);
  const [loading, setLoading] = useState(true);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  const [selectedDate, setSelectedDate] = useState(dates[0]);

  const { isAuthenticated } = useAuthStore();

  const loadKitchenRekap = async () => {
    setLoading(true);
    try {
      const data = await api.getKitchenRekap(selectedDate);
      setRekap(data);
      if (refreshStats) {
        refreshStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadKitchenRekap();
  }, [selectedDate, isAuthenticated]);

  const formatDateLabel = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (dateStr === todayStr) return 'Hari Ini';
    if (dateStr === tomorrowStr) return 'Besok';
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const getDateDay = (dateStr: string) => new Date(dateStr).getDate().toString();
  const getDateShortMonth = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { month: 'short' });
  const isToday = (dateStr: string) => dateStr === new Date().toISOString().split('T')[0];

  return (
    <View className="flex-1">
      {/* Date Selector - GoFood Style */}
      <View className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {dates.map((date) => {
            const isSelected = selectedDate === date;
            return (
              <TouchableOpacity
                key={date}
                onPress={() => setSelectedDate(date)}
                activeOpacity={0.75}
                accessibilityLabel={formatDateLabel(date)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className={`w-14 mr-2.5 items-center py-2.5 rounded-2xl border ${
                  isSelected
                    ? 'bg-green-600 border-green-600'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/70'
                }`}
              >
                <Text className={`text-[9px] font-bold uppercase ${isSelected ? 'text-green-100' : 'text-slate-400'}`}>
                  {isToday(date) ? 'Hari Ini' : getDateShortMonth(date)}
                </Text>
                <Text className={`text-lg font-black mt-0.5 ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                  {getDateDay(date)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4 pt-5" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-5">
          <View>
            <Text className="text-slate-800 dark:text-white font-extrabold text-xl">Rekap Masak</Text>
            <Text className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Pesanan berstatus LUNAS saja</Text>
          </View>
          <TouchableOpacity
            onPress={loadKitchenRekap}
            accessibilityLabel="Refresh rekap"
            accessibilityRole="button"
            className="flex-row items-center gap-1.5 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-xl"
          >
            <RotateCcw size={12} color={GREEN} strokeWidth={2.5} />
            <Text className="text-green-600 dark:text-green-400 font-bold text-xs">Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={GREEN} />
          </View>
        ) : rekap.length === 0 ? (
          <View className="items-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <View className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl items-center justify-center mb-4">
              <ChefHat size={36} color="#cbd5e1" strokeWidth={1.5} />
            </View>
            <Text className="text-slate-700 dark:text-slate-300 font-extrabold text-base">Dapur Kosong</Text>
            <Text className="text-slate-400 dark:text-slate-500 text-xs text-center mt-2 px-8 leading-5">
              Belum ada pesanan lunas untuk dimasak di tanggal ini.
            </Text>
          </View>
        ) : (
          rekap.map((item) => (
            <View
              key={item.menuId}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3 shadow-sm shadow-slate-100 dark:shadow-none flex-row items-center"
            >
              <View className="w-12 h-12 bg-orange-50 dark:bg-orange-950/30 rounded-2xl items-center justify-center mr-4 border border-orange-100 dark:border-orange-900/40">
                <UtensilsCrossed size={20} color="#ea580c" strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-800 dark:text-slate-100 font-bold text-sm" numberOfLines={1}>
                  {item.name}
                </Text>
                {item.description && (
                  <Text className="text-slate-400 dark:text-slate-500 text-xs mt-0.5" numberOfLines={1}>
                    {item.description}
                  </Text>
                )}
              </View>
              <View className="bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/50 px-4 py-3 rounded-2xl items-center">
                <Text className="text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase">Siapkan</Text>
                <Text className="text-green-600 dark:text-green-400 font-black text-xl mt-0.5">
                  {item.totalQuantity}
                </Text>
                <Text className="text-slate-400 dark:text-slate-500 text-[9px] font-semibold">porsi</Text>
              </View>
            </View>
          ))
        )}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}

// ==========================================
// TABS 2: MENUS TAB (MENU MANAGER)
// ==========================================
function MenusTab({ refreshStats }: { refreshStats?: () => void }) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [maxQuota, setMaxQuota] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  const [availableAt, setAvailableAt] = useState(dates[0]);

  const { isAuthenticated } = useAuthStore();

  const loadMenus = async () => {
    setLoading(true);
    try {
      const data = await api.getTenantMenusOnly();
      setMenus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadMenus();
  }, [isAuthenticated]);

  const handleCreateMenu = async () => {
    if (!name || !price || !maxQuota || !availableAt) {
      Alert.alert('Gagal', 'Silakan lengkapi semua field yang wajib.');
      return;
    }
    setSubmitting(true);
    try {
      await api.createTenantMenu({
        name,
        description: description || undefined,
        price: parseFloat(price),
        maxQuota: parseInt(maxQuota),
        availableAt,
      });
      setName(''); setDescription(''); setPrice(''); setMaxQuota('');
      setAvailableAt(dates[0]); setShowCreateForm(false);
      loadMenus();
      if (refreshStats) {
        refreshStats();
      }
      Alert.alert('Sukses', 'Menu harian baru berhasil dibuat!');
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal membuat menu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 px-4 pt-5" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-slate-800 dark:text-white font-extrabold text-xl">Daftar Menu</Text>
        <TouchableOpacity
          onPress={() => setShowCreateForm(!showCreateForm)}
          activeOpacity={0.8}
          accessibilityLabel={showCreateForm ? 'Tutup form tambah menu' : 'Tambah menu baru'}
          accessibilityRole="button"
          className={`flex-row items-center gap-2 h-[40px] px-4 rounded-2xl ${showCreateForm ? 'bg-slate-100 dark:bg-slate-800' : 'bg-green-600'}`}
          style={showCreateForm ? {} : { shadowColor: GREEN, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
        >
          {showCreateForm ? (
            <X size={14} color="#64748b" strokeWidth={2.5} />
          ) : (
            <Plus size={14} color="white" strokeWidth={2.5} />
          )}
          <Text className={`font-bold text-sm ${showCreateForm ? 'text-slate-600 dark:text-slate-300' : 'text-white'}`}>
            {showCreateForm ? 'Batal' : 'Tambah Menu'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Create Form */}
      {showCreateForm && (
        <View className="bg-white dark:bg-slate-900 border border-green-100 dark:border-green-900/50 rounded-3xl p-5 mb-5 shadow-sm">
          <Text className="text-slate-800 dark:text-white font-extrabold text-base mb-5">Buat Menu Baru</Text>

          {/* Nama Menu */}
          <View className="mb-4">
            <Text className="text-slate-600 dark:text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">
              Nama Menu *
            </Text>
            <TextInput
              className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm"
              placeholder="Contoh: Nasi Goreng Gila"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              accessibilityLabel="Nama menu"
            />
          </View>

          {/* Deskripsi */}
          <View className="mb-4">
            <Text className="text-slate-600 dark:text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">
              Deskripsi
            </Text>
            <TextInput
              className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm"
              placeholder="Nasi goreng pedas dengan bakso dan telur..."
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
              accessibilityLabel="Deskripsi menu"
            />
          </View>

          {/* Harga & Kuota */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-slate-600 dark:text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">
                Harga (Rp) *
              </Text>
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm"
                placeholder="15000"
                placeholderTextColor="#94a3b8"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                accessibilityLabel="Harga menu"
              />
            </View>
            <View className="flex-1">
              <Text className="text-slate-600 dark:text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">
                Kuota *
              </Text>
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm"
                placeholder="20"
                placeholderTextColor="#94a3b8"
                value={maxQuota}
                onChangeText={setMaxQuota}
                keyboardType="numeric"
                accessibilityLabel="Kuota porsi"
              />
            </View>
          </View>

          {/* Date Picker */}
          <View className="mb-5">
            <Text className="text-slate-600 dark:text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">
              Tanggal Tersedia *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {dates.map((date) => {
                  const isSelected = availableAt === date;
                  return (
                    <TouchableOpacity
                      key={date}
                      onPress={() => setAvailableAt(date)}
                      activeOpacity={0.75}
                      accessibilityLabel={`Tanggal ${date}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      className={`px-4 py-2.5 rounded-2xl mr-2 border ${
                        isSelected
                          ? 'bg-green-600 border-green-600'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {date}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleCreateMenu}
            disabled={submitting}
            activeOpacity={0.85}
            accessibilityLabel="Simpan menu baru"
            accessibilityRole="button"
            className="bg-green-600 h-[52px] rounded-2xl items-center justify-center"
            style={{ shadowColor: GREEN, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-extrabold text-base">Simpan Menu</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Menus List */}
      {loading ? (
        <View className="items-center py-16">
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      ) : menus.length === 0 ? (
        <View className="items-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <UtensilsCrossed size={32} color="#cbd5e1" strokeWidth={1.5} />
          <Text className="text-slate-400 dark:text-slate-500 text-sm font-bold mt-4">
            Belum ada menu harian
          </Text>
          <Text className="text-slate-300 dark:text-slate-600 text-xs mt-2 text-center px-8">
            Tekan "Tambah Menu" untuk membuat menu harian pertama Anda.
          </Text>
        </View>
      ) : (
        menus.map((m) => (
          <View
            key={m.id}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3 shadow-sm shadow-slate-100 dark:shadow-none"
          >
            <View className="flex-row items-start">
              <View className="w-12 h-12 bg-orange-50 dark:bg-orange-950/30 rounded-2xl items-center justify-center mr-4 border border-orange-100 dark:border-orange-900/40">
                <UtensilsCrossed size={20} color="#ea580c" strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-800 dark:text-slate-100 font-bold text-sm" numberOfLines={1}>
                  {m.name}
                </Text>
                <View className="flex-row items-center mt-1 gap-1">
                  <CalendarDays size={10} color="#94a3b8" strokeWidth={2} />
                  <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold">
                    {m.availableAt}
                  </Text>
                </View>
                {m.description && (
                  <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-4" numberOfLines={2}>
                    {m.description}
                  </Text>
                )}
              </View>
              <Text className="text-green-600 dark:text-green-400 font-extrabold text-base ml-3">
                Rp {m.price.toLocaleString('id-ID')}
              </Text>
            </View>

            <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
              <Text className="text-slate-400 dark:text-slate-500 text-xs">Kuota Maks. Harian</Text>
              <View className="flex-row items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                <Package size={12} color="#94a3b8" strokeWidth={2} />
                <Text className="text-slate-700 dark:text-slate-300 font-extrabold text-sm">
                  {m.maxQuota} porsi
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
      <View className="h-6" />
    </ScrollView>
  );
}

// ==========================================
// TABS 3: ORDERS TAB (ORDER PROCESS MANAGER)
// ==========================================
interface TenantOrder {
  id: string;
  customerId: string;
  customer: { name: string; email: string };
  totalAmount: number;
  paymentStatus: string;
  status: string;
  orderDate: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    targetDate: string;
    menu: { name: string; price: number };
  }>;
}

function OrdersTab({ refreshStats }: { refreshStats?: () => void }) {
  const [orders, setOrders] = useState<TenantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getTenantOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadOrders();
  }, [isAuthenticated]);

  const handleUpdateStatus = async (orderId: string, nextStatus: 'PAID' | 'PREPARING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      loadOrders();
      if (refreshStats) refreshStats();
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal mengubah status pesanan.');
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PAID':
        return { label: 'Dibayar', color: 'text-green-700 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50' };
      case 'PREPARING':
        return { label: 'Sedang Dibuat', color: 'text-orange-700 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50' };
      case 'SHIPPED':
        return { label: 'Sedang Dikirim', color: 'text-blue-700 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50' };
      case 'COMPLETED':
        return { label: 'Selesai', color: 'text-slate-600 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50' };
      case 'CANCELLED':
        return { label: 'Dibatalkan', color: 'text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50' };
      default:
        return { label: 'Menunggu', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50' };
    }
  };

  return (
    <ScrollView className="flex-1 px-4 pt-5" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-5">
        <View>
          <Text className="text-slate-800 dark:text-white font-extrabold text-xl">Daftar Pesanan</Text>
          <Text className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Ubah status pesanan pelanggan di sini</Text>
        </View>
        <TouchableOpacity
          onPress={loadOrders}
          accessibilityLabel="Refresh pesanan"
          accessibilityRole="button"
          className="flex-row items-center gap-1.5 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-xl"
        >
          <RotateCcw size={12} color={GREEN} strokeWidth={2.5} />
          <Text className="text-green-600 dark:text-green-400 font-bold text-xs">Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="items-center py-16">
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      ) : orders.length === 0 ? (
        <View className="items-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <ClipboardList size={32} color="#cbd5e1" strokeWidth={1.5} />
          <Text className="text-slate-400 dark:text-slate-500 text-sm font-bold mt-4">Belum ada pesanan masuk</Text>
        </View>
      ) : (
        orders.map((order) => {
          const statusConfig = getStatusConfig(order.status || order.paymentStatus);
          return (
            <View
              key={order.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm shadow-slate-100 dark:shadow-none"
            >
              {/* Customer Info */}
              <View className="flex-row justify-between items-start mb-3 pb-3 border-b border-slate-50 dark:border-slate-800">
                <View className="flex-1 pr-3">
                  <Text className="text-slate-800 dark:text-slate-100 font-bold text-sm" numberOfLines={1}>
                    {order.customer.name}
                  </Text>
                  <Text className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">
                    {new Date(order.orderDate).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View className={`px-2.5 py-1 rounded-full border ${statusConfig.color}`}>
                  <Text className="text-[10px] font-extrabold uppercase">{statusConfig.label}</Text>
                </View>
              </View>

              {/* Items */}
              {order.orderItems.map((item) => (
                <View key={item.id} className="flex-row justify-between items-center mb-1.5">
                  <Text className="text-slate-600 dark:text-slate-400 text-xs flex-1 pr-2" numberOfLines={1}>
                    {item.quantity}x {item.menu.name}
                  </Text>
                  <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold">
                    Kirim: {item.targetDate}
                  </Text>
                </View>
              ))}

              {/* Total Amount */}
              <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold">Total Pendapatan</Text>
                <Text className="text-slate-800 dark:text-white font-extrabold text-sm">
                  Rp {order.totalAmount.toLocaleString('id-ID')}
                </Text>
              </View>

              {/* Action Buttons based on status */}
              {order.status === 'PAID' && (
                <TouchableOpacity
                  onPress={() => handleUpdateStatus(order.id, 'PREPARING')}
                  activeOpacity={0.8}
                  className="bg-orange-500 h-[44px] rounded-2xl items-center justify-center mt-4 flex-row gap-2"
                >
                  <ChefHat size={16} color="white" strokeWidth={2} />
                  <Text className="text-white font-bold text-sm">Mulai Masak (Proses)</Text>
                </TouchableOpacity>
              )}

              {order.status === 'PREPARING' && (
                <TouchableOpacity
                  onPress={() => handleUpdateStatus(order.id, 'SHIPPED')}
                  activeOpacity={0.8}
                  className="bg-blue-500 h-[44px] rounded-2xl items-center justify-center mt-4 flex-row gap-2"
                >
                  <TrendingUp size={16} color="white" strokeWidth={2} />
                  <Text className="text-white font-bold text-sm">Kirim Makanan</Text>
                </TouchableOpacity>
              )}

              {order.status === 'SHIPPED' && (
                <TouchableOpacity
                  onPress={() => handleUpdateStatus(order.id, 'COMPLETED')}
                  activeOpacity={0.8}
                  className="bg-green-600 h-[44px] rounded-2xl items-center justify-center mt-4 flex-row gap-2"
                >
                  <CheckCheck size={16} color="white" strokeWidth={2.5} />
                  <Text className="text-white font-bold text-sm">Tandai Selesai</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })
      )}
      <View className="h-6" />
    </ScrollView>
  );
}
