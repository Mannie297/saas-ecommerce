import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// Import all images

//import groceries from '../assets/groceries.jpg';
//import drinks from '../assets/drinks.jpg';
//import fish from '../assets/fish.jpg';
//import clearanceOil from '../assets/clearanceOil.jpg';
//import cocaCola from '../assets/cocaCola.jpg';
//import chips from '../assets/chips.jpg';
//import chinchin from '../assets/chinchin.jpg';
//import soap from '../assets/soap.jpg';
//import lotion from '../assets/lotion.jpg';
//import clearanceRice from '../assets/clearanceRice.jpg';
//import clearance from '../assets/clearance.jpg';
import logo from '../assets/logo.png'; // Using logo as fallback image

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


interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

interface ProductCardProps extends Product {}

const ProductCard: React.FC<ProductCardProps> = ({
  _id,
  name,
  price,
  image,
  category,
  description,
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: _id,
      name,
      price,
      image,
      category,
      description
    });
  };

  const getImageSource = (imageName: string) => {
    if (!imageName) {
      return logo;
    }

    if (imageName.startsWith('data:') || imageName.startsWith('blob:')) {
      return imageName;
    }

    const cleanImageName = imageName.replace('/images/', '');

    const imageMap: { [key: string]: string } = {
      'jollofchicken.jpg': jollofchicken,
      //'groceries.jpg': groceries,
      //'drinks.jpg': drinks,
      //'fish.jpg': fish,
      //'clearanceOil.jpg': clearanceOil,
      //'cocaCola.jpg': cocaCola,
      //'chips.jpg': chips,
      //'chinchin.jpg': chinchin,
      //'soap.jpg': soap,
      //'lotion.jpg': lotion,
      //'clearanceRice.jpg': clearanceRice,
      //'clearance.jpg': clearance,
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

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/product/${_id}`)}
    >
      <div className="relative">
        <img
          src={getImageSource(image)}
          alt={name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = logo;
            e.currentTarget.className = "w-full h-48 object-contain p-4 bg-gray-100";
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">${price.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 