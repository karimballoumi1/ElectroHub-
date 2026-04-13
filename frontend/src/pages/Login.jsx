import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Package } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      alert('Login failed. Check your credentials.');
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center animate-in slide-in-from-bottom-5 duration-700">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="text-center mb-10 relative z-10 flex flex-col items-center">
          <div className="bg-primary/10 p-4 rounded-3xl mb-6">
            <Package className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
          <p className="text-slate-500 mt-2 font-medium">Please enter your details to sign in.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all font-medium text-slate-800" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)} 
              placeholder="name@example.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-slate-700">Password</label>
              <a href="#" className="text-sm font-semibold text-primary hover:underline">Forgot password?</a>
            </div>
            <input 
              type="password" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all font-medium text-slate-800 tracking-widest" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-slate-900 hover:bg-primary text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg shadow-primary/20 hover:shadow-xl active:scale-95"
          >
            Sign In
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 font-medium relative z-10">
          Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
