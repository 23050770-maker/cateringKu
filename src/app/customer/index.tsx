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
import { useCartStore } from '../../hooks/useCartStore';
import { api } from '../../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Home,
  CalendarDays,
  ShoppingCart,
  ClipboardList,
  Bell,
  MapPin,
  ChevronRight,
  UtensilsCrossed,
  Package,
  AlertTriangle,
  CheckCheck,
  Clock,
  XCircle,
  LogOut,
  Minus,
  Plus,
  Trash2,
  ChefHat,
} from 'lucide-react-native';

interface Tenant {
  id: string;
  name: string;
  description?: string;
  address?: string;
}

interface Menu {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  price: number;
  maxQuota: number;
  availableAt: string;
  remainingQuota?: number;
  orderedQuantity?: number;
}

interface Order {
  id: string;
  tenantId: string;
  tenant: { name: string };
  totalAmount: number;
  paymentStatus: string;
  orderDate: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    targetDate: string;
    menu: { name: string; price: number };
  }>;
}

const GREEN = '#16a34a';
const GREEN_LIGHT = '#22c55e';

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'cart' | 'orders'>('home');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const cart = useCartStore();

  const tabs = [
    { id: 'home' as const, label: 'Beranda', Icon: Home },
    { id: 'calendar' as const, label: 'Menu Harian', Icon: CalendarDays },
    { id: 'cart' as const, label: 'Keranjang', Icon: ShoppingCart },
    { id: 'orders' as const, label: 'Pesanan', Icon: ClipboardList },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Gojek-style Green Header */}
      <View className="bg-green-600 px-5 pt-4 pb-6">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-green-100 text-xs font-semibold">Selamat datang,</Text>
            <Text className="text-white text-xl font-extrabold mt-0.5" numberOfLines={1}>
              {user?.name || 'Customer'}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
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

        {/* Location Row */}
        <TouchableOpacity
          className="flex-row items-center mt-4 bg-white/15 rounded-2xl px-3.5 py-2.5"
          accessibilityLabel="Lokasi pengiriman"
          accessibilityRole="button"
        >
          <MapPin size={14} color="white" strokeWidth={2.5} />
          <Text className="text-white font-semibold text-xs ml-2 flex-1">Kantin Universitas</Text>
          <ChevronRight size={12} color="rgba(255,255,255,0.7)" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View className="flex-1 -mt-2">
        {activeTab === 'home' && (
          <HomeTab
            onSelectTenant={(tenant) => {
              setSelectedTenant(tenant);
              setActiveTab('calendar');
            }}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarTab
            selectedTenant={selectedTenant}
            setSelectedTenant={setSelectedTenant}
            cart={cart}
          />
        )}
        {activeTab === 'cart' && (
          <CartTab
            cart={cart}
            onOrderCreated={(orderId, totalAmount) => {
              router.push({ pathname: '/payment-simulator', params: { orderId, totalAmount } });
            }}
          />
        )}
        {activeTab === 'orders' && (
          <OrdersTab
            onPayPending={(orderId, totalAmount) => {
              router.push({ pathname: '/payment-simulator', params: { orderId, totalAmount } });
            }}
          />
        )}
      </View>

      {/* Gojek-style Bottom Tab Bar */}
      <SafeAreaView edges={['bottom']} className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <View className="flex-row px-2 pt-2 pb-1">
          {tabs.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            const showBadge = id === 'cart' && cart.getItemCount() > 0;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setActiveTab(id)}
                activeOpacity={0.7}
                accessibilityLabel={label}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                className="flex-1 items-center py-2 relative"
              >
                <View className={`w-10 h-10 rounded-2xl items-center justify-center ${isActive ? 'bg-green-50 dark:bg-green-950/40' : ''}`}>
                  <Icon
                    size={22}
                    color={isActive ? GREEN : '#94a3b8'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </View>
                <Text className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {label}
                </Text>
                {showBadge && (
                  <View className="absolute top-1.5 right-4 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                    <Text className="text-white text-[8px] font-black">{cart.getItemCount()}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

// ==========================================
// HOME TAB
// ==========================================
function HomeTab({ onSelectTenant }: { onSelectTenant: (tenant: Tenant) => void }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    api.getTenants()
      .then(setTenants)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const quickActions = [
    { icon: UtensilsCrossed, label: 'Katering Harian', color: 'bg-green-500' },
    { icon: CalendarDays, label: 'Pre-Order Acara', color: 'bg-blue-500' },
    { icon: Package, label: 'Paket Mingguan', color: 'bg-orange-500' },
    { icon: ClipboardList, label: 'Riwayat', color: 'bg-purple-500' },
  ];

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* White card overlapping the green header */}
      <View className="bg-white dark:bg-slate-900 mx-4 rounded-3xl -mt-0 shadow-sm shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800 p-5 mb-5">
        {/* Quick Actions Grid */}
        <Text className="text-slate-800 dark:text-white font-extrabold text-base mb-4">Layanan</Text>
        <View className="flex-row justify-between">
          {quickActions.map(({ icon: Icon, label, color }) => (
            <TouchableOpacity
              key={label}
              activeOpacity={0.7}
              accessibilityLabel={label}
              accessibilityRole="button"
              className="items-center"
              style={{ width: '22%' }}
            >
              <View className={`w-14 h-14 ${color} rounded-2xl items-center justify-center mb-2`}>
                <Icon size={24} color="white" strokeWidth={2} />
              </View>
              <Text className="text-slate-700 dark:text-slate-300 text-[10px] font-bold text-center leading-3">
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Promo Banner */}
      <View className="mx-4 mb-5 bg-green-600 rounded-3xl p-5 flex-row items-center justify-between overflow-hidden">
        <View className="flex-1">
          <Text className="text-green-100 text-xs font-semibold mb-1">Promo Hari Ini</Text>
          <Text className="text-white text-base font-extrabold">Gratis Ongkir</Text>
          <Text className="text-green-100 text-xs mt-0.5">Min. 2 porsi catering harian</Text>
        </View>
        <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center">
          <UtensilsCrossed size={32} color="white" strokeWidth={1.5} />
        </View>
      </View>

      {/* Tenant List */}
      <View className="px-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-slate-800 dark:text-white font-extrabold text-base">Mitra Catering</Text>
          <Text className="text-green-600 dark:text-green-400 font-bold text-xs">Lihat Semua</Text>
        </View>

        {loading ? (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color={GREEN} />
          </View>
        ) : tenants.length === 0 ? (
          <View className="items-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <UtensilsCrossed size={32} color="#cbd5e1" strokeWidth={1.5} />
            <Text className="text-slate-400 dark:text-slate-500 text-sm font-semibold mt-4">
              Belum ada mitra catering
            </Text>
          </View>
        ) : (
          tenants.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => onSelectTenant(t)}
              activeOpacity={0.8}
              accessibilityLabel={`Pilih catering ${t.name}`}
              accessibilityRole="button"
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3 flex-row items-center shadow-sm shadow-slate-100 dark:shadow-none"
            >
              {/* Avatar */}
              <View className="w-14 h-14 bg-green-50 dark:bg-green-950/30 rounded-2xl items-center justify-center mr-4 border border-green-100 dark:border-green-900/50">
                <UtensilsCrossed size={24} color={GREEN} strokeWidth={2} />
              </View>
              {/* Info */}
              <View className="flex-1">
                <Text className="text-slate-800 dark:text-slate-100 font-bold text-sm" numberOfLines={1}>
                  {t.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <MapPin size={10} color="#94a3b8" strokeWidth={2} />
                  <Text className="text-slate-400 dark:text-slate-500 text-xs ml-1" numberOfLines={1}>
                    {t.address || 'Kantin Universitas'}
                  </Text>
                </View>
                <Text className="text-slate-500 dark:text-slate-400 text-xs leading-4 mt-1.5" numberOfLines={1}>
                  {t.description || 'Menu berkualitas untuk kebutuhan nutrisi harian'}
                </Text>
              </View>
              <ChevronRight size={18} color="#cbd5e1" strokeWidth={2} />
            </TouchableOpacity>
          ))
        )}
      </View>
      <View className="h-6" />
    </ScrollView>
  );
}

// ==========================================
// CALENDAR TAB
// ==========================================
function CalendarTab({
  selectedTenant,
  setSelectedTenant,
  cart,
}: {
  selectedTenant: Tenant | null;
  setSelectedTenant: (tenant: Tenant | null) => void;
  cart: any;
}) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    api.getTenants()
      .then((data) => {
        setTenants(data);
        if (!selectedTenant && data.length > 0) setSelectedTenant(data[0]);
      })
      .catch(console.error);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !selectedTenant) return;
    loadMenus();
  }, [selectedTenant, selectedDate, isAuthenticated]);

  const loadMenus = async () => {
    if (!selectedTenant) return;
    setLoading(true);
    try {
      const data = await api.getTenantMenus(selectedTenant.id, selectedDate);
      setMenus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (menu: Menu) => {
    if (!selectedTenant) return;
    const currentQty = cart.items.find(
      (item: any) => item.menu.id === menu.id && item.targetDate === selectedDate
    )?.quantity || 0;
    const remaining = menu.remainingQuota !== undefined ? menu.remainingQuota : menu.maxQuota;
    if (currentQty >= remaining) {
      Alert.alert('Gagal', 'Stok/Quota tidak mencukupi untuk ditambahkan ke keranjang.');
      return;
    }
    const { success, clearedPrevious } = cart.addToCart(menu, 1, selectedDate, selectedTenant.name);
    if (success) {
      showToast(`${menu.name} ditambahkan ke keranjang`);
      if (clearedPrevious) Alert.alert('Perhatian', 'Keranjang dari catering sebelumnya telah dihapus.');
      loadMenus();
    } else {
      Alert.alert('Gagal', 'Stok/Quota tidak mencukupi.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

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

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Toast */}
      {toastMessage && (
        <View className="absolute top-4 left-5 right-5 bg-slate-900/95 py-3 px-5 rounded-2xl z-50 flex-row items-center shadow-xl">
          <CheckCheck size={16} color="#22c55e" strokeWidth={2.5} />
          <Text className="text-white text-xs font-bold ml-2 flex-1">{toastMessage}</Text>
        </View>
      )}

      {/* Tenant Selector */}
      <View className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {tenants.map((t) => {
            const isActive = selectedTenant?.id === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setSelectedTenant(t)}
                activeOpacity={0.75}
                accessibilityLabel={`Pilih ${t.name}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                className={`px-4 py-2.5 rounded-full mr-2.5 border flex-row items-center gap-2 ${
                  isActive
                    ? 'bg-green-600 border-green-600'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <UtensilsCrossed size={12} color={isActive ? 'white' : '#94a3b8'} strokeWidth={2} />
                <Text className={`font-bold text-xs ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {t.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Date Selector - Gojek GoFood calendar style */}
      <View className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {dates.map((date) => {
            const isSelected = selectedDate === date;
            const isToday = date === new Date().toISOString().split('T')[0];
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
                  {isToday ? 'Hari Ini' : getDateShortMonth(date)}
                </Text>
                <Text className={`text-lg font-black mt-0.5 ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                  {getDateDay(date)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Menu List */}
      <ScrollView className="flex-1 px-4 pt-5" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-slate-800 dark:text-white font-extrabold text-base">Menu Tersedia</Text>
          <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
            {formatDateLabel(selectedDate)}
          </Text>
        </View>

        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={GREEN} />
          </View>
        ) : menus.length === 0 ? (
          <View className="items-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <UtensilsCrossed size={32} color="#cbd5e1" strokeWidth={1.5} />
            <Text className="text-slate-400 dark:text-slate-500 text-sm font-bold mt-4">
              Belum ada menu di tanggal ini
            </Text>
          </View>
        ) : (
          menus.map((m) => {
            const quota = m.remainingQuota !== undefined ? m.remainingQuota : m.maxQuota;
            const isOutOfStock = quota <= 0;
            return (
              <View
                key={m.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3 shadow-sm shadow-slate-100 dark:shadow-none"
              >
                <View className="flex-row items-start">
                  {/* Food Icon Placeholder */}
                  <View className="w-16 h-16 bg-green-50 dark:bg-green-950/30 rounded-2xl items-center justify-center mr-4 border border-green-100 dark:border-green-900/40">
                    <UtensilsCrossed size={24} color={GREEN} strokeWidth={2} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-800 dark:text-slate-100 font-bold text-sm" numberOfLines={1}>
                      {m.name}
                    </Text>
                    {m.description && (
                      <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-4" numberOfLines={2}>
                        {m.description}
                      </Text>
                    )}
                    {/* Price & Stock Row */}
                    <View className="flex-row items-center justify-between mt-3">
                      <Text className="text-green-600 dark:text-green-400 font-extrabold text-base">
                        Rp {m.price.toLocaleString('id-ID')}
                      </Text>
                      {/* Stock badge */}
                      <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${
                        isOutOfStock ? 'bg-red-50 dark:bg-red-950/30' : 'bg-slate-50 dark:bg-slate-800'
                      }`}>
                        {isOutOfStock ? (
                          <AlertTriangle size={10} color="#ef4444" strokeWidth={2.5} />
                        ) : (
                          <Package size={10} color="#94a3b8" strokeWidth={2} />
                        )}
                        <Text className={`text-[10px] font-bold ${isOutOfStock ? 'text-red-500' : 'text-slate-400'}`}>
                          {isOutOfStock ? 'Habis' : `${quota} sisa`}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Add to cart */}
                <TouchableOpacity
                  onPress={() => handleAddToCart(m)}
                  disabled={isOutOfStock}
                  activeOpacity={0.8}
                  accessibilityLabel={isOutOfStock ? 'Stok habis' : `Tambah ${m.name} ke keranjang`}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isOutOfStock }}
                  className={`mt-4 h-[44px] rounded-2xl items-center justify-center ${
                    isOutOfStock
                      ? 'bg-slate-100 dark:bg-slate-800'
                      : 'bg-green-600'
                  }`}
                  style={isOutOfStock ? {} : { shadowColor: GREEN, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4 }}
                >
                  <Text className={`font-bold text-sm ${isOutOfStock ? 'text-slate-400' : 'text-white'}`}>
                    {isOutOfStock ? 'Stok Habis' : '+ Tambah ke Keranjang'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}

// ==========================================
// CART TAB
// ==========================================
function CartTab({
  cart,
  onOrderCreated,
}: {
  cart: any;
  onOrderCreated: (orderId: string, totalAmount: number) => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;
    setSubmitting(true);
    try {
      const payload = {
        tenantId: cart.tenantId,
        items: cart.items.map((item: any) => ({
          menuId: item.menu.id,
          quantity: item.quantity,
          targetDate: item.targetDate,
        })),
      };
      const order = await api.createOrder(payload);
      cart.clearCart();
      onOrderCreated(order.id, order.totalAmount);
    } catch (err: any) {
      Alert.alert('Checkout Gagal', err.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl items-center justify-center mb-5">
          <ShoppingCart size={40} color="#cbd5e1" strokeWidth={1.5} />
        </View>
        <Text className="text-slate-800 dark:text-slate-100 text-xl font-extrabold mb-2">Keranjang Kosong</Text>
        <Text className="text-slate-400 dark:text-slate-500 text-sm text-center leading-6">
          Belum ada menu yang dipilih. Buka tab Menu Harian untuk memesan.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-4 pt-5" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-slate-800 dark:text-white font-extrabold text-xl">Keranjang</Text>
          <TouchableOpacity
            onPress={() => cart.clearCart()}
            accessibilityLabel="Kosongkan keranjang"
            accessibilityRole="button"
            className="flex-row items-center gap-1.5 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-xl"
          >
            <Trash2 size={12} color="#ef4444" strokeWidth={2.5} />
            <Text className="text-red-500 font-bold text-xs">Kosongkan</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold mb-6">
          Dari: {cart.tenantName}
        </Text>

        {cart.items.map((item: any) => (
          <View
            key={`${item.menu.id}-${item.targetDate}`}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3 shadow-sm shadow-slate-100 dark:shadow-none"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-green-50 dark:bg-green-950/30 rounded-2xl items-center justify-center mr-3 border border-green-100 dark:border-green-900/40">
                <UtensilsCrossed size={20} color={GREEN} strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-800 dark:text-slate-100 font-bold text-sm" numberOfLines={1}>
                  {item.menu.name}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <CalendarDays size={10} color="#94a3b8" strokeWidth={2} />
                  <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold ml-1">
                    Kirim: {item.targetDate}
                  </Text>
                </View>
              </View>
              <Text className="text-slate-800 dark:text-white font-extrabold text-sm">
                Rp {(item.menu.price * item.quantity).toLocaleString('id-ID')}
              </Text>
            </View>

            {/* Quantity Control */}
            <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
              <Text className="text-slate-400 dark:text-slate-500 text-xs">
                @Rp {item.menu.price.toLocaleString('id-ID')}
              </Text>
              <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-1 border border-slate-100 dark:border-slate-700">
                <TouchableOpacity
                  onPress={() => cart.updateQuantity(item.menu.id, item.targetDate, item.quantity - 1)}
                  accessibilityLabel="Kurangi jumlah"
                  accessibilityRole="button"
                  className="w-8 h-8 bg-white dark:bg-slate-700 rounded-xl items-center justify-center border border-slate-100 dark:border-slate-600"
                >
                  <Minus size={12} color="#374151" strokeWidth={2.5} />
                </TouchableOpacity>
                <Text className="px-4 text-slate-800 dark:text-white font-black text-sm">{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => cart.updateQuantity(item.menu.id, item.targetDate, item.quantity + 1)}
                  accessibilityLabel="Tambah jumlah"
                  accessibilityRole="button"
                  className="w-8 h-8 bg-white dark:bg-slate-700 rounded-xl items-center justify-center border border-slate-100 dark:border-slate-600"
                >
                  <Plus size={12} color="#374151" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        <View className="h-4" />
      </ScrollView>

      {/* Sticky Checkout Bar */}
      <SafeAreaView edges={['bottom']} className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-5 pt-4 pb-2">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Total Pembayaran</Text>
          <Text className="text-green-600 dark:text-green-400 font-extrabold text-xl">
            Rp {cart.getTotalAmount().toLocaleString('id-ID')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={submitting}
          activeOpacity={0.85}
          accessibilityLabel="Pesan Sekarang"
          accessibilityRole="button"
          className="bg-green-600 h-[52px] rounded-2xl items-center justify-center"
          style={{ shadowColor: GREEN, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-extrabold text-base">Pesan Sekarang</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

// ==========================================
// ORDERS TAB
// ==========================================
function OrdersTab({ onPayPending }: { onPayPending: (orderId: string, totalAmount: number) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PAID':
        return { label: 'Dibayar', color: 'text-green-700 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50', Icon: CheckCheck, iconColor: '#15803d' };
      case 'PREPARING':
        return { label: 'Sedang Dibuat', color: 'text-orange-700 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50', Icon: ChefHat, iconColor: '#ea580c' };
      case 'SHIPPED':
        return { label: 'Sedang Dikirim', color: 'text-blue-700 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50', Icon: Clock, iconColor: '#2563eb' };
      case 'COMPLETED':
        return { label: 'Selesai', color: 'text-green-700 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50', Icon: CheckCheck, iconColor: '#15803d' };
      case 'CANCELLED':
        return { label: 'Dibatalkan', color: 'text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50', Icon: XCircle, iconColor: '#dc2626' };
      case 'FAILED':
        return { label: 'Gagal', color: 'text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50', Icon: XCircle, iconColor: '#dc2626' };
      default:
        return { label: 'Menunggu', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50', Icon: Clock, iconColor: '#d97706' };
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-4 pt-5" showsVerticalScrollIndicator={false}>
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-slate-800 dark:text-white font-extrabold text-xl">Pesanan Saya</Text>
        <TouchableOpacity
          onPress={loadOrders}
          accessibilityLabel="Refresh pesanan"
          accessibilityRole="button"
          className="flex-row items-center gap-1 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-xl"
        >
          <CheckCheck size={12} color={GREEN} strokeWidth={2.5} />
          <Text className="text-green-600 dark:text-green-400 font-bold text-xs">Refresh</Text>
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View className="items-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <ClipboardList size={32} color="#cbd5e1" strokeWidth={1.5} />
          <Text className="text-slate-400 dark:text-slate-500 text-sm font-bold mt-4">Belum ada transaksi</Text>
        </View>
      ) : (
        orders.map((order) => {
          const { label, color, Icon: StatusIcon, iconColor } = getStatusConfig(order.status || order.paymentStatus);
          return (
            <View
              key={order.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-3 shadow-sm shadow-slate-100 dark:shadow-none"
            >
              {/* Order Header */}
              <View className="flex-row justify-between items-start mb-3 pb-3 border-b border-slate-50 dark:border-slate-800">
                <View className="flex-row items-center gap-3 flex-1 pr-3">
                  <View className="w-10 h-10 bg-green-50 dark:bg-green-950/30 rounded-2xl items-center justify-center border border-green-100 dark:border-green-900/40">
                    <UtensilsCrossed size={18} color={GREEN} strokeWidth={2} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-800 dark:text-slate-100 font-bold text-sm" numberOfLines={1}>
                      {order.tenant.name}
                    </Text>
                    <Text className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">
                      {new Date(order.orderDate).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
                <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full border ${color}`}>
                  <StatusIcon size={10} color={iconColor} strokeWidth={2.5} />
                  <Text className={`text-[10px] font-extrabold uppercase`}>{label}</Text>
                </View>
              </View>

              {/* Items */}
              {order.orderItems.map((item) => (
                <View key={item.id} className="flex-row justify-between items-center mb-2">
                  <Text className="text-slate-600 dark:text-slate-400 text-xs flex-1 pr-2" numberOfLines={1}>
                    {item.quantity}x {item.menu.name}
                  </Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                    Rp {(item.menu.price * item.quantity).toLocaleString('id-ID')}
                  </Text>
                </View>
              ))}

              {/* Total */}
              <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold">Total</Text>
                <Text className="text-slate-800 dark:text-white font-extrabold text-sm">
                  Rp {order.totalAmount.toLocaleString('id-ID')}
                </Text>
              </View>

              {/* Pay Button */}
              {order.paymentStatus === 'PENDING' && (
                <TouchableOpacity
                  onPress={() => onPayPending(order.id, order.totalAmount)}
                  activeOpacity={0.85}
                  accessibilityLabel="Bayar Sekarang"
                  accessibilityRole="button"
                  className="bg-green-600 h-[44px] rounded-2xl items-center justify-center mt-4"
                  style={{ shadowColor: GREEN, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
                >
                  <Text className="text-white font-bold text-sm">Bayar Sekarang</Text>
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
