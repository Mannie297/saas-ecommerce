import { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { Link } from 'react-router-dom';
import { Order } from '../types/order';

// Import all images
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
import yam from '../assets/yam.jpg';
import turkey from '../assets/turkey.jpg';

// Map image names to imported images
const getImageSource = (imageName: string | undefined) => {
  // If imageName is undefined or null, return the logo
  if (!imageName) {
    return logo;
  }

  // If the image is already an imported image (starts with data: or blob:), return it as is
  if (imageName.startsWith('data:') || imageName.startsWith('blob:')) {
    return imageName;
  }

  // Remove /images/ prefix if present
  const cleanImageName = imageName.replace('/images/', '');

  // Map image filenames to imported images
  const imageMap: { [key: string]: string } = {
    'jollofchicken.jpg': jollofchicken,
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
    'poundonsoup.jpg': poundonsoup,
    'yam.jpg': yam,
    'turkey.jpg': turkey
  };

  // If the image is a filename, return the corresponding imported image
  if (imageMap[cleanImageName]) {
    return imageMap[cleanImageName];
  }

  // If no match found, try to find a partial match
  const partialMatch = Object.keys(imageMap).find(key => 
    cleanImageName.toLowerCase().includes(key.toLowerCase().replace('.jpg', ''))
  );

  if (partialMatch) {
    return imageMap[partialMatch];
  }

  return logo;
};

const OrderList: React.FC<{ orders: Order[] }> = ({ orders }) => (
  <div className="space-y-6">
    {orders.map((order: Order) => (
      <div key={order._id} className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold">Order #{order._id}</h2>
            <p className="text-gray-600 text-sm">
              Placed on {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Items</h3>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
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
                    <p className="text-sm font-medium text-gray-900">{item.productId?.name || 'Unknown Product'}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  ${((item.productId?.price || 0) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Shipping Address</h3>
              <p className="text-sm text-gray-500">
                {order.shippingAddress.name}<br />
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Total</p>
              <p className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const OrdersPage = () => {
  const { orders } = useOrder();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  console.log('orders:', orders);

  const currentOrders = orders.filter(order =>
    ['pending', 'processing', 'shipped'].includes(order.status)
  );
  const historyOrders = orders.filter(order =>
    ['delivered', 'cancelled'].includes(order.status.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="flex mb-6">
        <button
          className={`px-4 py-2 rounded-t ${activeTab === 'current' ? 'bg-white font-bold' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('current')}
        >
          My Orders
        </button>
        <button
          className={`px-4 py-2 rounded-t ml-2 ${activeTab === 'history' ? 'bg-white font-bold' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('history')}
        >
          Order History
        </button>
      </div>
      {activeTab === 'current' ? (
        currentOrders.length > 0 ? (
          <OrderList orders={currentOrders} />
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">You haven't placed any current orders yet.</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </div>
        )
      ) : (
        historyOrders.length > 0 ? (
          <OrderList orders={historyOrders} />
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">You have no order history yet.</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </div>
        )
      )}
    </div>
  );
};

export default OrdersPage; 