import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as staticProducts } from '../data/products';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

interface ProductContextType {
  products: Product[];
  getProduct: (id: string) => Product | undefined;
  isLoading: boolean;
  error: string | null;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with static products
  const [products, setProducts] = useState<Product[]>(staticProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure API_URL doesn't end with a slash
  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = `${API_URL}/products`;
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('API Error:', errorData);
          throw new Error(errorData?.message || 'Failed to fetch products');
        }
        const data = await response.json();
        // Only update products if we got valid data from the API
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(staticProducts);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        // Keep using static products if API fails
        setProducts(staticProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getProduct = (id: string) => {
    return products.find(product => product._id === id);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        getProduct,
        isLoading,
        error,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
}; 