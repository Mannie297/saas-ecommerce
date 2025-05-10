export interface OrderItem {
  _id?: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
}

export interface Order {
  _id?: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  total: number;
  shippingAddress: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  paymentDetails: {
    stripePaymentId: string;
    tipAmount: number;
    shippingCost: number;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date?: string;
} 