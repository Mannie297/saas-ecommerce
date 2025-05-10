import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
//import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { API_URL } from '../config';

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
  if (imageName.startsWith('data:') || imageName.startsWith('blob:')) {
    return imageName;
  }

  const cleanImageName = imageName.replace('/images/', '');

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

// Validate and initialize Stripe
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Validate the Stripe key format
const isValidStripeKey = STRIPE_PUBLISHABLE_KEY && 
  STRIPE_PUBLISHABLE_KEY.startsWith('pk_') && 
  STRIPE_PUBLISHABLE_KEY.length > 20;

if (!isValidStripeKey) {
  console.error('Invalid or missing Stripe publishable key:', {
    key: STRIPE_PUBLISHABLE_KEY,
    isValid: isValidStripeKey,
    startsWithPk: STRIPE_PUBLISHABLE_KEY?.startsWith('pk_'),
    keyLength: STRIPE_PUBLISHABLE_KEY?.length
  });
}

// Initialize Stripe with error handling
const stripePromise = isValidStripeKey 
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

// Format price in CAD
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { getToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'CA'
  });
  const [selectedTip, setSelectedTip] = useState<number | null>(null);

  // Calculate subtotal
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  
  // Calculate shipping cost (example: $5.99 flat rate)
  const shippingCost = 5.99;
  
  // Calculate tip amount
  const tipAmount = (subtotal * (selectedTip || 0)) / 100;
  
  // Calculate total with shipping and tip
  const total = subtotal + shippingCost + tipAmount;

  // Add useEffect to check Stripe initialization
  useEffect(() => {
    if (!isValidStripeKey) {
      console.error('Stripe failed to initialize - invalid or missing publishable key');
      setError('Payment system is not available. Please check your configuration.');
    }
  }, []); // Only check on mount

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      if (!stripe || !elements) {
        throw new Error('Stripe not initialized');
      }

      // First create a payment intent
      const intentResponse = await fetch(`${API_URL}/orders/payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: total,
          currency: 'cad',
          email: formData.email // Add email for guest checkout
        })
      });

      if (!intentResponse.ok) {
        const errorData = await intentResponse.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const { clientSecret } = await intentResponse.json();

      // Confirm the card payment
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: formData.name,
            email: formData.email,
            address: {
              line1: formData.street,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: formData.country
            }
          }
        }
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      if (!paymentIntent) {
        throw new Error('Payment failed');
      }

      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: {
          name: formData.name,
          email: formData.email,
          address: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: 'card',
        paymentDetails: {
          stripePaymentId: paymentIntent.id,
          shippingCost: shippingCost,
          tipAmount: selectedTip ? (subtotal * selectedTip) / 100 : 0
        },
        total: total
      };

      // Prepare headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      // Only add Authorization header if user is authenticated
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const order = await response.json();
      clearCart();
      navigate('/payment-success', { state: { order } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="street" className="block text-sm font-medium text-gray-700">
          Street
        </label>
        <input
          type="text"
          id="street"
          name="street"
          required
          value={formData.street}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
          City
        </label>
        <input
          type="text"
          id="city"
          name="city"
          required
          value={formData.city}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
          Province
        </label>
        <input
          type="text"
          id="state"
          name="state"
          required
          value={formData.state}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
          Postal Code
        </label>
        <input
          type="text"
          id="zipCode"
          name="zipCode"
          required
          value={formData.zipCode}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
          Country
        </label>
        <input
          type="text"
          id="country"
          name="country"
          value="Canada"
          disabled
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 cursor-not-allowed"
        />
      </div>
      
      <div>
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700">
          Credit Card
        </label>
        <div className="mt-1 p-3 border border-gray-300 rounded-md">
          <CardElement
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add a Tip
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSelectedTip(10)}
            className={`flex-1 py-2 px-4 rounded-md border ${
              selectedTip === 10 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'border-gray-300 hover:border-blue-500'
            }`}
          >
            10%
          </button>
          <button
            type="button"
            onClick={() => setSelectedTip(25)}
            className={`flex-1 py-2 px-4 rounded-md border ${
              selectedTip === 25 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'border-gray-300 hover:border-blue-500'
            }`}
          >
            25%
          </button>
          <button
            type="button"
            onClick={() => setSelectedTip(50)}
            className={`flex-1 py-2 px-4 rounded-md border ${
              selectedTip === 50 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'border-gray-300 hover:border-blue-500'
            }`}
          >
            50%
          </button>
        </div>
      </div>

      {error && <div className="text-red-600">{error}</div>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        disabled={processing || !stripe || !elements}
      >
        {processing ? 'Processing...' : `Pay ${formatPrice(total)}`}
      </button>
    </form>
  );
};

const CheckoutPage = () => {
  const { items } = useCart();
 // const { addOrder } = useOrder();
  const [selectedTip] = useState<number>(0);

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate shipping cost
  const shippingCost = 5.99;
  
  // Calculate tip amount
  const tipAmount = (subtotal * selectedTip) / 100;
  
  // Calculate total with shipping and tip
  const total = subtotal + shippingCost + tipAmount;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
            <CheckoutForm />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={getImageSource(item.image)}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = logo;
                        e.currentTarget.className = "w-16 h-16 object-contain p-4 bg-gray-100 rounded";
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Shipping</span>
                  <span className="text-sm text-gray-900">{formatPrice(shippingCost)}</span>
                </div>
                {selectedTip > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tip ({selectedTip}%)</span>
                    <span className="text-sm text-gray-900">{formatPrice(tipAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-base font-medium text-gray-900">Total</span>
                  <span className="text-base font-medium text-gray-900">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
};

export default CheckoutPage; 