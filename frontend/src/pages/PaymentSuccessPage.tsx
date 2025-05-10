import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="text-center">
              <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
                Payment Successful!
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                Thank you for your purchase. Your order has been confirmed.
              </p>
            </div>

            {order && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
                <dl className="mt-4 space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                    <dd className="text-sm text-gray-900">{order._id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                    <dd className="text-sm text-gray-900">${order.total.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm text-gray-900 capitalize">{order.status}</dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => navigate('/orders')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Orders
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 