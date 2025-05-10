import React from 'react';
import { useLocation } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResultsPage = () => {
  const query = useQuery().get('q')?.toLowerCase() || '';
  const results = products.filter(
    p =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Results for "{query}"</h1>
      {results.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage; 