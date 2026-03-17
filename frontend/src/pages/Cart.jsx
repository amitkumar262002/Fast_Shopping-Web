import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart, Zap, ArrowRight, Ticket, ShieldCheck, X, Plus, Minus,
    Heart, Package, Tag, Truck, RotateCcw, Star, Trash2, Info, TrendingUp,
    Sparkles, Bookmark
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import { couponsAPI } from '../services/api';
import { toast } from 'react-toastify';

const Cart = ({ cart = [], updateQuantity, removeItem, toggleWishlist, products = [], addToCart, moveToSaved, savedItems = [], moveToCartFromSaved, removeFromSaved }) => {
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [couponData, setCouponData] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);

    const formatINR = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const couponDiscount = couponData ? couponData.discount_amount : 0;
    const delivery = subtotal > 499 ? 0 : 49;
    const total = subtotal - couponDiscount + delivery;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            const res = await couponsAPI.validate(couponCode, subtotal);
            setCouponData(res.data);
            toast.success(res.data.message || 'Coupon applied!');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Invalid coupon code');
            setCouponData(null);
        } finally {
            setCouponLoading(false);
        }
    };

    // Advanced Recommendations: Find products from same category as cart items
    const cartCategories = [...new Set(cart.map(i => i.category))];
    const recommendations = products
        .filter(p => cartCategories.includes(p.category) && !cart.find(ci => ci.id === p.id))
        .slice(0, 3);

    if (cart.length === 0 && savedItems.length === 0) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 pt-28 font-sans">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-32 h-32 bg-white rounded-[40px] shadow-sm border border-gray-100 flex items-center justify-center text-gray-200 mb-6">
                <ShoppingCart size={52} />
            </motion.div>
            <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-gray-900 uppercase mb-3">Cart Empty</h2>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic mb-8 text-center">Your premium cart is waiting to be filled</p>
            <Link to="/products" className="h-14 px-10 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center gap-3">
                Shop Our Collection <ArrowRight size={16} />
            </Link>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen pt-[140px] lg:pt-[104px] pb-20 font-sans">
            <div className="container mx-auto px-4 lg:px-12">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 pt-6 pl-4 sm:pl-8 border-l-[10px] border-blue-600">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black uppercase tracking-[4px] text-blue-600">Shopping Inventory</span>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        </div>
                        <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-gray-900 uppercase leading-none">Your Selection</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Analysis: {cart.length} ACTIVE ITEMS • {savedItems.length} PENDING</p>
                            {total > 10000 && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1"><Sparkles size={10} /> High Value Order</span>}
                        </div>
                    </div>
                    <Link to="/products" className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 hover:text-blue-600 transition-all border-b border-transparent hover:border-blue-600 pb-1 italic">Explore More Protocols →</Link>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">

                    {/* Main Content Area */}
                    <div className="space-y-8">
                        {/* 1. Active Cart Header for Amazon Consistency */}
                        <div className="bg-white rounded-t-[32px] p-6 border-x border-t border-gray-100 shadow-sm hidden md:flex items-center justify-between text-[10px] font-black uppercase tracking-[3px] text-gray-400">
                            <div className="flex items-center gap-3"><ShoppingCart size={16} /> Shopping Procurement Queue</div>
                            <div className="flex gap-20 mr-12 text-right">
                                <span className="w-20">Quantity</span>
                                <span className="w-32">Total Price</span>
                            </div>
                        </div>

                        {/* 1. Active Cart */}
                        {cart.length > 0 && (
                            <div className="space-y-1">
                                <AnimatePresence mode="popLayout">
                                    {cart.map((item, idx) => (
                                        <div key={item.id} className={`relative group/parent ${idx === cart.length - 1 ? 'rounded-b-[40px]' : ''}`}>
                                            <CartItem item={item} updateQuantity={updateQuantity} removeItem={removeItem} />
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/parent:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => moveToSaved(item.id)}
                                                    className="p-2 bg-slate-50 border border-gray-200 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                                    title="Save for Later"
                                                >
                                                    <Bookmark size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </AnimatePresence>
                                <div className="flex justify-end p-6 pr-12 text-lg font-black italic tracking-tighter text-gray-900 bg-white border border-gray-100 rounded-b-[40px] shadow-sm">
                                    Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items): <span className="text-blue-600 ml-4 font-sans">{formatINR(subtotal)}</span>
                                </div>
                            </div>
                        )}

                        {/* Protocol Information Banner (fills left side) */}
                        <div className="bg-blue-600 rounded-[40px] p-10 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-all rotate-12"><ShieldCheck size={180} /></div>
                            <div className="relative z-10 max-w-lg">
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Fast Hub Protection</h3>
                                <p className="text-xs font-bold opacity-80 uppercase tracking-widest leading-relaxed mb-6">Your order is protected by our Tier-1 Logistics Protocol. 100% money-back guarantee on all mismatched specifications and delayed deployments.</p>
                                <div className="flex gap-4">
                                    <button className="px-6 py-3 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all">Details</button>
                                    <button className="px-6 py-3 bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all backdrop-blur-md">Secure FAQ</button>
                                </div>
                            </div>
                        </div>

                        {/* 2. Save for Later */}
                        {savedItems.length > 0 && (
                            <div className="space-y-4 mt-12 pt-12 border-t border-gray-200">
                                <div className="flex items-center gap-3 px-2">
                                    <Bookmark size={18} className="text-blue-600" />
                                    <h3 className="text-xl font-black italic tracking-tighter uppercase text-gray-900">Saved For Later ({savedItems.length})</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {savedItems.map((item) => (
                                        <div key={item.id} className="bg-white rounded-[24px] p-4 flex gap-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0">
                                                <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between overflow-hidden">
                                                <div>
                                                    <h4 className="text-xs font-black uppercase truncate">{item.title}</h4>
                                                    <p className="text-sm font-black italic tracking-tighter text-blue-600">{formatINR(item.price)}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => moveToCartFromSaved(item.id)} className="text-[9px] font-black uppercase tracking-widest bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1"><Plus size={12} /> Move to Cart</button>
                                                    <button onClick={() => removeFromSaved(item.id)} className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Coupon Module - now in Left Column */}
                        <div className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                                    <Ticket size={18} className="text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Promo Code</p>
                                    <p className="text-sm font-black italic text-gray-900">Apply Coupon Protocol</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="Enter code (e.g. SAVE20)"
                                    className="flex-1 h-12 bg-slate-50 border border-gray-200 rounded-2xl px-4 text-sm font-bold outline-none focus:border-blue-600 transition-colors uppercase tracking-widest placeholder:normal-case placeholder:font-normal placeholder:text-gray-400"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={couponLoading || !couponCode.trim()}
                                    className="h-12 px-6 bg-gray-900 hover:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-40 flex items-center gap-2 shrink-0"
                                >
                                    {couponLoading ? <span className="animate-spin">⟳</span> : <><Tag size={14} /> Apply</>}
                                </button>
                            </div>
                            {couponData && (
                                <div className="mt-3 flex items-center gap-2 bg-green-50 px-4 py-2.5 rounded-xl border border-green-100">
                                    <ShieldCheck size={14} className="text-green-600" />
                                    <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">{couponData.code} Applied — You saved {formatINR(couponData.discount_amount)}!</span>
                                    <button onClick={() => { setCouponData(null); setCouponCode(''); }} className="ml-auto text-gray-400 hover:text-red-500"><X size={14} /></button>
                                </div>
                            )}
                            <div className="flex gap-2 mt-3 flex-wrap">
                                {["SAVE20", "FIRST50", "FESTIVE10"].map(c => (
                                    <button key={c} onClick={() => setCouponCode(c)} className="text-[9px] font-black uppercase px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all tracking-widest">{c}</button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats Banner */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "Items", value: cart.length, icon: <ShoppingCart size={18} />, color: "text-blue-600", bg: "bg-blue-50" },
                                { label: "Savings", value: couponData ? formatINR(couponDiscount) : "₹0", icon: <Tag size={18} />, color: "text-green-600", bg: "bg-green-50" },
                                { label: "Delivery", value: delivery === 0 ? "FREE" : formatINR(delivery), icon: <Truck size={18} />, color: "text-orange-500", bg: "bg-orange-50" },
                            ].map((s, i) => (
                                <div key={i} className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm flex flex-col items-center gap-1 text-center">
                                    <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>{s.icon}</div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{s.label}</p>
                                    <p className={`text-sm font-black italic ${s.color}`}>{s.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* 3. Advanced Recommendations */}
                        {recommendations.length > 0 && (
                            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-30 -mr-20 -mt-20"></div>
                                <div className="flex items-center gap-3 mb-8 relative z-10">
                                    <TrendingUp size={20} className="text-orange-500" />
                                    <h3 className="text-xl font-black italic tracking-tighter uppercase text-gray-900">Frequently Bought Together</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                    {recommendations.map(p => (
                                        <div key={p.id} className="space-y-3">
                                            <div className="aspect-square bg-slate-50 rounded-[24px] overflow-hidden">
                                                <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={p.name} />
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase truncate text-gray-500 mb-1">{p.category}</h4>
                                                <p className="text-xs font-bold truncate mb-1">{p.name || p.title}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-black italic tracking-tighter text-gray-900">{formatINR(p.price)}</span>
                                                    <button onClick={() => { addToCart(p, false, true); toast.success('Added from recommendations! 🚀'); }} className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-blue-600 transition-all"><Plus size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <aside className="xl:sticky xl:top-28 space-y-5">

                        <div className="bg-white rounded-[32px] p-8 shadow-2xl border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500"></div>

                            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3 text-gray-900">
                                <Package size={24} className="text-blue-600" /> Cart Analysis
                            </h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-600"><Tag size={16} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase text-gray-400">Inventory Items</span>
                                            <span className="text-sm font-black italic text-gray-900">{cart.length} Units Detected</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black font-sans text-gray-700">{formatINR(subtotal)}</span>
                                </div>

                                {couponData && (
                                    <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-between items-center bg-green-50 p-4 rounded-2xl border border-green-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-green-600"><Ticket size={16} /></div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black uppercase text-green-400">Protocol Discount</span>
                                                <span className="text-sm font-black italic text-green-700">{couponData.code} ACTIVE</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-black font-sans text-green-600">-{formatINR(couponDiscount)}</span>
                                    </motion.div>
                                )}

                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-orange-500"><Truck size={16} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase text-gray-400">Logistics Routing</span>
                                            <span className="text-sm font-black italic text-gray-900">{delivery === 0 ? 'Complimentary' : 'Standard'}</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black font-sans text-gray-700">{delivery === 0 ? '₹0' : formatINR(delivery)}</span>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 mb-8" />

                            <div className="mb-8">
                                <span className="text-[10px] font-black uppercase tracking-[5px] text-blue-600 block mb-2">Final Protocol Valuation</span>
                                <div className="text-5xl font-black italic tracking-tighter text-gray-900 flex items-baseline gap-1">
                                    {formatINR(total)}
                                    <span className="text-[11px] font-bold text-gray-400 not-italic tracking-normal ml-2">Inc. Taxes</span>
                                </div>
                                {total > 500 && (
                                    <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-100 space-y-2">
                                        <p className="text-[10px] font-black text-green-700 uppercase tracking-widest flex items-center gap-2">
                                            <ShieldCheck size={14} /> Savings Protocol: ACTIVE
                                        </p>
                                        <p className="text-[11px] font-bold text-green-600 leading-tight">
                                            You are saving <span className="text-lg italic tracking-tighter">{formatINR(subtotal - total + delivery)}</span> on this procurement node compared to standard retail matrix.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full h-16 bg-blue-600 hover:bg-black text-white rounded-[24px] flex items-center justify-center gap-3 font-black italic text-sm uppercase tracking-[3px] shadow-2xl hover:shadow-blue-500/40 active:scale-[0.98] transition-all duration-300 group"
                            >
                                GO TO CHECKOUT <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </button>

                            <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-gray-400"><RotateCcw size={18} /></div>
                                    <span className="text-[8px] font-black uppercase text-gray-500">7 Day Return</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-gray-400"><ShieldCheck size={18} /></div>
                                    <span className="text-[8px] font-black uppercase text-gray-500">Secured Pay</span>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Card */}
                        <div className="bg-gray-900 rounded-[32px] p-6 text-white overflow-hidden relative">
                            <div className="absolute inset-0 bg-blue-600 opacity-10 blur-[100px]"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400"><Info size={24} /></div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">Shopping Insight</h4>
                                    <p className="text-[10px] font-black opacity-40 uppercase">Global Fulfillment Network Status: OPTIMAL</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Cart;
