import { create } from 'zustand';

interface Menu {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  price: number;
  maxQuota: number;
  availableAt: string;
  remainingQuota?: number;
}

export interface CartItem {
  menu: Menu;
  quantity: number;
  targetDate: string;
}

interface CartState {
  items: CartItem[];
  tenantId: string | null;
  tenantName: string | null;
  addToCart: (menu: Menu, quantity: number, targetDate: string, tenantName: string) => { success: boolean; clearedPrevious?: boolean };
  removeFromCart: (menuId: string, targetDate: string) => void;
  updateQuantity: (menuId: string, targetDate: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  tenantId: null,
  tenantName: null,

  addToCart: (menu, quantity, targetDate, tenantName) => {
    const { items, tenantId } = get();
    let clearedPrevious = false;

    // If cart has items from a different tenant, clear the cart first
    if (tenantId && tenantId !== menu.tenantId) {
      clearedPrevious = true;
      console.log(`Clearing cart from tenant ${tenantId} to add menu from new tenant ${menu.tenantId}`);
    }

    const currentItems = clearedPrevious ? [] : [...items];

    // Find if item already exists in the cart for the same menu and date
    const existingIndex = currentItems.findIndex(
      (item) => item.menu.id === menu.id && item.targetDate === targetDate
    );

    if (existingIndex > -1) {
      // Update quantity
      const existingItem = currentItems[existingIndex];
      const newQuantity = existingItem.quantity + quantity;
      
      // Check quota limit
      const quotaLimit = menu.remainingQuota !== undefined ? menu.remainingQuota : menu.maxQuota;
      if (newQuantity > quotaLimit) {
        return { success: false, clearedPrevious };
      }

      currentItems[existingIndex] = {
        ...existingItem,
        quantity: newQuantity,
      };
    } else {
      // Check quota limit for new item
      const quotaLimit = menu.remainingQuota !== undefined ? menu.remainingQuota : menu.maxQuota;
      if (quantity > quotaLimit) {
        return { success: false, clearedPrevious };
      }

      currentItems.push({
        menu,
        quantity,
        targetDate,
      });
    }

    set({
      items: currentItems,
      tenantId: menu.tenantId,
      tenantName: tenantName,
    });

    return { success: true, clearedPrevious };
  },

  removeFromCart: (menuId, targetDate) => {
    const { items } = get();
    const updatedItems = items.filter(
      (item) => !(item.menu.id === menuId && item.targetDate === targetDate)
    );

    if (updatedItems.length === 0) {
      set({ items: [], tenantId: null, tenantName: null });
    } else {
      set({ items: updatedItems });
    }
  },

  updateQuantity: (menuId, targetDate, quantity) => {
    const { items } = get();
    if (quantity <= 0) {
      get().removeFromCart(menuId, targetDate);
      return;
    }

    const updatedItems = items.map((item) => {
      if (item.menu.id === menuId && item.targetDate === targetDate) {
        const quotaLimit = item.menu.remainingQuota !== undefined ? item.menu.remainingQuota : item.menu.maxQuota;
        const validQuantity = Math.min(quantity, quotaLimit);
        return { ...item, quantity: validQuantity };
      }
      return item;
    });

    set({ items: updatedItems });
  },

  clearCart: () => {
    set({ items: [], tenantId: null, tenantName: null });
  },

  getTotalAmount: () => {
    return get().items.reduce((sum, item) => sum + item.menu.price * item.quantity, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
