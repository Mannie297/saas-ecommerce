import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Order, OrderItem } from '../types/order';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, '_id' | 'date'>) => Promise<void>;
  getOrder: (id: string) => Promise<Order | undefined>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  getUserOrders: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, getToken, isAuthenticated } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchOrders = async () => {
    if (!user) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      const endpoint = user.role === 'admin' ? '/orders' : '/orders/user';
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const addOrder = async (order: Omit<Order, '_id' | 'date'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const newOrder = await response.json();
      setOrders(prev => [...prev, newOrder]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  const getOrder = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/orders/${id}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required to update order status');
    }

    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required to update order status');
      }

      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status } : order
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required to delete order');
    }

    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required to delete order');
      }

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete order');
      }
      
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserOrders = async () => {
    if (!isAuthenticated) {
      throw new Error('Authentication required to view user orders');
    }

    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required to view user orders');
      }

      const response = await fetch(`${API_URL}/orders/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user orders');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        getOrder,
        updateOrderStatus,
        deleteOrder,
        getUserOrders,
        isLoading,
        error,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}; 