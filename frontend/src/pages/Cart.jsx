import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import CartItem from '../components/CartItem';

export default function Cart() {
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-48 h-48 bg-slate-100 rounded-full flex items-center justify-center mb-8 shadow-inner border border-slate-200">
          <ShoppingBag className="w-20 h-20 text-slate-300" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">Your cart is empty</h2>
        <p className="text-slate-500 text-lg mb-8 text-center max-w-md">Looks like you haven't added anything to your cart yet. Let's find something awesome!</p>
        <Link to="/" className="bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 text-lg">
          Start Shopping <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tight flex items-center gap-4">
        <ShoppingBag className="w-8 h-8 text-primary" />
        Shopping Cart
      </h1>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 h-fit sticky top-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <h2 className="text-2xl font-bold text-slate-800 mb-8 tracking-tight">Order Summary</h2>
          
          <div className="space-y-4 text-slate-600 relative z-10 border-b border-slate-100 pb-8">
            <div className="flex justify-between items-center text-lg font-medium">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-medium">
              <span>Estimated Tax</span>
              <span className="font-semibold text-slate-800">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-medium">
              <span>Shipping</span>
              <span className="text-green-500 font-bold uppercase text-sm tracking-wider bg-green-50 px-3 py-1 rounded-full border border-green-100">Free</span>
            </div>
          </div>
          
          <div className="flex justify-between items-end pt-8 mb-8 relative z-10">
            <span className="text-xl font-bold text-slate-800">Total</span>
            <span className="text-4xl font-black text-primary bg-clip-text">
              ${total.toFixed(2)}
            </span>
          </div>
          
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl flex justify-center items-center gap-2 text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 relative z-10 group min-h-[64px]"
          >
            <span className="text-white">Proceed to Checkout</span> <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
