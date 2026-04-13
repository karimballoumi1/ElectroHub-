import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Shield, ShieldAlert, Trash2, Mail, UserCheck, ShieldCheck, Search, Calendar, UserPlus, X } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentRole = user?.role || localStorage.getItem('role');
    if (currentRole !== 'SUPER_ADMIN') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Change ${targetUser.email} role to ${newRole}?`)) return;

    try {
      await api.put(`/users/${targetUser.id}`, {
        ...targetUser,
        role: newRole
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update role");
    }
  };

  const handleToggleStatus = async (targetUser) => {
    const newStatus = !targetUser.enabled;
    const action = newStatus ? "unblock" : "block";
    if (!window.confirm(`Are you sure you want to ${action} ${targetUser.email}?`)) return;

    try {
      await api.put(`/users/${targetUser.id}`, {
        ...targetUser,
        enabled: newStatus
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', {
        ...newAdmin,
        role: 'ADMIN',
        enabled: true
      });
      setShowAddModal(false);
      setNewAdmin({ name: '', email: '', password: '' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to create admin account. Email might already be in use.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <div className="py-20 text-center animate-pulse text-2xl font-black text-slate-300">Loading Users...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <ShieldAlert className="w-8 h-8 text-blue-600" /> 
             System Control
          </h1>
          <p className="text-slate-500 mt-1">Manage administrators and users across the platform.</p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4">
            <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center min-w-[120px]">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{users.length}</p>
            </div>
            <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center min-w-[120px]">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admins</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{users.filter(u => u.role === 'ADMIN').length}</p>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search users..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" /> Add Admin
            </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Joined</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${!u.enabled ? 'opacity-75' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        u.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-600' : 
                        u.role === 'ADMIN' ? 'bg-blue-100 text-blue-600' : 
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role === 'SUPER_ADMIN' ? <ShieldAlert className="w-5 h-5" /> : 
                         u.role === 'ADMIN' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{u.name || 'Anonymous'}</p>
                        <p className="text-slate-500 text-sm">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        u.role === 'SUPER_ADMIN' ? 'bg-red-50 text-red-700 border border-red-200' :
                        u.role === 'ADMIN' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                        {u.role.replace('_', ' ')}
                        </span>
                        {!u.enabled && (
                            <span className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1">
                                <ShieldAlert className="w-3 h-3" /> Blocked
                            </span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {u.role !== 'SUPER_ADMIN' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleRole(u)}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          {u.role === 'ADMIN' ? <UserCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          {u.role === 'ADMIN' ? 'Demote' : 'Promote'}
                        </button>
                        
                        <button 
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 border shadow-sm ${
                            u.enabled 
                            ? 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100' 
                            : 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                           {u.enabled ? 'Block' : 'Unblock'}
                        </button>

                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                       <p className="text-right text-xs font-semibold text-slate-400">System Admin</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <UserPlus className="text-blue-500 w-6 h-6" />
                        Create Administrator
                    </h2>
                    <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-red-500 p-1 bg-white hover:bg-red-50 rounded-full transition-colors shadow-sm border border-slate-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-600">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={newAdmin.name}
                            onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                            placeholder="Alex Admin"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-600">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={newAdmin.email}
                            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                            placeholder="alex@ecommerce.com"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-600">Temporary Password</label>
                        <input
                            type="password"
                            required
                            minLength="6"
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={newAdmin.password}
                            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30">
                            Create Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
