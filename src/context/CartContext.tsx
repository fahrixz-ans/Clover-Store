import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, lisensi: string) => void;
  updateQuantity: (productId: string, lisensi: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clover_cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const saveToStorage = useCallback((newItems: CartItem[]) => {
    localStorage.setItem('clover_cart', JSON.stringify(newItems));
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        i => i.productId === item.productId && i.lisensi === item.lisensi
      );
      let newItems;
      if (existingIndex >= 0) {
        newItems = [...prev];
        newItems[existingIndex].quantity += item.quantity;
      } else {
        newItems = [...prev, item];
      }
      saveToStorage(newItems);
      return newItems;
    });
  }, [saveToStorage]);

  const removeFromCart = useCallback((productId: string, lisensi: string) => {
    setItems(prev => {
      const newItems = prev.filter(
        i => !(i.productId === productId && i.lisensi === lisensi)
      );
      saveToStorage(newItems);
      return newItems;
    });
  }, [saveToStorage]);

  const updateQuantity = useCallback((productId: string, lisensi: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, lisensi);
      return;
    }
    setItems(prev => {
      const newItems = prev.map(item =>
        item.productId === productId && item.lisensi === lisensi
          ? { ...item, quantity }
          : item
      );
      saveToStorage(newItems);
      return newItems;
    });
  }, [saveToStorage, removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    saveToStorage([]);
  }, [saveToStorage]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.harga * item.quantity, 0);

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
