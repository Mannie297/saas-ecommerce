import React, { useEffect, useState } from 'react';
import { Order } from '../types/order';
import { formatDate } from '../utils/dateUtils';
import { getOrders, updateOrderStatus } from '../services/orderService';
import { useOrder } from '../context/OrderContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Import all images
import meatSeafood from '../assets/meatSeafood.jpg';
import groceries from '../assets/groceries.jpg';
import drinks from '../assets/drinks.jpg';
import fish from '../assets/fish.jpg';
import clearanceOil from '../assets/clearanceOil.jpg';
import cocaCola from '../assets/cocaCola.jpg';
import chips from '../assets/chips.jpg';
import chinchin from '../assets/chinchin.jpg';
import soap from '../assets/soap.jpg';
import lotion from '../assets/lotion.jpg';
import clearanceRice from '../assets/clearanceRice.jpg';
import clearance from '../assets/clearance.jpg';
import logo from '../assets/logo.png';

import jollofchicken from '../assets/jollofchicken.jpg';
import friedrice from '../assets/friedrice.jpg';
import plantain from '../assets/plantain.jpg';
import poundoegusi from '../assets/poundoegusi.jpg';
import puffpuff from '../assets/puffpuff.jpg';
import meatpie from '../assets/meatpie.jpg';
import jollofrice from '../assets/jollofrice.jpg';
import peppersoup from '../assets/peppersoup.jpg';
import pepperedchicken from '../assets/pepperedchicken.jpg';
import moimoi from '../assets/moimoi.jpg';
import ofadarice from '../assets/ofadarice.jpg';
import poundonsoup from '../assets/poundonsoup.jpg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Map image names to imported images
const getImageSource = (imageName: string | undefined) => {
  if (!imageName) {
    return logo;
  }

  if (imageName.startsWith('data:') || imageName.startsWith('blob:')) {
    return imageName;
  }

  const cleanImageName = imageName.replace('/images/', '');

  const imageMap: { [key: string]: string } = {
    'meatSeafood.jpg': meatSeafood,
    'groceries.jpg': groceries,
    'drinks.jpg': drinks,
    'fish.jpg': fish,
    'clearanceOil.jpg': clearanceOil,
    'cocaCola.jpg': cocaCola,
    'chips.jpg': chips,
    'chinchin.jpg': chinchin,
    'soap.jpg': soap,
    'lotion.jpg': lotion,
    'clearanceRice.jpg': clearanceRice,
    'clearance.jpg': clearance,
    'jollofchicken.jpg': jollofchicken,
    'friedrice.jpg': friedrice,
    'plantain.jpg': plantain,
    'poundoegusi.jpg': poundoegusi,
    'puffpuff.jpg': puffpuff,
    'meatpie.jpg': meatpie,
    'jollofrice.jpg': jollofrice,
    'peppersoup.jpg': peppersoup,
    'pepperedchicken.jpg': pepperedchicken,
    'moimoi.jpg': moimoi,
    'ofadarice.jpg': ofadarice,
    'poundonsoup.jpg': poundonsoup
  };

  if (imageMap[cleanImageName]) {
    return imageMap[cleanImageName];
  }

  const partialMatch = Object.keys(imageMap).find(key => 
    cleanImageName.toLowerCase().includes(key.toLowerCase().replace('.jpg', ''))
  );

  if (partialMatch) {
    return imageMap[partialMatch];
  }

  return logo;
};

const exportOrdersToExcel = (orders: Order[]) => {
  const ws = XLSX.utils.json_to_sheet(orders.map(order => ({
    OrderID: order._id,
    CustomerName: order.userId?.name || order.shippingAddress.name || 'Guest',
    CustomerEmail: order.userId?.email || order.shippingAddress.email || '',
    ShippingName: order.shippingAddress.name,
    ShippingEmail: order.shippingAddress.email,
    ShippingAddress: order.shippingAddress.address,
    ShippingCity: order.shippingAddress.city,
    ShippingState: order.shippingAddress.state,
    ShippingZipCode: order.shippingAddress.zipCode,
    Status: order.status,
    Total: order.total,
    Tip: order.paymentDetails?.tipAmount || 0,
    Date: order.date,
    Items: order.items.map(i => `${i.productId?.name || ''} (x${i.quantity})`).join(', ')
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'orders.xlsx');
};

const exportUsersToExcel = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const users = await res.json();
  const ws = XLSX.utils.json_to_sheet(users.map((user: { _id: string; name: string; email: string; role: string }) => ({
    UserID: user._id,
    Name: user.name,
    Email: user.email,
    Role: user.role
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Users');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'users.xlsx');
};

const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus: updateOrderStatusContext, deleteOrder } = useOrder();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatusContext(orderId, newStatus);
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    setDeletingOrderId(orderId);
    try {
      await deleteOrder(orderId);
    } catch (err) {
      setError('Failed to delete order');
    } finally {
      setDeletingOrderId(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Orders</h1>
      <div className="flex gap-4 mb-6">
        <button onClick={() => exportOrdersToExcel(orders)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Export Orders to Excel
        </button>
        <button onClick={exportUsersToExcel} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Export Users to Excel
        </button>
      </div>
      <div className="grid gap-6">
        {orders.map(order => (
          <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">Order #{order._id?.slice(-6)}</h2>
                <p className="text-gray-600">{order.date ? formatDate(order.date) : 'Date not available'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {order.status}
                </span>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order._id!, e.target.value as Order['status'])}
                  className="border rounded px-2 py-1"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
                <button
                  className={`ml-2 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={order.status !== 'delivered' || deletingOrderId === order._id}
                  onClick={() => handleDelete(order._id!)}
                  title={order.status !== 'delivered' ? 'Can only delete delivered orders' : 'Delete order'}
                >
                  {deletingOrderId === order._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                {order.userId && order.userId.name ? (
                  <>
                    <p>{order.userId.name}</p>
                    <p>{order.userId.email}</p>
                  </>
                ) : (
                  <p>Guest Order</p>
                )}
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <p>{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map(item => (
                    <div key={item._id} className="flex items-center gap-4">
                      <img
                        src={getImageSource(item.productId?.image)}
                        alt={item.productId?.name || 'Product image'}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = logo;
                          e.currentTarget.className = "w-16 h-16 object-contain p-4 bg-gray-100 rounded";
                        }}
                      />
                      <div>
                        <p className="font-medium">{item.productId?.name || 'Unknown Product'}</p>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-gray-600">${(item.productId?.price || 0).toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="font-semibold">Total: ${order.total.toFixed(2)}</p>
                  <p className="text-gray-600">Payment Method: {order.paymentMethod}</p>
                  {order.paymentDetails && (
                    <>
                      <p className="text-gray-600">Stripe Payment ID: {order.paymentDetails.stripePaymentId}</p>
                      <p className="text-gray-600">Shipping Cost: ${order.paymentDetails.shippingCost?.toFixed(2) || '0.00'}</p>
                      <p className="text-gray-600">Tip Amount: ${order.paymentDetails.tipAmount?.toFixed(2) || '0.00'}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrdersPage; 