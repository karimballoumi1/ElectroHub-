import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, Settings, Search, Sparkles, ShieldAlert } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-900/95 border-b border-white/5 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4 md:gap-12">
        
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center gap-3 font-black text-2xl group transition-all">
          <img 
            src="/favicon.svg" 
            alt="ElectroHub Logo" 
            className="w-10 h-10 object-contain group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" 
          />
          <span className="text-white tracking-tighter hidden sm:block">
            ELECTRO<span className="text-blue-500">HUB</span>
          </span>
        </Link>

        {/* Search Area - Centered & Expanded */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input 
              type="text" 
              className="w-full bg-slate-800/50 border border-slate-700/50 focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3 pl-12 pr-4 text-sm transition-all text-white placeholder:text-slate-500 font-medium"
              placeholder="Search latest gadgets, laptops, phones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-2 top-1.5 hidden lg:block">
              <span className="px-2 py-1.5 bg-slate-700/50 rounded-lg text-[10px] font-bold text-slate-400 border border-slate-600">CTRL + K</span>
            </div>
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Cart */}
          <Link to="/cart" className="relative p-3 rounded-2xl hover:bg-white/5 transition-all active:scale-95 group">
            <ShoppingCart className="w-6 h-6 text-slate-300 group-hover:text-blue-400 transition-colors" />
            {cartItemsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center animate-in zoom-in duration-300 border-2 border-slate-900 shadow-xl">
                {cartItemsCount}
              </span>
            )}
          </Link>

          <div className="h-8 w-[1px] bg-white/10 mx-1 hidden sm:block"></div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col items-end mr-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">My Account</span>
                <span className="text-sm font-bold text-white max-w-[120px] truncate">{user.email.split('@')[0]}</span>
              </div>
              
              <div className="flex gap-2">
                {user.role === 'SUPER_ADMIN' && (
                  <Link to="/superadmin" className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-2xl text-red-400 transition-all active:scale-95 border border-red-500/20" title="Super Admin Dashboard">
                    <ShieldAlert className="w-5 h-5" />
                  </Link>
                )}

                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <Link to="/admin" className="p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-2xl text-blue-400 transition-all active:scale-95 border border-blue-500/20" title="Admin Dashboard">
                    <Settings className="w-5 h-5" />
                  </Link>
                )}

                <button 
                  onClick={logout} 
                  className="p-3 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95 border border-transparent hover:border-red-500/10"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="hidden sm:block text-slate-300 hover:text-white px-4 py-2 text-sm font-bold transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                Join Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

