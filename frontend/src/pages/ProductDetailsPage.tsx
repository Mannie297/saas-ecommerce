import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProduct } from '../context/ProductContext';
//import ProductCard from '../components/ProductCard';

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
import vitamalt from '../assets/vitamalt.jpg';
import poundoyam from '../assets/poundoyam.jpg';
import yam from '../assets/yam.jpg';
import turkey from '../assets/turkey.jpg';

const getStars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

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
    'poundonsoup.jpg': poundonsoup,
    'vitamalt.jpg': vitamalt,
    'poundoyam.jpg': poundoyam,
    'yam.jpg': yam,
    'turkey.jpg': turkey
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

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { products, getProduct, isLoading, error } = useProduct();
  const product = id ? getProduct(id) : undefined;
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Demo reviews state (in-memory)
  const [reviews, setReviews] = useState([
    { name: 'Clare', rating: 5, comment: 'Great taste. So Yummy!' },
    { name: 'John', rating: 4, comment: 'Very good, will buy again.' },
  ]);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return <div className="max-w-2xl mx-auto py-8 px-4">Loading...</div>;
  }

  if (error) {
    return <div className="max-w-2xl mx-auto py-8 px-4 text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="max-w-2xl mx-auto py-8 px-4">Product not found.</div>;
  }

  // Related products: same category, excluding current product
  const related = products.filter(
    p => p.category === product.category && p._id !== product._id
  );

  // You May Also Like: random 3 products from other categories
  const youMayAlsoLike = products
    .filter(p => p.category !== product.category && p._id !== product._id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  // Average rating
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
    : 0;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviews([...reviews, reviewForm]);
    setReviewForm({ name: '', rating: 5, comment: '' });
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <button className="mb-4 text-green-700 hover:underline" onClick={() => navigate(-1)}>&larr; Back</button>
      <div className="flex flex-col md:flex-row gap-8">
        <img 
          src={getImageSource(product.image)} 
          alt={product.name} 
          className="w-full md:w-80 h-80 object-cover rounded shadow" 
          onError={(e) => {
            e.currentTarget.src = logo;
            e.currentTarget.className = "w-full md:w-80 h-80 object-contain p-4 bg-gray-100 rounded shadow";
          }}
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-500 mb-2">{product.category}</p>
          <div className="flex items-center mb-2">
            <span className="text-yellow-500 text-lg mr-2">{getStars(Math.round(avgRating))}</span>
            <span className="text-gray-600 text-sm">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
          </div>
          <p className="text-xl font-bold text-green-700 mb-4">${product.price.toFixed(2)}</p>
          <p className="mb-6">{product.description}</p>
          <button
            className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition-colors duration-200 text-lg font-semibold"
            onClick={() => addToCart({
              id: product._id,
              name: product.name,
              price: product.price,
              image: product.image,
              category: product.category,
              description: product.description
            })}
          >
            Add to Cart
          </button>
        </div>
      </div>
      {/* Related Products Section */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">More in {product.category}</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2 hide-scrollbar">
            {related.map(rp => (
              <div key={rp._id} className="min-w-[220px] max-w-xs flex-shrink-0">
                <Link to={`/product/${rp._id}`}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src={getImageSource(rp.image)} 
                      alt={rp.name} 
                      className="w-full h-40 object-cover" 
                      onError={(e) => {
                        e.currentTarget.src = logo;
                        e.currentTarget.className = "w-full h-40 object-contain p-4 bg-gray-100";
                      }}
                    />
                    <div className="p-3">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{rp.name}</h3>
                      <span className="text-sm text-gray-500">${rp.price.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* You May Also Like Section */}
      {youMayAlsoLike.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">You May Also Like</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2 hide-scrollbar">
            {youMayAlsoLike.map(rp => (
              <div key={rp._id} className="min-w-[220px] max-w-xs flex-shrink-0">
                <Link to={`/product/${rp._id}`}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src={getImageSource(rp.image)} 
                      alt={rp.name} 
                      className="w-full h-40 object-cover" 
                      onError={(e) => {
                        e.currentTarget.src = logo;
                        e.currentTarget.className = "w-full h-40 object-contain p-4 bg-gray-100";
                      }}
                    />
                    <div className="p-3">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{rp.name}</h3>
                      <span className="text-sm text-gray-500">${rp.price.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500 mb-4">No reviews yet.</p>
        ) : (
          <ul className="mb-4 space-y-3">
            {reviews.map((r, i) => (
              <li key={i} className="bg-gray-50 rounded p-3 border">
                <div className="flex items-center mb-1">
                  <span className="font-semibold mr-2">{r.name}</span>
                  <span className="text-yellow-500 text-sm">{getStars(r.rating)}</span>
                </div>
                <p className="text-gray-700">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleReviewSubmit} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Your name"
              className="border rounded px-2 py-1 flex-1"
              value={reviewForm.name}
              onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))}
            />
            <select
              className="border rounded px-2 py-1"
              value={reviewForm.rating}
              onChange={e => setReviewForm(f => ({ ...f, rating: Number(e.target.value) }))}
            >
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <textarea
            required
            placeholder="Your review"
            className="border rounded px-2 py-1 w-full"
            value={reviewForm.comment}
            onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold">
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductDetailsPage; 