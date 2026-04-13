import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductCarousel({ title, products, icon: Icon }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
      setTimeout(checkScroll, 400);
    }
  };

  useEffect(() => { checkScroll(); }, [products]);

  if (!products || products.length === 0) return null;

  return (
    <section className="relative group/carousel">
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <div className="p-2.5 rounded-xl bg-blue-50">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        )}
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        <button 
          onClick={() => scroll(-1)} 
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 p-3 rounded-full bg-white shadow-xl border border-slate-100 text-slate-800 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-95 ${
            !canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover/carousel:opacity-100'
          }`}
          title="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right Arrow */}
        <button 
          onClick={() => scroll(1)} 
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 p-3 rounded-full bg-white shadow-xl border border-slate-100 text-slate-800 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-95 ${
            !canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover/carousel:opacity-100'
          }`}
          title="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div 
          ref={scrollRef} 
          onScroll={checkScroll}
          className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map(product => (
            <div key={product.id} className="flex-shrink-0 w-[280px] snap-start">
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
