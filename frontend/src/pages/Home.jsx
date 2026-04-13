import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Zap, Truck, ShieldCheck, Headphones, ArrowRight, Sparkles, Monitor, Smartphone, Laptop, Watch, Camera } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import ProductCarousel from '../components/ProductCarousel';

// Promo banner component
function PromoBanner({ title, subtitle, gradient, icon: Icon, btnText }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${gradient} p-8 md:p-10 flex items-center justify-between`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="relative z-10 space-y-2">
        <p className="text-white/80 text-sm font-bold uppercase tracking-widest">{subtitle}</p>
        <h3 className="text-white text-2xl md:text-3xl font-black tracking-tight leading-tight">{title}</h3>
        {btnText && (
          <button className="mt-4 bg-white text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
            {btnText} <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
      {Icon && <Icon className="w-20 h-20 text-white/20 relative z-10" />}
    </div>
  );
}

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [heroBannerIndex, setHeroBannerIndex] = useState(0);
  const location = useLocation();

  // Hero banners
  const heroBanners = [
    { title: 'Latest Smartphones', subtitle: 'New Arrivals', desc: 'Discover the latest smartphones with cutting-edge technology', gradient: 'from-blue-600 to-indigo-700', image: '/banners/hero_smartphones.png' },
    { title: 'Premium Laptops', subtitle: 'Best Sellers', desc: 'Powerful laptops for work, gaming, and creativity', gradient: 'from-slate-800 to-slate-900', image: '/banners/hero_laptops.png' },
    { title: 'Smart Accessories', subtitle: 'Special Offers', desc: 'Enhance your devices with premium accessories', gradient: 'from-emerald-600 to-teal-700', image: '/banners/hero_accessories.png' },
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search');

    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      fetchAll();
    }
  }, [location.search]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroBannerIndex(prev => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setAllProducts(prodRes.data);
      setFilteredProducts(prodRes.data);
      setCategories(catRes.data);
      setIsSearching(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setIsSearching(true);
    setLoading(true);
    try {
      const res = await api.get(`/products/ai-search?query=${query}`);
      setFilteredProducts(res.data);
      setSelectedCategory(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (catId) => {
    setSelectedCategory(catId);
    if (catId) {
      setFilteredProducts(allProducts.filter(p => p.category?.id === catId));
    } else {
      setFilteredProducts(allProducts);
    }
    setIsSearching(false);
  };

  // Group products by category
  const productsByCategory = {};
  allProducts.forEach(p => {
    const catName = p.category?.name || 'Other';
    if (!productsByCategory[catName]) productsByCategory[catName] = [];
    productsByCategory[catName].push(p);
  });

  const categoryIcons = {
    'Smartphones': Smartphone,
    'Laptops': Laptop,
    'Tablets': Monitor,
    'Headphones': Headphones,
    'Watches': Watch,
    'Cameras': Camera,
  };

  const currentBanner = heroBanners[heroBannerIndex];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* ===== HERO BANNER ===== */}
      <section className="relative overflow-hidden rounded-2xl shadow-2xl h-[320px] md:h-[420px]">
        {/* Background image */}
        <img 
          src={currentBanner.image} 
          alt={currentBanner.title}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-1000"
        />
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r ${currentBanner.gradient} opacity-80 transition-all duration-1000`} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

        <div className="relative z-10 h-full px-8 md:px-16 flex flex-col justify-center max-w-xl">
          <span className="inline-block w-fit px-4 py-1.5 bg-white/15 text-white/90 text-xs font-black tracking-widest uppercase rounded-full backdrop-blur-sm border border-white/10 mb-5">
            {currentBanner.subtitle}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-4 drop-shadow-lg">
            {currentBanner.title}
          </h1>
          <p className="text-white/80 text-lg font-medium max-w-md mb-6 drop-shadow">
            {currentBanner.desc}
          </p>
          <button className="bg-white text-slate-900 px-8 py-3.5 rounded-xl font-black text-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2 w-fit">
            Shop Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroBanners.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setHeroBannerIndex(i)}
              className={`h-2 rounded-full transition-all duration-500 ${i === heroBannerIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`} 
            />
          ))}
        </div>
      </section>

      {/* ===== TRUST BADGES ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Truck, title: 'Free Delivery', desc: 'On orders above $50', color: 'text-blue-500', bg: 'bg-blue-50' },
          { icon: ShieldCheck, title: 'Warranty', desc: '1 year guarantee', color: 'text-green-500', bg: 'bg-green-50' },
          { icon: Zap, title: 'Fast Shipping', desc: '24/48h delivery', color: 'text-amber-500', bg: 'bg-amber-50' },
          { icon: Headphones, title: '24/7 Support', desc: 'Always available', color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((badge, i) => (
          <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-3 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className={`${badge.bg} p-2.5 rounded-lg group-hover:scale-110 transition-transform`}>
              <badge.icon className={`w-5 h-5 ${badge.color}`} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">{badge.title}</p>
              <p className="text-slate-400 text-xs">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== MAIN CONTENT WITH SIDEBAR ===== */}
      <div className="flex gap-8">
        
        {/* ===== SIDEBAR — Category List ===== */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-28 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-900 px-5 py-4">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest">Categories</h3>
            </div>
            <nav className="p-2">
              <button
                onClick={() => handleCategoryFilter(null)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                  selectedCategory === null 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-4 h-4" />
                All Products
                <span className="ml-auto text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                  {allProducts.length}
                </span>
              </button>
              {categories.map((cat) => {
                const count = allProducts.filter(p => p.category?.id === cat.id).length;
                const IconComp = categoryIcons[cat.name] || Monitor;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryFilter(cat.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                      selectedCategory === cat.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                    {cat.name}
                    <span className="ml-auto text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ===== PRODUCT AREA ===== */}
        <div className="flex-1 min-w-0 space-y-10">

          {/* Mobile category filter (shown on small screens) */}
          <div className="lg:hidden flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryFilter(null)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCategory === null ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search results mode */}
          {isSearching ? (
            <div>
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Search Results</h2>
                <button 
                  onClick={() => { setIsSearching(false); setFilteredProducts(allProducts); setSelectedCategory(null); }}
                  className="text-primary font-semibold hover:underline text-sm"
                >
                  Clear Search
                </button>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-100" />
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No products found</h3>
                  <p className="text-slate-500 text-sm">Try adjusting your search.</p>
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : (
            <>
              {/* Category carousels when no filter selected */}
              {!selectedCategory && (
                <div className="space-y-10">
                  {Object.entries(productsByCategory).map(([catName, catProducts], index) => (
                    <div key={catName}>
                      {index === 1 && (
                        <div className="mb-10">
                          <div className="relative overflow-hidden rounded-2xl shadow-lg h-[200px] md:h-[260px] group cursor-pointer">
                            <img 
                              src="/banners/promo_ecommerce.png" 
                              alt="ElectroHub Electronics"
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12 max-w-lg">
                              <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">Best Deals</p>
                              <h3 className="text-white text-2xl md:text-4xl font-black tracking-tight leading-tight mb-4">Top Electronics at Best Prices</h3>
                              <button className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 w-fit">
                                Shop Now <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      <ProductCarousel 
                        title={catName} 
                        products={catProducts}
                        icon={categoryIcons[catName] || Monitor}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Filtered products grid when a category is selected */}
              {selectedCategory && (
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">
                    {categories.find(c => c.id === selectedCategory)?.name || 'Products'}
                  </h2>
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">No products in this category</h3>
                      <p className="text-slate-500 text-sm">Try selecting a different category.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
