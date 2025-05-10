import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

//import meatSeafood from '../assets/meatSeafood.jpg';
//import groceries from '../assets/groceries.jpg';
//import drinks from '../assets/drinks.jpg';
//import snacks from '../assets/snacks.jpg';
//import personalCare from '../assets/personalCare.jpg';
//import clearance from '../assets/clearance.jpg';
//import bestseller from '../assets/bestSellers.jpg';

import bestseller from '../assets/friedrice.jpg';
import meatSeafood from '../assets/jollofrice.jpg';
import groceries from '../assets/poundonsoup.jpg';
import drinks from '../assets/ofadarice.jpg';
import snacks from '../assets/moimoi.jpg';
import personalCare from '../assets/pepperedchicken.jpg';
import clearance from '../assets/peppersoup.jpg';


const categories = [
  {
    id: 'best-sellers',
    name: 'Best Sellers',
    image: bestseller,
  },
  {
    id: 'meat-seafood',
    name: 'Meat & Seafood',
    image: meatSeafood,
  },
  {
    id: 'groceries',
    name: 'Groceries',
    image: groceries,
  },
  {
    id: 'drinks',
    name: 'Drinks',
    image: drinks,
  },
  {
    id: 'snacks',
    name: 'Snacks',
    image: snacks,
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    image: personalCare,
  },
  {
    id: 'clearance',
    name: 'Clearance',
    image: clearance,
  }
];

const HomePage = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-green-700 rounded-xl p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-4">All Your African Meals in One Place!</h1>
        <p className="text-xl">Shop the best selection of authentic African dishes</p>
      </div>

      {/* Categories Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="relative rounded-lg overflow-hidden group cursor-pointer shadow hover:shadow-lg transition"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-white text-xl font-semibold">{category.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} {...product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage; 