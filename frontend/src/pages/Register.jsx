import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      alert('Registration failed.');
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center animate-in slide-in-from-bottom-4 duration-700">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="text-center mb-10 relative z-10 flex flex-col items-center">
          <div className="bg-blue-500/10 p-4 rounded-3xl mb-6">
            <Zap className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create account</h2>
          <p className="text-slate-500 mt-2 font-medium">Join the next generation of shopping.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
            <input 
              type="text" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl outline-none transition-all font-medium text-slate-800"
              required 
              value={name}
              onChange={e => setName(e.target.value)} 
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl outline-none transition-all font-medium text-slate-800"
              required 
              value={email}
              onChange={e => setEmail(e.target.value)} 
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl outline-none transition-all font-medium text-slate-800 tracking-widest"
              required 
              value={password}
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 mt-4"
          >
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 font-medium relative z-10">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
