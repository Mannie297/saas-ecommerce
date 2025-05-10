import React from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useProduct } from '../context/ProductContext';

// Map URL slugs to actual category names in the database
const categoryMapping: { [key: string]: string } = {
  'best-sellers': 'Best Sellers',
  'meat-seafood': 'Meat & Seafood',
  'groceries': 'Groceries',
  'drinks': 'Drinks',
  'snacks': 'Snacks',
  'personal-care': 'Personal Care',
  'clearance': 'Clearance',
};

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { products, isLoading, error } = useProduct();
  
  // Get the actual category name from the mapping
  const categoryName = categoryMapping[categoryId || ''] || 'Category';
  
  // Filter products by exact category name match
  const categoryProducts = products.filter(
    product => product.category === categoryName
  );

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>;
  }

  if (error) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">{categoryName}</h1>
      
      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoryProducts.map((product) => (
            <ProductCard 
              key={product._id} 
              _id={product._id}
              name={product.name}
              price={product.price}
              image={product.image}
              category={product.category}
              description={product.description}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No products found in this category.</p>
          <p className="text-sm text-gray-500 mt-2">Category: {categoryName}</p>
          <p className="text-sm text-gray-500 mt-2">Available Categories: {[...new Set(products.map(p => p.category))].join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage; 