import React from 'react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

const PersonalCarePage = () => {
  const personalCare = products.filter(p => p.category === 'Personal Care');
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Personal Care</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {personalCare.map(product => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default PersonalCarePage; 