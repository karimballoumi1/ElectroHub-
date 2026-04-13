import { useState, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';

export default function AISearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Sparkles className="h-5 w-5 text-primary group-focus-within:animate-pulse" />
      </div>
      <input
        type="text"
        className="block w-full pl-12 pr-16 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm hover:shadow-md transition-all text-lg"
        placeholder="Try 'I want a gaming laptop under $1000'..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button 
        type="submit"
        className="absolute inset-y-2 right-2 bg-primary hover:bg-blue-600 text-white px-6 rounded-full font-medium shadow-md hover:shadow-lg transition-all active:scale-95"
      >
        Search
      </button>
    </form>
  );
}
