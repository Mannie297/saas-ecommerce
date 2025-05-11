import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

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

// Map image names to imported images
const getImageSource = (imageName: string) => {
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
    'poundonsoup.jpg': poundonsoup
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

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, totalPrice, isLoading, error } = useCart();
  const { isAuthenticated } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    navigate('/checkout');
  };

  const handleGuestCheckout = () => {
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start p-4 border-b last:border-b-0"
              >
                <img
                  src={getImageSource(item.image)}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = logo;
                    e.currentTarget.className = "w-24 h-24 object-contain p-4 bg-gray-100 rounded";
                  }}
                />
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                    </div>
                    <p className="text-lg font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center mt-4">
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border-r hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border-l hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-4 text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div key="subtotal" className="flex justify-between">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div key="shipping" className="flex justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div key="total" className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
            {isAuthenticated ? (
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleGuestCheckout}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Continue as Guest
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gray-100 text-gray-800 py-2 rounded hover:bg-gray-200"
                >
                  Sign in to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Continue as Guest?</h2>
            <p className="text-gray-600 mb-4">
              You can checkout as a guest or sign in to save your information for future purchases.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                key="cancel"
                onClick={() => setShowLoginPrompt(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                key="continue"
                onClick={handleGuestCheckout}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage; 