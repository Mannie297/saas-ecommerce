import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

interface CartItem {
  id: string; // This will be the MongoDB ObjectId
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken, isAuthenticated } = useAuth();

  // Load cart items from API when authenticated
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!isAuthenticated) {
        // If not authenticated, load from localStorage
        const savedCart = localStorage.getItem('cart');
        setItems(savedCart ? JSON.parse(savedCart) : []);
        setIsLoading(false);
        return;
      }

      try {
        const token = getToken();
        if (!token) throw new Error('No authentication token');

        const response = await fetch(`${API_URL}/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cart items');
        }

        const data = await response.json();
        setItems(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cart');
        // Fallback to localStorage if API fails
        const savedCart = localStorage.getItem('cart');
        setItems(savedCart ? JSON.parse(savedCart) : []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [isAuthenticated, getToken]);

  // Save to localStorage when items change and user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    try {
      if (isAuthenticated) {
        const token = getToken();
        if (!token) throw new Error('No authentication token');

        const response = await fetch(`${API_URL}/cart/add`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            productId: item.id,
            quantity: 1
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add item to cart');
        }
      }

      setItems((prevItems) => {
        const existingItem = prevItems.find((i) => i.id === item.id);
        if (existingItem) {
          return prevItems.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prevItems, { ...item, quantity: 1 }];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
      throw err;
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      if (isAuthenticated) {
        const token = getToken();
        if (!token) throw new Error('No authentication token');

        const response = await fetch(`${API_URL}/cart/remove`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId: id }),
        });

        if (!response.ok) {
          throw new Error('Failed to remove item from cart');
        }
      }

      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
      throw err;
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(id);
      return;
    }

    try {
      if (isAuthenticated) {
        const token = getToken();
        if (!token) throw new Error('No authentication token');

        const response = await fetch(`${API_URL}/cart/update`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId: id, quantity }),
        });

        if (!response.ok) {
          throw new Error('Failed to update cart item quantity');
        }
      }

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart item quantity');
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        const token = getToken();
        if (!token) throw new Error('No authentication token');

        const response = await fetch(`${API_URL}/cart/clear`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to clear cart');
        }
      }

      setItems([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
      throw err;
    }
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isLoading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 