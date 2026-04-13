import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';

export default function ProductCard({ product, compact = false }) {
  const { addToCart } = useContext(CartContext);

  return (
    <div className={`bg-white rounded-2xl flex flex-col overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${compact ? 'text-sm' : ''}`}>
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-square flex-shrink-0 bg-slate-50">
        <img 
          src={getImageUrl(product.imageUrl)} 
          alt={product.name}
          className="w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
      <div className={`flex flex-col flex-1 p-4 ${compact ? 'gap-1' : 'gap-2'}`}>
        {product.category && !compact && (
          <span className="text-xs font-semibold tracking-wider text-primary uppercase">{product.category.name}</span>
        )}
        <Link to={`/product/${product.id}`} className="font-semibold text-slate-800 hover:text-primary line-clamp-2 transition-colors">
          {product.name}
        </Link>
        {!compact && (
          <p className="text-slate-500 text-sm line-clamp-2 mt-auto">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-4">
          <span className={`font-bold text-slate-900 ${compact ? 'text-lg' : 'text-xl'}`}>${product.price?.toFixed(2)}</span>
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product.id, 1);
            }}
            className="text-white p-2.5 sm:px-5 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            style={{ backgroundColor: '#2563eb' }}
            title="Add to Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {!compact && <span className="hidden sm:block font-bold text-sm">Add to Cart</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
