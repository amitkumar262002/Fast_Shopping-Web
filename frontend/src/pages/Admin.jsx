import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, Package, Users, Zap, TrendingUp, ShieldCheck,
    Plus, Search, Filter, CheckCircle2, Clock, XCircle, MoreVertical,
    Edit3, Trash2, Upload, X, Tag, Star, ArrowUpRight, Bell,
    LayoutDashboard, ShoppingBag, Settings, LogOut, Globe, ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { productsAPI, ordersAPI, adminAPI, couponsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
const timeAgo = (date) => {
    if (!date) return 'Never';
    try {
        const now = new Date();
        const past = new Date(date);
        const diffInSeconds = Math.floor((now - past) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    } catch (e) {
        return 'Unknown';
    }
};

const ADMIN_MODULES = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'products', label: 'Products', icon: <Package size={18} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
    { id: 'users', label: 'Users', icon: <Users size={18} /> },
    { id: 'coupons', label: 'Coupons', icon: <Tag size={18} /> },
];

const SETTINGS_MODULES = [
    { id: 'general', label: 'System Protocol', icon: <Globe size={18} /> },
    { id: 'security', label: 'Security Firewall', icon: <ShieldCheck size={18} /> },
    { id: 'seo', label: 'SEO Analytics', icon: <TrendingUp size={18} /> },
    { id: 'logs', label: 'Activity Logs', icon: <Clock size={18} /> },
];

const mockOrders = [
    { id: "FS-9402", user: "Ankit Singh", item: "iPhone 15 Pro", status: "Shipped", total: "₹1,48,900", date: "Mar 05" },
    { id: "FS-9401", user: "Rahul Sharma", item: "MacBook M3 Max", status: "Processing", total: "₹3,49,900", date: "Mar 05" },
    { id: "FS-9400", user: "Priya Mehta", item: "Dyson V15", status: "Delivered", total: "₹65,900", date: "Mar 04" },
    { id: "FS-9399", user: "Vishal Kumar", item: "Sony XM5", status: "Cancelled", total: "₹24,900", date: "Mar 04" },
    { id: "FS-9398", user: "Sneha Gupta", item: "Samsung Galaxy S24", status: "Delivered", total: "₹79,999", date: "Mar 03" },
];

const mockUsers = [
    { id: "U-001", name: "Ankit Singh", email: "ankit@protocol.io", orders: 12, spent: "₹4.2L", status: "Premium" },
    { id: "U-002", name: "Rahul Sharma", email: "rahul@tech.io", orders: 8, spent: "₹2.1L", status: "Standard" },
    { id: "U-003", name: "Priya Mehta", email: "priya@design.io", orders: 5, spent: "₹1.4L", status: "Standard" },
    { id: "U-004", name: "Vishal Kumar", email: "vishal@nexus.io", orders: 22, spent: "₹8.7L", status: "Premium" },
];

const mockProducts = [
    { id: "P-001", name: "iPhone 15 Pro", category: "Mobiles", stock: 45, price: "₹1,48,900", rating: 4.9, status: "Active" },
    { id: "P-002", name: "MacBook M3 Max", category: "Laptops", stock: 12, price: "₹3,49,900", rating: 4.8, status: "Active" },
    { id: "P-003", name: "Sony WH-1000XM5", category: "Audio", stock: 0, price: "₹24,900", rating: 4.7, status: "Out of Stock" },
    { id: "P-004", name: "Dyson V15 Detect", category: "Appliances", stock: 7, price: "₹65,900", rating: 4.6, status: "Low Stock" },
];

const metrics = [
    { label: "Total Revenue", value: "₹2.42M", trend: "+14.2%", icon: <BarChart3 size={24} />, color: "blue" },
    { label: "Active Orders", value: "156", trend: "+8.1%", icon: <ShoppingBag size={24} />, color: "orange" },
    { label: "Registered Users", value: "12,412", trend: "+24.5%", icon: <Users size={24} />, color: "purple" },
    { label: "Conversion Rate", value: "4.2%", trend: "-1.8%", icon: <TrendingUp size={24} />, color: "green" },
];

const Admin = () => {
    const { user: currentAdmin } = useAuth();
    const [activeModule, setActiveModule] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [showAddCoupon, setShowAddCoupon] = useState(false);
    const [updatingParams, setUpdatingParams] = useState(null); // Used to show loading spinner for specific item

    // Pagination & Edit State
    const [productPage, setProductPage] = useState(1);
    const ITEMS_PER_PAGE = 8;
    const [showEditProduct, setShowEditProduct] = useState(null);

    // Form State
    const [newProduct, setNewProduct] = useState({
        title: '', brand: '', price: '', category_id: 1, stock: 50, description: '', image: ''
    });

    const [newCoupon, setNewCoupon] = useState({
        code: '', discount_percent: 10, max_discount: 500, min_order: 0, uses_limit: 100
    });

    const [sysSettings, setSysSettings] = useState({
        maintenance: false, registrations: true, searchIndexing: true, firewall: true, loginLimit: 5
    });

    useEffect(() => {
        fetchData();
    }, [activeModule]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeModule === 'dashboard' || activeModule === 'products') {
                const prodRes = await productsAPI.getAll({ limit: 5000 });
                setProducts(prodRes.data);
            }
            if (activeModule === 'orders' || activeModule === 'dashboard') {
                const orderRes = await ordersAPI.getAll();
                setOrders(orderRes.data);
            }
            if (activeModule === 'users') {
                const userRes = await adminAPI.getUsers();
                setUsers(userRes.data);
            }
            if (activeModule === 'coupons') {
                const coupRes = await couponsAPI.getAll();
                setCoupons(coupRes.data);
            }
            if (activeModule === 'dashboard') {
                const statsRes = await adminAPI.getStats();
                setStats(statsRes.data);
            }
        } catch (error) {
            console.error("Admin fetch error:", error);
            // toast.error("Failed to sync with command center");
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async () => {
        try {
            await productsAPI.create(newProduct);
            toast.success("Product Authorized & Synced");
            setShowAddProduct(false);
            setNewProduct({ title: '', brand: '', price: '', category_id: 1, stock: 50, description: '', image: '' });
            fetchData();
        } catch (error) {
            toast.error("Protocol Violation: Check all fields");
        }
    };

    const handleEditSubmit = async () => {
        try {
            await productsAPI.update(showEditProduct.id, showEditProduct);
            toast.success("Product Updated Successfully");
            setShowEditProduct(null);
            fetchData();
        } catch (error) {
            toast.error("Failed to update product node");
        }
    };

    const handleUpdateOrderStatus = async (id, newStatus) => {
        try {
            setUpdatingParams(id);
            await adminAPI.updateOrderStatus(id, newStatus);
            toast.success(`Order FS-${id} status updated to ${newStatus}`);
            fetchData();
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setUpdatingParams(null);
        }
    };

    const handleUpdateUserRole = async (id, newRole) => {
        try {
            setUpdatingParams(`user-${id}`);
            await adminAPI.updateUserRole(id, newRole);
            toast.success(`Access level updated to ${newRole}`);
            fetchData();
        } catch (error) {
            toast.error("Failed to elevate/revoke access");
        } finally {
            setUpdatingParams(null);
        }
    };

    const handleAddCoupon = async () => {
        try {
            await couponsAPI.create(newCoupon);
            toast.success(`Coupon ${newCoupon.code.toUpperCase()} initialized!`);
            setShowAddCoupon(false);
            setNewCoupon({ code: '', discount_percent: 10, max_discount: 500, min_order: 0, uses_limit: 100 });
            fetchData();
        } catch (error) {
            toast.error("Failed to deploy coupon pulse");
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm("Terminate this coupon protocol?")) return;
        try {
            await couponsAPI.delete(id);
            toast.success("Coupon dissolved");
            fetchData();
        } catch (error) {
            toast.error("Termination failed");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
            {/* === SIDEBAR (Desktop) === */}
            <aside className="hidden lg:flex w-72 bg-gray-900 min-h-screen flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
                {/* Logo */}
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Zap size={22} className="text-white fill-white" />
                        </div>
                        <div>
                            <p className="text-white font-black tracking-tighter text-lg leading-none">Fast Shopping</p>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[3px] mt-0.5">Admin Console</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-6 space-y-2">
                    {ADMIN_MODULES.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setActiveModule(m.id)}
                            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeModule === m.id
                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/30'
                                : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
                                }`}
                        >
                            {m.icon} {m.label}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5 space-y-3">
                    <div
                        onClick={() => setActiveModule('settings')}
                        className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${activeModule === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'}`}
                    >
                        <Settings size={18} /> <span className="text-xs font-black uppercase tracking-widest">Settings</span>
                    </div>
                    <Link to="/" className="flex items-center gap-3 p-3 rounded-2xl text-red-500/60 hover:text-red-500 hover:bg-red-500/10 cursor-pointer">
                        <LogOut size={18} /> <span className="text-xs font-black uppercase tracking-widest">Exit Console</span>
                    </Link>
                </div>
            </aside>

            {/* === MOBILE BOTTOM NAV / TOP BAR === */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 z-50 flex items-center justify-around p-3 border-t border-white/5">
                {ADMIN_MODULES.map(m => (
                    <button
                        key={m.id}
                        onClick={() => setActiveModule(m.id)}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${activeModule === m.id ? 'text-blue-400' : 'text-gray-500'}`}
                    >
                        {m.icon}
                        <span className="text-[8px] font-black uppercase tracking-widest">{m.label}</span>
                    </button>
                ))}
            </div>
            {/* === MAIN CONTENT === */}
            <main className="flex-1 min-w-0 overflow-y-auto lg:overflow-auto pb-20 lg:pb-0">
                {/* Top Bar */}
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 sm:px-10 py-4 sm:py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg sm:text-2xl font-black tracking-tighter text-gray-900 uppercase italic">
                            {ADMIN_MODULES.find(m => m.id === activeModule)?.label} Module
                        </h1>
                        <p className="hidden sm:block text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Status: OPTIMAL</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative cursor-pointer p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                            <Bell size={20} className="text-gray-500" />
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] font-black text-white flex items-center justify-center">3</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 pr-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <img src={currentAdmin?.profile_image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} className="w-9 h-9 rounded-xl border border-blue-100 p-0.5 object-cover" alt="admin" />
                            <div>
                                <p className="text-xs font-black text-gray-800 tracking-tighter">{currentAdmin?.name || 'Administrator'}</p>
                                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest leading-none mt-0.5">{currentAdmin?.role || 'System Root'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-10">
                    <AnimatePresence mode="wait">

                        {/* === DASHBOARD MODULE === */}
                        {activeModule === 'dashboard' && (
                            <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10">
                                {/* Metrics */}
                                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                                    {[
                                        { label: "Total Revenue", value: `₹${orders.reduce((sum, o) => sum + (o.total_amount || 0), 0).toLocaleString()}`, trend: "+14.2%", icon: <BarChart3 size={24} />, color: "blue" },
                                        { label: "Active Orders", value: orders.length, trend: "+8.1%", icon: <ShoppingBag size={24} />, color: "orange" },
                                        { label: "System Nodes", value: users.length || 1, trend: "+24.5%", icon: <Users size={24} />, color: "purple" },
                                        { label: "Uptime Status", value: "99.9%", trend: "STABLE", icon: <ShieldCheck size={24} />, color: "green" },
                                    ].map((m, i) => (
                                        <div key={i} className="bg-white p-8 rounded-[36px] shadow-sm border border-gray-100 group hover:shadow-xl hover:border-blue-200/50 transition-all">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`p-3 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all ${m.color === 'blue' ? 'bg-blue-50 text-blue-600' : m.color === 'orange' ? 'bg-orange-50 text-orange-600' : m.color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>{m.icon}</div>
                                                <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${m.trend === 'STABLE' || m.trend.startsWith('+') ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-500 bg-red-50 border-red-100'}`}>{m.trend}</span>
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">{m.label}</p>
                                            <h4 className="text-3xl font-black italic tracking-tighter text-gray-900">{m.value}</h4>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts + Activity */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Revenue Chart (visual mock) */}
                                    <div className="lg:col-span-2 bg-white rounded-[36px] p-10 shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-center mb-10">
                                            <div>
                                                <h3 className="text-xl font-black italic tracking-tighter uppercase text-gray-900">Revenue Analytics</h3>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last 7 Days Performance</p>
                                            </div>
                                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:border-blue-300 transition-colors">
                                                This Week <ChevronDown size={12} />
                                            </div>
                                        </div>
                                        {/* Bar Chart Visualization */}
                                        <div className="flex items-end gap-3 h-48">
                                            {[65, 42, 88, 55, 95, 72, 100].map((h, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                    <div
                                                        className="w-full rounded-t-2xl transition-all duration-700 cursor-pointer group/bar relative"
                                                        style={{ height: `${h}%`, background: i === 6 ? 'linear-gradient(to top, #2563eb, #7c3aed)' : '#F1F5F9' }}
                                                    >
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                                                            ₹{(h * 2400).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Live Terminal */}
                                    <div className="bg-gray-900 rounded-[36px] p-8 text-white relative overflow-hidden flex flex-col">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
                                        <h3 className="text-sm font-black italic uppercase tracking-[3px] text-blue-400 mb-6 flex items-center gap-3 relative z-10"><Globe size={18} /> Live Feed</h3>
                                        <div className="flex-1 space-y-4 font-mono text-[10px] leading-relaxed relative z-10 overflow-y-auto pr-2 scrollbar-hide">
                                            <p className="text-green-400 flex gap-2 shrink-0"><span className="opacity-40">AUTO</span> [AUTH] Admin Node Connected</p>
                                            {orders.slice(0, 3).map((o, idx) => (
                                                <p key={`o-${idx}`} className="text-blue-400 flex gap-2 shrink-0">
                                                    <span className="opacity-40">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    [ORDER] FS-{o.id} initialized by {o.user?.name?.split(' ')[0]}
                                                </p>
                                            ))}
                                            {users.slice(0, 3).map((u, idx) => (
                                                <p key={`u-${idx}`} className="text-purple-400 flex gap-2 shrink-0">
                                                    <span className="opacity-40">{timeAgo(u.last_login).replace(' ago', '')}</span>
                                                    [USER] {u.name} session established
                                                </p>
                                            ))}
                                            <p className="text-yellow-400 flex gap-2 shrink-0"><span className="opacity-40">REALTIME</span> [SYSTEM] Integrity Check: OPTIMAL</p>
                                            <p className="animate-pulse text-gray-600">█ Scan Active...</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Orders */}
                                <div className="bg-white rounded-[36px] shadow-sm border border-gray-100 overflow-x-auto">
                                    <div className="flex justify-between items-center p-8 border-b border-gray-50">
                                        <h3 className="text-xl font-black italic tracking-tighter uppercase">Recent Orders</h3>
                                        <button onClick={() => setActiveModule('orders')} className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 hover:gap-4 transition-all">View All <ArrowUpRight size={14} /></button>
                                    </div>
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr className="text-[9px] font-black uppercase tracking-[3px] text-gray-400">
                                                <th className="text-left px-8 py-4">Order ID</th>
                                                <th className="text-left px-8 py-4">Customer</th>
                                                <th className="text-left px-8 py-4">Product</th>
                                                <th className="text-left px-8 py-4">Total</th>
                                                <th className="text-left px-8 py-4">Status</th>
                                                <th className="px-8 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {orders.slice(0, 5).map((o, i) => (
                                                <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="px-8 py-5 text-xs font-black italic text-blue-600">FS-{o.id}</td>
                                                    <td className="px-8 py-5 text-sm font-bold text-gray-800">{o.user?.name || 'Protocol User'}</td>
                                                    <td className="px-8 py-5 text-xs font-medium text-gray-500 max-w-[180px] truncate">{o.items?.[0]?.product?.title || 'Unknown Item'}</td>
                                                    <td className="px-8 py-5 text-sm font-black text-gray-900">₹{o.total_amount?.toLocaleString()}</td>
                                                    <td className="px-8 py-5"><StatusBadge status={o.order_status} /></td>
                                                    <td className="px-8 py-5">
                                                        <select
                                                            value={o.order_status}
                                                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                                            className="text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-gray-100 p-2 rounded-xl text-gray-500 outline-none hover:border-blue-300 transition-colors"
                                                            disabled={updatingParams === o.id}
                                                        >
                                                            <option value="Processing">Processing</option>
                                                            <option value="Shipped">Shipped</option>
                                                            <option value="Delivered">Delivered</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                            {orders.length === 0 && (
                                                <tr><td colSpan="6" className="text-center py-20 text-xs font-black text-gray-400 uppercase tracking-widest">No Active Transactions Detected</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {/* === PRODUCTS MODULE === */}
                        {activeModule === 'products' && (
                            <motion.div key="products" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div>
                                        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900">Product Inventory</h2>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{products.length} SKUs Indexed in Global Catalog</p>
                                    </div>
                                    <button onClick={() => setShowAddProduct(true)} className="flex items-center gap-3 h-14 px-8 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-gray-900 transition-all active:scale-95">
                                        <Plus size={18} /> Add Product
                                    </button>
                                </div>

                                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-50 flex items-center gap-4">
                                        <div className="relative flex-1 max-w-sm">
                                            <input type="text" placeholder="Search products..." className="w-full h-11 bg-slate-50 rounded-xl pl-10 pr-4 text-sm font-medium border border-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                        <button className="h-11 px-5 bg-slate-50 border border-gray-100 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:border-blue-300 transition-colors">
                                            <Filter size={16} /> Filter
                                        </button>
                                    </div>
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr className="text-[9px] font-black uppercase tracking-[3px] text-gray-400">
                                                <th className="text-left px-8 py-4">Product</th>
                                                <th className="text-left px-8 py-4">Category</th>
                                                <th className="text-left px-8 py-4">Stock</th>
                                                <th className="text-left px-8 py-4">Price</th>
                                                <th className="text-left px-8 py-4">Rating</th>
                                                <th className="text-left px-8 py-4">Status</th>
                                                <th className="px-8 py-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {products.slice((productPage - 1) * ITEMS_PER_PAGE, productPage * ITEMS_PER_PAGE).map((p, i) => (
                                                <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                                                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'; }}
                                                                className="w-10 h-10 rounded-lg object-cover" alt=""
                                                            />
                                                            <span className="text-sm font-black text-gray-900 line-clamp-2 max-w-[200px]">{p.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-xs font-bold text-gray-500">{p.category}</td>
                                                    <td className="px-8 py-5 text-sm font-bold text-gray-700">{p.stock}</td>
                                                    <td className="px-8 py-5 text-sm font-black text-gray-900">₹{p.price?.toLocaleString()}</td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-1.5 text-yellow-500">
                                                            <Star size={12} fill="currentColor" />
                                                            <span className="text-xs font-black text-gray-800">{p.rating}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5"><StatusBadge status={p.stock > 0 ? 'Active' : 'Out of Stock'} /></td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-2 justify-center">
                                                            <button onClick={() => setShowEditProduct(p)} className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><Edit3 size={14} /></button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm(`⚠️ DESTROY PROTOCOL INITIATED\n\nAre you sure you want to permanently delete SKU details for: ${p.title}?`)) {
                                                                        await productsAPI.delete(p.id);
                                                                        toast.success("SKU Terminated successfully");
                                                                        fetchData();
                                                                    }
                                                                }}
                                                                className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Pagination Controls */}
                                    {products.length > ITEMS_PER_PAGE && (
                                        <div className="p-6 border-t border-gray-50 flex justify-between items-center bg-slate-50">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                Viewing {(productPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(productPage * ITEMS_PER_PAGE, products.length)} of {products.length}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setProductPage(p => Math.max(1, p - 1))}
                                                    disabled={productPage === 1}
                                                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-600 hover:border-blue-300 disabled:opacity-50 transition-all"
                                                >
                                                    Prev
                                                </button>
                                                <div className="px-4 py-2 rounded-xl border-2 border-blue-600 text-blue-600 bg-blue-50 text-xs font-black">
                                                    {productPage}
                                                </div>
                                                <button
                                                    onClick={() => setProductPage(p => Math.min(Math.ceil(products.length / ITEMS_PER_PAGE), p + 1))}
                                                    disabled={productPage === Math.ceil(products.length / ITEMS_PER_PAGE)}
                                                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-600 hover:border-blue-300 disabled:opacity-50 transition-all"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* === ORDERS MODULE === */}
                        {activeModule === 'orders' && (
                            <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900">Order Management</h2>
                                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr className="text-[9px] font-black uppercase tracking-[3px] text-gray-400">
                                                <th className="text-left px-8 py-4">Order ID</th>
                                                <th className="text-left px-8 py-4">Date</th>
                                                <th className="text-left px-8 py-4">Customer</th>
                                                <th className="text-left px-8 py-4">Product</th>
                                                <th className="text-left px-8 py-4">Total</th>
                                                <th className="text-left px-8 py-4">Status</th>
                                                <th className="px-8 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {orders.map((o, i) => (
                                                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-8 py-5 text-xs font-black italic text-blue-600">FS-{o.id}</td>
                                                    <td className="px-8 py-5 text-xs font-bold text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                                                    <td className="px-8 py-5 text-sm font-bold text-gray-800">{o.user?.name || 'Protocol User'}</td>
                                                    <td className="px-8 py-5 text-xs text-gray-500 max-w-[160px] truncate">{o.items?.[0]?.product?.title || 'System Payload'}</td>
                                                    <td className="px-8 py-5 text-sm font-black text-gray-900">₹{o.total_amount?.toLocaleString()}</td>
                                                    <td className="px-8 py-5"><StatusBadge status={o.order_status} /></td>
                                                    <td className="px-8 py-5">
                                                        <select
                                                            value={o.order_status}
                                                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                                            className="text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-gray-100 p-2 rounded-xl text-gray-500 outline-none hover:border-blue-300 transition-colors"
                                                            disabled={updatingParams === o.id}
                                                        >
                                                            <option value="Processing">Processing</option>
                                                            <option value="Shipped">Shipped</option>
                                                            <option value="Delivered">Delivered</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                            {orders.length === 0 && (
                                                <tr><td colSpan="7" className="text-center py-20 text-xs font-black text-gray-400 uppercase tracking-widest">Global Order Queue Empty</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {/* === USERS MODULE === */}
                        {activeModule === 'users' && (
                            <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900">User Registry</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
                                    {[['Total Users', '12,412'], ['Premium Members', '2,812'], ['New Today', '48'], ['Active Now', '234']].map(([label, val], i) => (
                                        <div key={i} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{label}</p>
                                            <p className="text-3xl font-black tracking-tighter text-gray-900 mt-1">{val}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr className="text-[9px] font-black uppercase tracking-[3px] text-gray-400">
                                                <th className="text-left px-8 py-4">User</th>
                                                <th className="text-left px-8 py-4">Email</th>
                                                <th className="text-left px-8 py-4">Status / Active</th>
                                                <th className="text-left px-8 py-4">Protocol</th>
                                                <th className="px-8 py-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {users.map((u, i) => (
                                                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <img src={u.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-9 h-9 rounded-full border border-gray-100" alt="" />
                                                            <span className="text-sm font-black text-gray-900">{u.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-xs text-gray-500">{u.email}</td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${new Date() - new Date(u.last_login) < 300000 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{new Date() - new Date(u.last_login) < 300000 ? 'Live Now' : 'Offline'}</span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{timeAgo(u.last_login)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-sm font-black text-gray-900">{u.role === 'admin' ? 'SYSTEM_ADMIN' : 'USER_NODE'}</td>
                                                    <td className="px-8 py-5">
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${u.role === 'admin' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>{u.role}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <select
                                                            value={u.role}
                                                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                                                            className="text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-gray-100 p-2 rounded-xl text-gray-500 outline-none hover:border-blue-300 transition-colors"
                                                            disabled={updatingParams === `user-${u.id}`}
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {/* === COUPONS MODULE === */}
                        {activeModule === 'coupons' && (
                            <motion.div key="coupons" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900">Coupon Engine</h2>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[4px]">Active Pulse: {coupons.length} Active</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddCoupon(true)}
                                        className="flex items-center gap-3 h-14 px-8 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-gray-900 transition-all"
                                    >
                                        <Plus size={18} /> Create Coupon
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {coupons.map((c, i) => (
                                        <div key={i} className={`p-8 rounded-[38px] border-2 group relative overflow-hidden transition-all ${c.is_active ? 'bg-gray-900 border-gray-800 text-white shadow-2xl shadow-blue-900/20' : 'bg-white border-gray-100 text-gray-400'}`}>
                                            {c.is_active && <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-600/20 transition-all" />}
                                            <div className="flex justify-between items-start mb-6 relative z-10">
                                                <Tag size={28} className={c.is_active ? 'text-blue-400' : 'text-gray-300'} />
                                                <div className="flex gap-2">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${c.is_active ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>{c.is_active ? 'Protocol Active' : 'Offline'}</span>
                                                    <button onClick={() => handleDeleteCoupon(c.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-500 transition-all"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="relative z-10">
                                                <p className="font-mono text-3xl font-black tracking-widest mb-1 text-blue-400">{c.code}</p>
                                                <p className="text-5xl font-black italic tracking-tighter mb-8 leading-none">{c.discount_percent}% <span className="text-xl">OFF</span></p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 relative z-10">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Capacity</p>
                                                    <p className="text-xs font-black italic">{c.uses_count} / {c.uses_limit}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Limit</p>
                                                    <p className="text-xs font-black italic text-orange-400">₹{c.max_discount} MAX</p>
                                                </div>
                                                <div className="space-y-1 col-span-2">
                                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Entry Condition</p>
                                                    <p className="text-xs font-black italic">Min Order: ₹{c.min_order}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {coupons.length === 0 && (
                                        <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 rounded-[48px]">
                                            <Tag size={48} className="mx-auto text-gray-100 mb-4" />
                                            <p className="text-xs font-black text-gray-300 uppercase tracking-[6px]">No Active Couon Protocols Found</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* === SETTINGS MODULE === */}
                        {activeModule === 'settings' && (
                            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10">
                                <div>
                                    <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900">System Parameters</h2>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[4px]">Central Protocol Control v4.5.1</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* System Protocol */}
                                    <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Globe size={24} /></div>
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter">System Settings</h3>
                                        </div>
                                        <div className="space-y-6">
                                            {[
                                                { label: "Maintenance Mode", sub: "Redirect all users to calibration screen", key: "maintenance" },
                                                { label: "Public Registration", sub: "Allow new nodes to join the matrix", key: "registrations" },
                                                { label: "Search Engine Sync", sub: "Enable global indexers to crawl data", key: "searchIndexing" },
                                            ].map((s, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                                    <div>
                                                        <p className="text-xs font-black uppercase text-gray-900">{s.label}</p>
                                                        <p className="text-[10px] text-gray-500 font-medium">{s.sub}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSysSettings({ ...sysSettings, [s.key]: !sysSettings[s.key] })}
                                                        className={`w-14 h-8 rounded-full relative transition-all ${sysSettings[s.key] ? 'bg-blue-600' : 'bg-gray-200'}`}
                                                    >
                                                        <motion.div animate={{ x: sysSettings[s.key] ? 24 : 4 }} className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Security Configuration */}
                                    <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><ShieldCheck size={24} /></div>
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Security Protocol</h3>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                                <div>
                                                    <p className="text-xs font-black uppercase text-gray-900">Firewall Shield</p>
                                                    <p className="text-[10px] text-gray-500 font-medium">Automatic blocking of suspicious patterns</p>
                                                </div>
                                                <button
                                                    onClick={() => setSysSettings({ ...sysSettings, firewall: !sysSettings.firewall })}
                                                    className={`w-14 h-8 rounded-full relative transition-all ${sysSettings.firewall ? 'bg-purple-600' : 'bg-gray-200'}`}
                                                >
                                                    <motion.div animate={{ x: sysSettings.firewall ? 24 : 4 }} className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md" />
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Sync Retries (Max Login)</p>
                                                <input type="number" value={sysSettings.loginLimit} onChange={e => setSysSettings({ ...sysSettings, loginLimit: e.target.value })} className="w-full h-12 bg-slate-50 border border-gray-100 rounded-2xl px-5 text-sm font-black" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Analytics Overview */}
                                    <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600"><TrendingUp size={24} /></div>
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Analytics Engine</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="p-5 bg-slate-50 rounded-3xl border border-gray-100 italic">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-black uppercase text-gray-400">Database Health</span>
                                                    <span className="text-[10px] font-black text-green-500">OPTIMAL</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} className="h-full bg-green-500" />
                                                </div>
                                                <p className="text-[9px] mt-2 text-gray-500">Current Load: 12ms Response Delay</p>
                                            </div>
                                            <div className="p-5 bg-slate-50 rounded-3xl border border-gray-100 italic">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-black uppercase text-gray-400">Node Syncing</span>
                                                    <span className="text-[10px] font-black text-blue-500">PENDING (2)</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: '62%' }} className="h-full bg-blue-500" />
                                                </div>
                                                <p className="text-[9px] mt-2 text-gray-500">Syncing Catalog to Edge Locations...</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Advanced Actions */}
                                    <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-40 -mt-40" />
                                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                            <div>
                                                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Enterprise Reset</h3>
                                                <p className="text-gray-400 text-sm font-medium">Clear system cache, recalibrate statistics and sync all global nodes.</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={() => toast.info("Cache Purged")} className="h-16 px-10 border-2 border-white/10 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all">Clear Cache</button>
                                                <button onClick={() => toast.success("Statistics Refreshed")} className="h-16 px-10 bg-blue-600 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/40 hover:bg-blue-700 transition-all">Refresh Stats</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main>

            {/* === ADD PRODUCT PANEL === */}
            <AnimatePresence>
                {showAddProduct && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddProduct(false)} className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30 }} className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col">
                            <div className="flex items-center justify-between p-8 border-b border-gray-100">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Add Product</h3>
                                <button onClick={() => setShowAddProduct(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Title</label>
                                    <input value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} type="text" placeholder="e.g. iPhone 15 Pro Max" className="w-full h-12 bg-slate-50 border border-gray-100 rounded-2xl px-5 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand</label>
                                    <input value={newProduct.brand} onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })} type="text" placeholder="e.g. Apple" className="w-full h-12 bg-slate-50 border border-gray-100 rounded-2xl px-5 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price (₹)</label>
                                    <input value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} type="number" placeholder="e.g. 148900" className="w-full h-12 bg-slate-50 border border-gray-100 rounded-2xl px-5 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category ID</label>
                                    <input value={newProduct.category_id} onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })} type="number" placeholder="e.g. 1" className="w-full h-12 bg-slate-50 border border-gray-100 rounded-2xl px-5 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                                    <textarea value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Product specifications and overview" rows={4} className="w-full bg-slate-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Image URL</label>
                                    <input value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} type="text" placeholder="https://images.unsplash.com/..." className="w-full h-12 bg-slate-50 border border-gray-100 rounded-2xl px-5 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                                </div>
                            </div>
                            <div className="p-8 border-t border-gray-100 flex gap-4">
                                <button onClick={() => setShowAddProduct(false)} className="flex-1 h-14 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-gray-300 transition-colors">Cancel</button>
                                <button onClick={handleAddProduct} className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-gray-900 transition-all">Publish Product</button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* === ADD COUPON MODAL === */}
            <AnimatePresence>
                {showAddCoupon && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddCoupon(false)} className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="fixed left-1/2 top-20 -translate-x-1/2 w-full max-w-xl bg-white z-[70] rounded-[48px] shadow-2xl overflow-hidden flex flex-col border border-white/20">
                            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-blue-600 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-blue-500/30"><Tag size={28} /></div>
                                    <div>
                                        <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Coupon Deployment</h3>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[4px] mt-1">System Protocol v4.0</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAddCoupon(false)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-all shadow-sm border border-gray-100"><X size={24} /></button>
                            </div>
                            <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Voucher Identification (CODE)</label>
                                    <input value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} type="text" placeholder="e.g. MEGA50" className="w-full h-14 bg-slate-50 border border-gray-100 rounded-[22px] px-6 text-xl font-black italic tracking-widest text-blue-600 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:opacity-30" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Discount %</label>
                                        <input value={newCoupon.discount_percent} onChange={e => setNewCoupon({ ...newCoupon, discount_percent: e.target.value })} type="number" className="w-full h-14 bg-slate-50 border border-gray-100 rounded-[22px] px-6 text-sm font-black outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Cap (₹)</label>
                                        <input value={newCoupon.max_discount} onChange={e => setNewCoupon({ ...newCoupon, max_discount: e.target.value })} type="number" className="w-full h-14 bg-slate-50 border border-gray-100 rounded-[22px] px-6 text-sm font-black outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Min. Entry (₹)</label>
                                        <input value={newCoupon.min_order} onChange={e => setNewCoupon({ ...newCoupon, min_order: e.target.value })} type="number" className="w-full h-14 bg-slate-50 border border-gray-100 rounded-[22px] px-6 text-sm font-black outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Usage Limit</label>
                                        <input value={newCoupon.uses_limit} onChange={e => setNewCoupon({ ...newCoupon, uses_limit: e.target.value })} type="number" className="w-full h-14 bg-slate-50 border border-gray-100 rounded-[22px] px-6 text-sm font-black outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-10 bg-slate-50 border-t border-gray-100 flex gap-4">
                                <button onClick={() => setShowAddCoupon(false)} className="flex-1 h-14 bg-white border border-gray-200 rounded-[22px] font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 shadow-sm transition-all">Abort</button>
                                <button onClick={handleAddCoupon} className="flex-1 h-16 bg-blue-600 text-white rounded-[22px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-gray-900 transition-all">Engage Deployment</button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* === EDIT PRODUCT PANEL (ADVANCED) === */}
            <AnimatePresence>
                {showEditProduct && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditProduct(null)} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="fixed left-1/2 top-20 -translate-x-1/2 w-full max-w-2xl bg-white z-50 rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-slate-50">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-blue-600 flex items-center gap-3"><Edit3 size={24} /> Update Product Details</h3>
                                <button onClick={() => setShowEditProduct(null)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-400 hover:text-red-500"><X size={20} /></button>
                            </div>
                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Title</label>
                                        <input value={showEditProduct.title} onChange={e => setShowEditProduct({ ...showEditProduct, title: e.target.value })} type="text" className="w-full h-12 bg-white border-2 border-gray-100 rounded-xl px-5 text-sm font-black outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing (₹)</label>
                                        <input value={showEditProduct.price} onChange={e => setShowEditProduct({ ...showEditProduct, price: e.target.value })} type="number" className="w-full h-12 bg-white border-2 border-gray-100 rounded-xl px-5 text-sm font-black outline-none focus:border-blue-500 transition-all text-blue-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Stock</label>
                                        <input value={showEditProduct.stock} onChange={e => setShowEditProduct({ ...showEditProduct, stock: e.target.value })} type="number" className="w-full h-12 bg-white border-2 border-gray-100 rounded-xl px-5 text-sm font-black outline-none focus:border-blue-500 transition-all text-orange-500" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-slate-50 flex gap-4">
                                <button onClick={() => setShowEditProduct(null)} className="flex-1 h-14 bg-white border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors shadow-sm">Cancel</button>
                                <button onClick={handleEditSubmit} className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">Engage Update</button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        'Delivered': 'bg-green-50 text-green-600 border-green-100',
        'Shipped': 'bg-blue-50 text-blue-600 border-blue-100',
        'Processing': 'bg-yellow-50 text-yellow-600 border-yellow-100',
        'Cancelled': 'bg-red-50 text-red-500 border-red-100',
        'Active': 'bg-green-50 text-green-600 border-green-100',
        'Out of Stock': 'bg-red-50 text-red-500 border-red-100',
        'Low Stock': 'bg-orange-50 text-orange-500 border-orange-100',
    };
    const icons = {
        'Delivered': <CheckCircle2 size={10} />,
        'Shipped': <Clock size={10} />,
        'Processing': <Clock size={10} />,
        'Cancelled': <XCircle size={10} />,
    };
    return (
        <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${styles[status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
            {icons[status]} {status}
        </span>
    );
};

export default Admin;
