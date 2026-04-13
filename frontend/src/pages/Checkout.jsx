import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';
import api from '../services/api';
import { CartContext } from '../context/CartContext';

export default function Checkout() {
  const { fetchCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });
  const [orderDetails, setOrderDetails] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/orders', formData);
      setOrderDetails(res.data);
      setSuccess(true);
      fetchCart(); // refresh cart to empty
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data || err.message || 'Failed to place order.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center animate-in zoom-in-95 duration-700">
        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-inner shadow-green-200/50">
          <CheckCircle2 className="w-16 h-16 text-green-500 animate-pulse" />
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Order Confirmed!</h1>
        <p className="text-slate-600 text-xl font-medium mb-10 max-w-lg">
          Thank you for your purchase <span className="text-primary font-bold">{formData.firstName}</span>. 
          Your order ID is <span className="font-bold text-slate-800">#{orderDetails?.id}</span> and it will be shipped shortly.
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-primary hover:bg-blue-600 text-white px-10 py-4 rounded-full font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 text-lg"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 animate-in fade-in duration-500">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8 text-center tracking-tight">Secure Checkout</h1>
      
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-8 text-green-600 bg-green-50 p-4 rounded-xl border border-green-100">
          <ShieldCheck className="w-6 h-6" />
          <span className="font-medium text-sm text-green-700">Safe & secure payment processing. 256-bit encryption.</span>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest text-[10px]">First Name</label>
              <input 
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all shadow-inner text-base font-medium" 
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest text-[10px]">Last Name</label>
              <input 
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all shadow-inner text-base font-medium" 
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest text-[10px]">Phone Number</label>
            <input 
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              type="tel" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all shadow-inner text-base font-medium" 
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest text-[10px]">Shipping Address</label>
            <input 
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all shadow-inner text-base font-medium" 
              placeholder="123 AI Street, Tech City"
            />
          </div>

        </div>
        
        <button 
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full mt-10 bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-2xl flex justify-center items-center gap-2 text-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 disabled:opacity-75 disabled:cursor-wait relative z-10 overflow-hidden group"
        >
          {loading ? 'Processing...' : 'Place Order'}
          {!loading && <CheckCircle2 className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />}
        </button>
      </div>
    </div>
  );
}
