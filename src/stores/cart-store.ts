import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  image?: string;
  category?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (i) => i.productId === item.productId
        );
        if (existingIndex > -1) {
          const newItems = [...items];
          newItems[existingIndex].quantity += item.quantity;
          set({ items: newItems });
        } else {
          set({
            items: [
              ...items,
              { ...item, id: `cart-${Date.now()}-${Math.random().toString(36).slice(2)}` },
            ],
          });
        }
      },
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'berkat-cart',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as { items?: Array<Record<string, unknown>> };
        const items = Array.isArray(state.items)
          ? state.items.flatMap((item) => {
              if (typeof item.productId !== 'string' || typeof item.name !== 'string') return [];
              return [{
                id: typeof item.id === 'string' ? item.id : `quote-${item.productId}`,
                productId: item.productId,
                name: item.name,
                quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
                image: typeof item.image === 'string' ? item.image : undefined,
                category: typeof item.category === 'string' ? item.category : undefined,
              }];
            })
          : [];
        return { ...state, items, isOpen: false } as CartState;
      },
    }
  )
);
