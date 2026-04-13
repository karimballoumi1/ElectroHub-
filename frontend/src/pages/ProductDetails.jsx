import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Truck, ShieldCheck, Zap, Star, MessageSquare, User, Calendar, Trash2, Box } from 'lucide-react';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';
import ProductCarousel from '../components/ProductCarousel';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      const productData = res.data;
      setProduct(productData);
      if (productData.images && productData.images.length > 0) {
        setActiveImage(productData.images[0].url);
      } else {
        setActiveImage(productData.imageUrl);
      }
      
      // Fetch similar products (same category)
      if (productData.category) {
        const simRes = await api.get('/products');
        setSimilarProducts(
          simRes.data
            .filter(p => p.category?.id === productData.category.id && p.id !== productData.id)
            .slice(0, 10)
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      fetchReviews();
    } catch (err) {
      console.error(err);
      alert("Failed to delete review. " + (err.response?.data || ""));
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      await api.post(`/reviews/product/${id}`, {
        comment: newComment,
        rating: newRating
      });
      setNewComment('');
      setNewRating(5);
      fetchReviews();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("You must be logged in to post a review.");
      } else {
        alert("An error occurred while posting your review. Please try again.");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="py-20 text-center animate-pulse text-primary font-bold text-xl">Loading...</div>;
  if (!product) return <div className="py-20 text-center">Product not found</div>;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-16 animate-in fade-in duration-700">
      
      {/* Product Information Section */}
      <section>
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-all font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Store
        </button>

        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left: Gallery (Thumbnails on the LEFT of the main image) */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
            
            {/* Thumbnails Container */}
            {product.images && product.images.length > 0 && (
              <div className="flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 scrollbar-hide order-2 md:order-1 md:w-28 flex-shrink-0">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img.url)}
                    className={`flex-shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      activeImage === img.url 
                        ? 'border-blue-600 ring-4 ring-blue-500/10 scale-90' 
                        : 'border-white shadow-lg hover:border-slate-200 hover:scale-105'
                    }`}
                  >
                    <img src={getImageUrl(img.url)} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image Container */}
            <div className="flex-1 order-1 md:order-2 bg-white rounded-[3rem] p-8 md:p-12 flex items-center justify-center border border-slate-100 shadow-xl shadow-slate-200/40 min-h-[400px] lg:h-[600px] overflow-hidden group">
              <img 
                src={getImageUrl(activeImage)} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
              />
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {product.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {product.category.name}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  product.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-black text-slate-700">{averageRating}</span>
                  <span className="text-xs text-slate-400">({reviews.length} reviews)</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-blue-600">${product.price?.toFixed(2)}</span>
              </div>
            </div>

            <div className="h-[1px] bg-slate-200 w-full" />

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                <Truck className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Shipping</p>
                  <p className="text-sm font-bold text-slate-700">Free Delivery</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Warranty</p>
                  <p className="text-sm font-bold text-slate-700">1 Year Official</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <button 
                onClick={() => addToCart(product.id, 1)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl flex justify-center items-center gap-3 text-lg transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-1 active:scale-95 group"
              >
                <ShoppingCart className="w-6 h-6 group-hover:rotate-12 transition-transform" /> 
                Add To Cart
              </button>

              <div className="pt-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Description</h3>
                <p className="text-slate-600 text-base leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-slate-50 rounded-[3rem] p-8 md:p-12 border border-slate-200 shadow-inner">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Review Summary & Form */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Customer Feedback</h2>
              <p className="text-slate-500 font-medium">Verify your experience with this product</p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl font-black text-slate-900">{averageRating}</div>
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-4 h-4 ${i <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase">{reviews.length} total reviews</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="flex gap-2 mb-2">
                    {[1,2,3,4,5].map(i => (
                      <button 
                        key={i} 
                        type="button"
                        onClick={() => setNewRating(i)}
                        className={`transition-all ${i <= newRating ? 'scale-110 drop-shadow-sm' : 'opacity-30'}`}
                      >
                        <Star className={`w-8 h-8 ${i <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Describe your experience..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all min-h-[120px]"
                    required
                  />
                  <button 
                    disabled={submittingReview}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </form>
            </div>
          </div>

          {/* Review List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              Last Reviews <span className="px-3 py-1 bg-white text-slate-500 text-xs rounded-full border border-slate-200">{reviews.length}</span>
            </h3>
            
            {reviews.length === 0 ? (
              <div className="bg-white/50 border border-dashed border-slate-300 rounded-[2rem] p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">No reviews yet. Be the first to share your opinion!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                {reviews.map((review, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black">
                          {review.user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{review.user?.email || 'Anonymous'}</p>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                        {(user?.email === review.user?.email || user?.role === 'ADMIN') && (
                          <button 
                            onClick={() => handleDeleteReview(review.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="pt-10 border-t border-slate-100">
           <ProductCarousel 
            title="Products You Might Like" 
            products={similarProducts} 
            icon={Box} 
           />
        </section>
      )}
    </div>
  );
}
