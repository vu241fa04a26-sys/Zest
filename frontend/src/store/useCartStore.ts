import { create } from 'zustand';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  isVeg: boolean;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  initializeCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addToCart: (item) => {
    const currentItems = get().items;
    const existingItem = currentItems.find((i) => i.id === item.id);
    let newItems;
    if (existingItem) {
      newItems = currentItems.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newItems = [...currentItems, { ...item, quantity: 1 }];
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('zest_cart', JSON.stringify(newItems));
    }
    set({ items: newItems });
  },
  removeFromCart: (itemId) => {
    const newItems = get().items.filter((i) => i.id !== itemId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zest_cart', JSON.stringify(newItems));
    }
    set({ items: newItems });
  },
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(itemId);
      return;
    }
    const newItems = get().items.map((i) =>
      i.id === itemId ? { ...i, quantity } : i
    );
    if (typeof window !== 'undefined') {
      localStorage.setItem('zest_cart', JSON.stringify(newItems));
    }
    set({ items: newItems });
  },
  clearCart: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zest_cart');
    }
    set({ items: [] });
  },
  getCartTotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  getCartCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
  initializeCart: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('zest_cart');
    if (stored) {
      try {
        set({ items: JSON.parse(stored) });
      } catch (e) {
        localStorage.removeItem('zest_cart');
      }
    }
  }
}));
