import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

const PepperedMeatPage = () => {
  const pepperedMeat = products.filter(p => p.category === 'Peppered Meat');
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Peppered Meat</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {pepperedMeat.map(product => (
          <ProductCard key={product._id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default PepperedMeatPage; 