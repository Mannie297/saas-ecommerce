import { Order } from '../types/order';
import { API_URL } from '../config';

export const getOrders = async (): Promise<Order[]> => {
  const response = await fetch(`${API_URL}/orders`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  const data = await response.json();
  return data.map((order: any) => ({
    ...order,
    _id: order._id.toString(),
    userId: {
      ...order.userId,
      _id: order.userId._id.toString()
    },
    items: order.items.map((item: any) => ({
      ...item,
      _id: item._id.toString(),
      productId: item.productId._id.toString()
    }))
  }));
};

export const createOrder = async (orderData: any): Promise<Order> => {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });

  if (!response.ok) {
    throw new Error('Failed to create order');
  }

  const data = await response.json();
  return {
    ...data,
    _id: data._id.toString(),
    userId: {
      ...data.userId,
      _id: data.userId._id.toString()
    },
    items: data.items.map((item: any) => ({
      ...item,
      _id: item._id.toString(),
      productId: item.productId._id.toString()
    }))
  };
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<Order> => {
  const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    throw new Error('Failed to update order status');
  }

  const data = await response.json();
  return {
    ...data,
    _id: data._id.toString(),
    userId: {
      ...data.userId,
      _id: data.userId._id.toString()
    },
    items: data.items.map((item: any) => ({
      ...item,
      _id: item._id.toString(),
      productId: item.productId._id.toString()
    }))
  };
}; 