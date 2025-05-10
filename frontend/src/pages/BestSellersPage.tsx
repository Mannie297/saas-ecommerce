import React from 'react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

const BestSellersPage = () => {
  const bestSellers = products.filter(p => p.category === 'Best Sellers');
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Best Sellers</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {bestSellers.map(product => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default BestSellersPage; 