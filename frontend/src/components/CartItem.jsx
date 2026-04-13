import { useContext } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';

export default function CartItem({ item }) {
  const { addToCart, removeFromCart } = useContext(CartContext);

  const handleUpdate = (newQty) => {
    if (newQty < 1) {
      removeFromCart(item.id);
    } else {
      // API expects the amount to ADD. Since our addToCart actually behaves as additive in backend for existing items... wait.
      // Wait, in my CartService, if the item exists, it does: item.setQuantity(item.getQuantity() + quantity);
      // This means the API expects the difference. So newQty - currentQty.
      const diff = newQty - item.quantity;
      if (diff !== 0) {
        addToCart(item.product.id, diff);
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="w-24 h-24 bg-slate-50 rounded-2xl p-2 flex-shrink-0">
        <img 
          src={getImageUrl(item.product?.imageUrl)} 
          alt={item.product?.name} 
          className="w-full h-full object-contain mix-blend-multiply" 
        />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <h3 className="font-semibold text-lg text-slate-800 line-clamp-1">{item.product?.name}</h3>
        <p className="text-slate-500 font-medium">${item.product?.price?.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl shadow-inner border border-slate-100/50">
        <button 
          onClick={() => handleUpdate(item.quantity - 1)}
          className="p-2 bg-white hover:bg-slate-100 rounded-xl text-slate-600 shadow-sm transition-colors active:scale-95"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-bold text-slate-800">{item.quantity}</span>
        <button 
          onClick={() => handleUpdate(item.quantity + 1)}
          className="p-2 bg-white hover:bg-slate-100 rounded-xl text-slate-600 shadow-sm transition-colors active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="font-bold text-xl text-primary w-24 text-right">
        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
      </div>
      <button 
        onClick={() => removeFromCart(item.id)}
        className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors active:scale-95"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
