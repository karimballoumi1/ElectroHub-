import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Settings, Plus, Trash2, Edit3, Package, Layers, ShoppingBag, X, Image as ImageIcon, Users, BarChart3, TrendingUp, DollarSign, Clock, Shield, Mail, UserPlus, ShieldCheck } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('stats'); 
  const [loading, setLoading] = useState(true);
  
  // Modals Overlay Visibility
  const [modalType, setModalType] = useState(null); // 'product' | 'category' | 'user'
  
  // Form States
  const [editingItem, setEditingItem] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: 0, stock: 0, imageUrl: '', category: { id: '' }, images: [] });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'USER' });

  useEffect(() => {
    const currentRole = user?.role || localStorage.getItem('role');
    if (currentRole !== 'ADMIN' && currentRole !== 'SUPER_ADMIN') {
      navigate('/');
      return;
    }
    fetchData();
  }, [tab, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'stats') {
          const res = await api.get('/orders/admin/stats');
          setStats(res.data);
      } else if (tab === 'products') {
        const res = await api.get('/products');
        setProducts(res.data);
        const catRes = await api.get('/categories');
        setCategories(catRes.data);
      } else if (tab === 'categories') {
        const res = await api.get('/categories');
        setCategories(res.data);
      } else if (tab === 'orders') {
        const res = await api.get('/orders/admin/all');
        setOrders(res.data);
      } else if (tab === 'users') {
        const res = await api.get('/users');
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Helper for Image Fields in Product Form ---
  const handleAddImageField = () => {
    setProductForm({ ...productForm, images: [...productForm.images, { url: '' }] });
  };

  const handleRemoveImageField = (index) => {
    const newImages = productForm.images.filter((_, i) => i !== index);
    setProductForm({ ...productForm, images: newImages });
  };

  const handleImageURLChange = (index, value) => {
    const newImages = [...productForm.images];
    newImages[index] = { ...newImages[index], url: value };
    setProductForm({ ...productForm, images: newImages });
  };

  // --- File Upload Handler ---
  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/uploads', formData);
      return res.data; // This is the file URL
    } catch (err) {
      console.error('Upload failed:', err);
      const msg = typeof err.response?.data === 'object' ? JSON.stringify(err.response.data) : (err.response?.data || err.message);
      alert('File upload failed: ' + msg);
      return null;
    }
  };

  const handleMainImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        const url = await handleFileUpload(file);
        if (url) setProductForm({ ...productForm, imageUrl: url });
    }
  };

  const handleGalleryImageChange = async (index, e) => {
    const file = e.target.files[0];
    if (file) {
        const url = await handleFileUpload(file);
        if (url) {
            const newImages = [...productForm.images];
            newImages[index] = { ...newImages[index], url: url };
            setProductForm({ ...productForm, images: newImages });
        }
    }
  };

  // --- Modal Openers ---
  const openProductModal = (p = null) => {
    setEditingItem(p);
    setProductForm(p ? { ...p, category: p.category || { id: '' }, images: p.images || [] } : { name: '', description: '', price: 0, stock: 0, imageUrl: '', category: { id: categories[0]?.id || '' }, images: [] });
    setModalType('product');
  };

  const openCategoryModal = (c = null) => {
    setEditingItem(c);
    setCategoryForm(c ? { name: c.name, description: c.description } : { name: '', description: '' });
    setModalType('category');
  };

  const openUserModal = (u = null) => {
    setEditingItem(u);
    setUserForm(u ? { name: u.name, email: u.email, password: '', role: u.role } : { name: '', email: '', password: '', role: 'USER' });
    setModalType('user');
  };

  // --- CRUD Handlers ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up productForm: convert category id to number if possible, or null if empty
      const payload = {
          ...productForm,
          category: (productForm.category && productForm.category.id) ? { id: Number(productForm.category.id) } : null
      };

      if (editingItem) {
        await api.put(`/products/${editingItem.id}`, payload);
        alert('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        alert('Product created successfully!');
      }
      setModalType(null);
      fetchData();
    } catch (err) { 
      console.error(err);
      if (err.response?.status === 403) {
        alert('Access Denied (403): Your account does not have ADMIN privileges. Logging out...');
        logout();
      } else {
        alert('Operation failed: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/categories/${editingItem.id}`, categoryForm);
        alert('Category updated successfully!');
      } else {
        await api.post('/categories', categoryForm);
        alert('Category created successfully!');
      }
      setModalType(null);
      fetchData();
    } catch (err) { 
      console.error(err);
      if (err.response?.status === 403) {
        alert('Access Denied (403): Your account does not have ADMIN privileges. Logging out...');
        logout();
      } else {
        alert('Operation failed: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/users/${editingItem.id}`, userForm);
        alert('User profile updated successfully!');
      } else {
        await api.post('/users', userForm);
        alert('User account created successfully!');
      }
      setModalType(null);
      fetchData();
    } catch (err) { 
      console.error(err);
      if (err.response?.status === 403) {
        alert('Access Denied (403): Your account does not have ADMIN privileges. Logging out...');
        logout();
      } else {
        alert('Operation failed: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const deleteItem = async (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      await api.delete(`/${type}s/${id}`);
      fetchData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[3.5rem] shadow-xl border border-slate-100 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-600" />
        <div className="flex items-center gap-6">
          <div className="p-5 bg-primary/10 rounded-[2rem] shadow-inner">
            <Settings className="w-10 h-10 text-primary animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Terminal</h1>
            <div className="flex items-center gap-3 mt-1">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${user?.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-600 animate-pulse'}`}>
                    <ShieldCheck className="w-3.5 h-3.5" /> {user?.role || 'NO ROLE'}
                </span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{user?.email}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center bg-slate-100 p-2 rounded-[2.5rem] shadow-inner gap-1">
          {[
            { id: 'stats', icon: BarChart3, label: 'Metrics' },
            { id: 'products', icon: Package, label: 'Products' },
            { id: 'categories', icon: Layers, label: 'Categories' },
            { id: 'orders', icon: ShoppingBag, label: 'Orders' }
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-6 py-4 rounded-[2rem] font-black flex items-center gap-2 transition-all ${tab === t.id ? 'bg-white text-primary shadow-2xl scale-110 z-10' : 'text-slate-400 hover:text-slate-700'}`}>
              <t.icon className="w-5 h-5" /> <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[600px] flex flex-col relative">
        {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
                <Settings className="w-12 h-12 text-primary animate-spin" />
                <span className="text-primary font-black animate-pulse font-mono tracking-widest">SYNCHRONIZING_CORE_RESOURCES...</span>
             </div>
        ) : (
          <div className="flex-1">
            {tab === 'stats' && stats && (
              <div className="p-12 space-y-12 animate-in slide-in-from-bottom-8 duration-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
                        <DollarSign className="w-8 h-8 text-primary mb-6" />
                        <div className="text-xs font-black opacity-50 uppercase tracking-[0.2em]">Gross Revenue</div>
                        <div className="text-5xl font-black mt-3 tracking-tighter">${stats.totalRevenue?.toLocaleString()}</div>
                      </div>
                      <div className="bg-primary p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                        <TrendingUp className="w-8 h-8 text-white mb-6" />
                        <div className="text-xs font-black opacity-70 uppercase tracking-[0.2em]">Closed Deals</div>
                        <div className="text-5xl font-black mt-3 tracking-tighter">{stats.totalOrders}</div>
                      </div>
                      <div className="bg-orange-500 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                        <Clock className="w-8 h-8 text-white mb-6" />
                        <div className="text-xs font-black opacity-70 uppercase tracking-[0.2em]">Active Pipeline</div>
                        <div className="text-5xl font-black mt-3 tracking-tighter">{stats.pendingOrders}</div>
                      </div>
                  </div>
              </div>
            )}

            {tab === 'products' && (
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-center px-6">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Stock Inventory</h2>
                    <button onClick={() => openProductModal()} className="bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 transition-all shadow-xl hover:-translate-y-1">
                        <Plus className="w-6 h-6" /> Add Record
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead className="bg-slate-50 rounded-3xl">
                        <tr>
                        <th className="px-10 py-8 text-xs font-black text-slate-400 uppercase tracking-widest">Label</th>
                        <th className="px-10 py-8 text-xs font-black text-slate-400 uppercase tracking-widest">Market Value</th>
                        <th className="px-10 py-8 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Settings</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-all group">
                            <td className="px-10 py-8 flex items-center gap-8">
                                <img src={getImageUrl(p.imageUrl)} alt="" className="w-20 h-20 rounded-[2rem] object-contain bg-white border-2 border-slate-50 shadow-md group-hover:scale-110 transition-transform" />
                                <div>
                                    <div className="font-black text-slate-900 text-2xl">{p.name}</div>
                                    <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">{p.category?.name}</span>
                                </div>
                            </td>
                            <td className="px-10 py-8 font-mono font-black text-slate-800 text-2xl tracking-tighter">${p.price.toFixed(2)}</td>
                            <td className="px-10 py-8 text-right space-x-3">
                            <button onClick={() => openProductModal(p)} className="p-5 text-slate-300 hover:text-primary hover:bg-white hover:shadow-xl rounded-[1.5rem] transition-all"><Edit3 className="w-6 h-6" /></button>
                            <button onClick={() => deleteItem('product', p.id)} className="p-5 text-slate-300 hover:text-red-500 hover:bg-white hover:shadow-xl rounded-[1.5rem] transition-all"><Trash2 className="w-6 h-6" /></button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              </div>
            )}

            {tab === 'categories' && (
              <div className="p-12 space-y-10">
                <div className="flex justify-between items-center px-4">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Classification</h2>
                    <button onClick={() => openCategoryModal()} className="bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-[2rem] font-black flex items-center gap-2 shadow-xl hover:-translate-y-1 transition-all">
                        <Plus className="w-6 h-6" /> New Category
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {categories.map(c => (
                    <div key={c.id} className="bg-slate-900 p-12 rounded-[4rem] border border-slate-800 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] hover:-translate-y-4 transition-all group relative">
                        <div className="flex justify-between items-start">
                            <div className="w-16 h-16 bg-white/10 rounded-3xl shadow-sm flex items-center justify-center text-white mb-8 group-hover:bg-white group-hover:text-slate-900 transition-all"><Layers className="w-8 h-8"/></div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openCategoryModal(c)} className="p-3 bg-white/10 text-slate-400 hover:text-white rounded-xl backdrop-blur-md"><Edit3 className="w-4 h-4"/></button>
                                <button onClick={() => deleteItem('category', c.id)} className="p-3 bg-white/10 text-slate-400 hover:text-red-400 rounded-xl backdrop-blur-md"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        </div>
                        <h3 className="font-black text-3xl text-white leading-none">{c.name}</h3>
                        <p className="text-slate-400 font-bold mt-4 leading-relaxed">{c.description}</p>
                    </div>
                    ))}
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div className="p-10 space-y-8">
                 <div className="flex justify-between items-center px-6">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active Accounts</h2>
                    <button onClick={() => openUserModal()} className="bg-black text-white px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 shadow-xl">
                        <UserPlus className="w-6 h-6" /> Create User
                    </button>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-10 py-8 text-xs font-black text-slate-400 uppercase tracking-widest">Identifier</th>
                      <th className="px-10 py-8 text-xs font-black text-slate-400 uppercase tracking-widest">Clearance</th>
                      <th className="px-10 py-8 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-10 py-8">
                            <div className="font-black text-slate-900 text-2xl">{u.name}</div>
                            <div className="text-slate-400 font-bold flex items-center gap-2"><Mail className="w-3 h-3"/> {u.email}</div>
                        </td>
                        <td className="px-10 py-8">
                            <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${u.role === 'ADMIN' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-200 text-slate-500'}`}>
                                {u.role}
                            </span>
                        </td>
                        <td className="px-10 py-8 text-right space-x-2">
                          <button onClick={() => openUserModal(u)} className="p-5 text-slate-300 hover:text-primary hover:bg-white hover:shadow-xl rounded-[1.5rem] transition-all"><Edit3 className="w-6 h-6" /></button>
                          <button onClick={() => deleteItem('user', u.id)} className="p-5 text-slate-300 hover:text-red-500 hover:bg-white hover:shadow-xl rounded-[1.5rem] transition-all"><Trash2 className="w-6 h-6" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'orders' && (
              <div className="p-10 space-y-8">
                <div className="px-6">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Fulfillment Pipeline</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead className="bg-slate-50">
                        <tr>
                        <th className="px-8 py-8 text-xs font-black text-slate-400 uppercase tracking-widest">Log Ref</th>
                        <th className="px-8 py-8 text-xs font-black text-slate-400 uppercase tracking-widest">Customer</th>
                        <th className="px-8 py-8 text-xs font-black text-slate-400 uppercase tracking-widest">Shipping</th>
                        <th className="px-8 py-8 text-xs font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                        <th className="px-8 py-8 text-xs font-black text-slate-400 uppercase tracking-widest">Workflow</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.map(o => (
                        <tr key={o.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-8 py-8">
                                <div className="font-black text-primary text-xl tracking-tighter">#{o.id}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">{new Date(o.orderDate).toLocaleDateString()}</div>
                            </td>
                            <td className="px-8 py-8">
                                <div className="font-black text-slate-800 text-lg uppercase leading-none">{o.firstName} {o.lastName}</div>
                                <div className="text-xs font-bold text-slate-500 mt-1">{o.phone}</div>
                                <div className="text-[10px] text-slate-400 font-medium italic mt-1">{o.user?.email}</div>
                            </td>
                            <td className="px-8 py-8 max-w-[200px]">
                                <div className="text-xs font-bold text-slate-600 leading-relaxed truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                                    {o.address}
                                </div>
                            </td>
                            <td className="px-8 py-8 font-black text-slate-900 text-2xl tracking-tighter">${o.totalPrice?.toFixed(2)}</td>
                            <td className="px-8 py-8">
                            <select 
                                value={o.status} 
                                onChange={(e) => api.put(`/orders/admin/status/${o.id}`, { status: e.target.value }).then(() => fetchData())} 
                                className={`px-4 py-3 rounded-xl text-[10px] font-black border-2 bg-white transition-all outline-none focus:ring-4 ring-primary/5 cursor-pointer uppercase tracking-widest ${o.status === 'DELIVERED' ? 'border-green-100 text-green-500' : 'border-slate-100 text-slate-700'}`}
                            >
                                <option value="PLACED">PLACED</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="DELIVERED">DELIVERED</option>
                            </select>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {modalType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[4rem] shadow-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-20 zoom-in-95 duration-500 border border-white/20">
                  <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <h3 className="text-3xl font-black text-slate-900 leading-none">{editingItem ? 'Modify Record' : 'Create Registry'}</h3>
                        <p className="text-slate-400 font-bold text-sm mt-2 uppercase tracking-widest">{modalType} Unit</p>
                      </div>
                      <button onClick={() => setModalType(null)} className="p-4 bg-white hover:bg-slate-100 shadow-sm rounded-3xl transition-all">
                          <X className="w-8 h-8 text-slate-400" />
                      </button>
                  </div>
                  
                  <div className="p-12 overflow-y-auto custom-scrollbar">
                    {/* PRODUCT FORM */}
                    {modalType === 'product' && (
                        <form onSubmit={handleProductSubmit} className="space-y-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 ml-4 uppercase tracking-widest">Item Designation</label>
                                    <input required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50 border-2 border-slate-50 outline-none focus:border-primary transition-all font-bold text-xl" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 ml-4 uppercase tracking-widest">Class Segment</label>
                                    <select value={productForm.category.id} onChange={e => setProductForm({...productForm, category: { id: e.target.value }})} className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50 border-2 border-slate-50 outline-none focus:border-primary transition-all font-black text-lg appearance-none cursor-pointer">
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 ml-4 uppercase tracking-widest">Pricing Matrix ($)</label>
                                    <input type="number" step="0.01" required value={productForm.price} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50 border-2 border-slate-50 outline-none focus:border-primary transition-all font-black text-3xl tracking-tighter" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 ml-4 uppercase tracking-widest">Unit Inventory</label>
                                    <input type="number" required value={productForm.stock} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})} className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50 border-2 border-slate-50 outline-none focus:border-primary transition-all font-black text-3xl tracking-tighter" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 ml-4 uppercase tracking-widest">Technical details</label>
                                <textarea rows="3" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-8 py-6 rounded-[3rem] bg-slate-50 border-2 border-slate-50 outline-none focus:border-primary transition-all font-medium text-lg" />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 ml-4 uppercase tracking-widest">Main Product Image (Local File)</label>
                                <div className="flex gap-4">
                                    <div className="flex-1 relative group">
                                        <input type="file" accept="image/*" onChange={handleMainImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        <div className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 group-hover:border-primary transition-all font-bold text-slate-500 flex items-center justify-between">
                                            <span>{productForm.imageUrl ? 'Image Selected' : 'Choose Local Image'}</span>
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                    </div>
                                    {productForm.imageUrl && <img src={getImageUrl(productForm.imageUrl)} className="w-16 h-16 rounded-[1.5rem] object-cover bg-white border shadow-md" alt="" />}
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-slate-100">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-primary" /> Multi-Image Pipeline (Max 5)
                                    </label>
                                    <button type="button" onClick={handleAddImageField} disabled={productForm.images.length >= 5} className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all disabled:opacity-30">
                                        + Add Image
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {productForm.images.map((img, idx) => (
                                        <div key={idx} className="flex gap-3 group animate-in slide-in-from-right-4 duration-300">
                                            <div className="flex-1 relative">
                                                <input type="file" accept="image/*" onChange={(e) => handleGalleryImageChange(idx, e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                <div className="w-full px-6 py-3 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 group-hover:border-primary transition-all font-bold text-slate-400 text-xs flex items-center justify-between">
                                                    <span>{img.url ? 'Gallery Image Added' : 'Choose Gallery File'}</span>
                                                </div>
                                            </div>
                                            {img.url && <img src={getImageUrl(img.url)} className="w-12 h-12 rounded-xl object-cover bg-white border" alt="" />}
                                            <button type="button" onClick={() => handleRemoveImageField(idx)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-slate-900 text-white font-black py-7 rounded-[3rem] shadow-2xl hover:bg-black transition-all text-xl uppercase tracking-widest">Execute Update</button>
                        </form>
                    )}

                    {/* CATEGORY FORM */}
                    {modalType === 'category' && (
                        <form onSubmit={handleCategorySubmit} className="space-y-8">
                             <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 ml-6 uppercase tracking-widest">Group Label</label>
                                <input required value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="w-full px-10 py-6 rounded-[3rem] bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary transition-all font-black text-2xl" placeholder="e.g. Peripherals" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 ml-6 uppercase tracking-widest">Functional Narrative</label>
                                <textarea rows="4" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} className="w-full px-10 py-8 rounded-[4rem] bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary transition-all font-bold text-lg leading-relaxed" placeholder="Describe category scope..." />
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white font-black py-8 rounded-[4rem] shadow-2xl hover:bg-black transition-all text-2xl uppercase tracking-[0.2em]">{editingItem ? 'Apply Rewrite' : 'Commit Creation'}</button>
                        </form>
                    )}

                    {/* USER FORM */}
                    {modalType === 'user' && (
                        <form onSubmit={handleUserSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 ml-6 uppercase tracking-widest">Legal Name</label>
                                    <input required value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 font-bold text-xl" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 ml-6 uppercase tracking-widest">System Role</label>
                                    <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 font-black text-lg">
                                        <option value="USER">USER (DEFAULT)</option>
                                        <option value="ADMIN">ADMIN (PRIVILEGED)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 ml-6 uppercase tracking-widest">Network Email</label>
                                <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 font-bold text-xl" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 ml-6 uppercase tracking-widest">{editingItem ? 'Security Override (Leave blank to maintain)' : 'Access Key'}</label>
                                <input type="password" required={!editingItem} value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 font-black text-xl" />
                            </div>
                            <button type="submit" className="w-full bg-black text-white font-black py-8 rounded-[4rem] shadow-2xl transition-all text-2xl uppercase tracking-widest">{editingItem ? 'Update Credentials' : 'Create Identity'}</button>
                        </form>
                    )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
