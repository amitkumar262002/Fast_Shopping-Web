import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, ShoppingBag, ArrowRight, Trash2, Plus, Bookmark, Sparkles,
    Filter, List, Share2, MoreVertical, LayoutGrid, ListFilter, Search,
    Gift, Baby, Users, Info, ChevronDown, Star, Calendar, UserPlus,
    CreditCard, ShieldCheck, Zap, Scissors, Shirt, ToyBrick, RefreshCw
} from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Wishlist = ({ wishlist = [], savedItems = [], toggleWishlist, addToCart, moveToCartFromSaved, removeFromSaved, products = [] }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const initialTab = searchParams.get('tab') || 'wishlist';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [viewMode, setViewMode] = useState('grid');
    const [findQuery, setFindQuery] = useState("");
    const [foundRegistries, setFoundRegistries] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPrimeModalOpen, setIsPrimeModalOpen] = useState(false);
    const [primeFormData, setPrimeFormData] = useState({ name: user?.name || '', business: '', goal: 'Saving' });
    const [registryData, setRegistryData] = useState({
        baby: JSON.parse(localStorage.getItem('fs_baby_reg')) || null,
        wedding: JSON.parse(localStorage.getItem('fs_wedding_reg')) || null
    });

    const [babyForm, setBabyForm] = useState({ name: '', date: '', age: '2-5', gender: 'Any' });
    const [weddingForm, setWeddingForm] = useState({ name1: '', name2: '', date: '' });

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        setSearchParams({ tab: activeTab }, { replace: true });
    }, [activeTab]);

    // --- LOGIC ---
    const handleRegisterBaby = (e) => {
        e.preventDefault();
        if (!babyForm.name || !babyForm.date) return toast.warning("Fill mandatory fields");
        const data = { ...babyForm, id: Date.now() };
        setRegistryData(prev => ({ ...prev, baby: data }));
        localStorage.setItem('fs_baby_reg', JSON.stringify(data));
        toast.success("👼 Baby Registry Initialized!");
    };

    const handleRegisterWedding = (e) => {
        e.preventDefault();
        if (!weddingForm.name1 || !weddingForm.name2 || !weddingForm.date) return toast.warning("Fill mandatory fields");
        const data = { ...weddingForm, id: Date.now() };
        setRegistryData(prev => ({ ...prev, wedding: data }));
        localStorage.setItem('fs_wedding_reg', JSON.stringify(data));
        toast.success("💍 Wedding Registry Initialized!");
    };

    const handlePrimeUpgrade = async (e) => {
        if (e) e.preventDefault();
        try {
            await authAPI.updateProfile({ is_prime: true });

            if (updateUser) {
                updateUser({ ...user, is_prime: true });
            }

            toast.success("💎 Prime Hub Elite Protocol Activated!");
            setIsPrimeModalOpen(false);
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error("Prime upgrade error:", error);
            toast.error("Hub synchronization failed.");
        }
    };

    const handleSearchRegistry = () => {
        if (!findQuery.trim()) return toast.info("Enter a name to search");
        setIsSearching(true);
        // Professional Mock Search
        setTimeout(() => {
            const results = [
                { id: 101, name: "Anita & Rahul's Wedding", type: "wedding", date: "2024-12-15", owner: "Anita K." },
                { id: 102, name: "Baby Advik's Arrival", type: "baby", date: "2024-08-20", owner: "Suresh P." },
                { id: 103, name: "Sharma Family Housewarming", type: "list", date: "2024-10-05", owner: "Vikas S." }
            ].filter(r => r.name.toLowerCase().includes(findQuery.toLowerCase()) || r.owner.toLowerCase().includes(findQuery.toLowerCase()));
            setFoundRegistries(results);
            setIsSearching(false);
            if (results.length === 0) toast.info("No registries found for your query.");
        }, 800);
    };

    // --- FILTERS ---
    const babyProducts = products.filter(p =>
        p.category?.toLowerCase().includes('kids') ||
        p.category?.toLowerCase().includes('baby') ||
        p.title?.toLowerCase().includes('toy') ||
        p.title?.toLowerCase().includes('shirt') ||
        p.title?.toLowerCase().includes('dress')
    ).sort((a, b) => a.price - b.price); // Cheapest first

    const weddingProducts = products.filter(p =>
        p.category?.toLowerCase().includes('home') ||
        p.category?.toLowerCase().includes('kitchen') ||
        p.category?.toLowerCase().includes('furniture')
    ).sort((a, b) => b.price - a.price); // Premium first

    const listTabs = [
        { id: 'wishlist', label: 'Your Wish List', icon: <Heart size={16} />, count: wishlist.length, color: "text-red-500" },
        { id: 'saved', label: 'Saved for Later', icon: <Bookmark size={16} />, count: savedItems.length, color: "text-blue-500" },
        { id: 'baby', label: 'Baby Registry', icon: <Baby size={16} />, count: registryData.baby ? 1 : 0, color: "text-cyan-500" },
        { id: 'wedding', label: 'Wedding Registry', icon: <Gift size={16} />, count: registryData.wedding ? 1 : 0, color: "text-pink-500" },
        { id: 'find', label: 'Find a List', icon: <Search size={16} />, count: 0, color: "text-gray-500" },
    ];

    const currentItems = activeTab === 'wishlist' ? wishlist : (activeTab === 'saved' ? savedItems : []);
    const formatCurrency = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

    return (
        <div className="bg-[#f0f2f2] min-h-screen pt-[140px] lg:pt-[100px] pb-40 font-sans">
            <div className="container mx-auto px-4 lg:px-12 max-w-7xl">

                {/* PREMIUM HEADER */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-8 border-b border-gray-300">
                    <div>
                        <nav className="flex items-center gap-2 text-[12px] font-bold text-[#565959] mb-4 uppercase tracking-widest">
                            <Link to="/" className="hover:text-[#007185] hover:underline">Home</Link>
                            <ChevronRight size={10} />
                            <Link to="/profile" className="hover:text-[#007185] hover:underline">Account</Link>
                            <ChevronRight size={10} />
                            <span className="text-[#c45500]">Your Lists</span>
                        </nav>
                        <h1 className="text-4xl font-black text-[#111] tracking-tighter italic uppercase">Your Lists & <span className="text-[#e47911]">Favorites</span></h1>
                        <p className="text-sm text-[#565959] mt-2 font-bold max-w-xl leading-relaxed">Centralized hub for all your curated collections, gift registries, and saved items.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => { setActiveTab('wishlist'); setIsCreateModalOpen(true); }}
                            className="h-12 px-8 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full shadow-lg text-sm font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Plus size={18} /> Create a List
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 mt-10">
                    {/* LEFT SIDEBAR */}
                    <aside className="w-full lg:w-80 shrink-0 space-y-6">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="p-6 bg-gray-50 border-b border-gray-100">
                                <h3 className="text-xs font-black uppercase text-gray-400 tracking-[3px]">Navigation</h3>
                            </div>
                            <div className="flex flex-col">
                                {listTabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center justify-between px-6 py-5 text-sm font-black transition-all border-l-4 ${activeTab === tab.id
                                            ? `bg-[#f3f8f9] border-[#e47911] text-[#111]`
                                            : 'border-transparent text-[#565959] hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`${activeTab === tab.id ? tab.color : 'text-gray-300'}`}>{tab.icon}</div>
                                            {tab.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PRIME CARD */}
                        <div className={`rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group transition-all duration-700 ${user?.is_prime ? 'bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800' : 'bg-[#131921]'}`}>
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000"></div>
                            {user?.is_prime ? <ShieldCheck size={32} className="text-yellow-400 mb-4 animate-bounce" /> : <Sparkles size={32} className="text-[#FF9900] mb-4 animate-pulse" />}
                            <h4 className="text-xl font-black italic uppercase italic tracking-tighter mb-2">{user?.is_prime ? 'Elite Status: Active' : 'Prime Hub Elite'}</h4>
                            <p className="text-xs text-gray-400 leading-relaxed font-bold uppercase mb-6 opacity-70">
                                {user?.is_prime
                                    ? "10% to 50% Exclusive Discount applied to your cart automatically."
                                    : "Join the Elite hub for exclusive reward tracking and extreme discounts."
                                }
                            </p>
                            {user?.is_prime ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Protocol Active</span>
                                </div>
                            ) : (
                                <button onClick={() => setIsPrimeModalOpen(true)} className="w-full py-4 bg-gradient-to-r from-blue-400 to-indigo-600 hover:from-blue-500 hover:to-indigo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-[4px] transition-all shadow-xl active:scale-95 border border-white/10">Upgrade To Elite</button>
                            )}
                        </div>
                    </aside>

                    {/* MAIN AREA */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {/* STANDARD LISTS VISUALS */}
                            {(activeTab === 'wishlist' || activeTab === 'saved') && (
                                <motion.div key="items" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden min-h-[600px]">
                                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/10">
                                        <div className="flex bg-white p-1 rounded-lg border border-gray-100">
                                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-400'}`}><LayoutGrid size={18} /></button>
                                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-black text-white' : 'text-gray-400'}`}><List size={18} /></button>
                                        </div>
                                        <div className="relative">
                                            <input type="text" placeholder="Search items..." className="h-10 w-64 bg-gray-50 border border-gray-200 rounded-full px-10 text-xs font-bold outline-none focus:ring-2 focus:ring-[#e47911]" />
                                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        {currentItems.length === 0 ? (
                                            <div className="py-32 text-center space-y-4">
                                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200 border-2 border-dashed border-gray-200">
                                                    {activeTab === 'wishlist' ? <Heart size={32} /> : <Bookmark size={32} />}
                                                </div>
                                                <h3 className="text-xl font-black uppercase tracking-tighter italic">Your {activeTab} is Empty</h3>
                                                <Link to="/products" className="inline-block mt-4 px-10 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">Shop Now</Link>
                                            </div>
                                        ) : (
                                            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" : "flex flex-col gap-6"}>
                                                {currentItems.map(item => (
                                                    <div key={item.id} className={`group bg-white border border-gray-100 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl ${viewMode === 'list' ? 'flex p-6 items-center' : ''}`}>
                                                        <Link to={`/products/${item.id}`} className={`${viewMode === 'list' ? 'w-40 h-40' : 'aspect-square'} bg-[#fbfbfb] flex items-center justify-center relative p-6 cursor-pointer`}>
                                                            <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                                                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); activeTab === 'wishlist' ? toggleWishlist(item.id) : removeFromSaved(item.id); }} className="absolute top-2 right-2 p-2 bg-white/80 rounded-full text-gray-300 hover:text-red-500 transition-colors shadow-sm z-10"><Trash2 size={16} /></button>
                                                        </Link>
                                                        <div className="p-6 flex-1 space-y-4 text-left">
                                                            <Link to={`/products/${item.id}`} className="text-sm font-black uppercase text-[#111] line-clamp-2 leading-tight tracking-tight hover:text-blue-600 transition-colors block">{item.title}</Link>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xl font-black">{formatCurrency(item.price)}</span>
                                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(item); }} className="p-3 bg-black text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-black/10"><ShoppingBag size={20} /></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* BABY REGISTRY VIEW */}
                            {activeTab === 'baby' && (
                                <motion.div key="baby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                    {!registryData.baby ? (
                                        <div className="bg-white rounded-[40px] p-16 text-center space-y-10 shadow-2xl border border-gray-100">
                                            <div className="w-24 h-24 bg-cyan-50 text-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-inner"><Baby size={48} /></div>
                                            <div className="max-w-xl mx-auto space-y-4">
                                                <h2 className="text-4xl font-black italic tracking-tighter uppercase">Create Your Baby Registry</h2>
                                                <p className="text-gray-400 font-bold text-xs uppercase tracking-[3px] leading-relaxed">Planning for a new arrival? Register now for special discounts and gift tracking.</p>
                                            </div>
                                            <form onSubmit={handleRegisterBaby} className="max-w-md mx-auto space-y-4 bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                                <div className="flex flex-col text-left gap-1">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Baby Name / Nickname</label>
                                                    <input value={babyForm.name} onChange={e => setBabyForm({ ...babyForm, name: e.target.value })} type="text" placeholder="e.g. Baby Aradhya" className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 font-bold outline-none focus:ring-2 focus:ring-cyan-500" />
                                                </div>
                                                <div className="flex flex-col text-left gap-1">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Expected / Birth Date</label>
                                                    <input value={babyForm.date} onChange={e => setBabyForm({ ...babyForm, date: e.target.value })} type="date" className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 font-bold outline-none focus:ring-2 focus:ring-cyan-500" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col text-left gap-1">
                                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Age Group</label>
                                                        <select value={babyForm.age} onChange={e => setBabyForm({ ...babyForm, age: e.target.value })} className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 font-bold text-sm">
                                                            <option>0-2 Years</option>
                                                            <option>2-5 Years</option>
                                                            <option>5-10 Years</option>
                                                            <option>10-15 Years</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex flex-col text-left gap-1">
                                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Gender</label>
                                                        <select value={babyForm.gender} onChange={e => setBabyForm({ ...babyForm, gender: e.target.value })} className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 font-bold text-sm">
                                                            <option>Any</option>
                                                            <option>Boy</option>
                                                            <option>Girl</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <button type="submit" className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-[4px] shadow-xl hover:bg-cyan-600 transition-all mt-4">Initialize Registry</button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="space-y-12">
                                            {/* ACTIVE REGISTRY TOP BAR */}
                                            <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 border-b-8 border-cyan-500">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center text-cyan-500 shadow-inner"><Baby size={32} /></div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Registry Active</p>
                                                        <h2 className="text-3xl font-black italic tracking-tighter text-[#111] uppercase">{registryData.baby.name}'s Collection</h2>
                                                        <div className="flex gap-4 mt-2">
                                                            <span className="text-[10px] font-black bg-cyan-100 text-cyan-600 px-3 py-1 rounded-full uppercase italic tracking-widest">{registryData.baby.age} OLD</span>
                                                            <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase tracking-widest">GENDER: {registryData.baby.gender}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => { localStorage.removeItem('fs_baby_reg'); setRegistryData(prev => ({ ...prev, baby: null })); }} className="text-[10px] font-black text-gray-300 hover:text-red-500 uppercase tracking-[3px] transition-colors">Terminate Registry</button>
                                            </div>

                                            {/* SHOP SPECIALIZED BABY PRODUCTS */}
                                            <div className="space-y-8">
                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        <h3 className="text-2xl font-black italic tracking-tighter uppercase text-[#111]">Recommended <span className="text-cyan-600">Baby Essentials</span></h3>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Special cheapest prices & offers curated for you.</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="flex items-center gap-2 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest border border-green-100"><Sparkles size={12} /> Best Offers</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                                                    {babyProducts.length > 0 ? babyProducts.slice(0, 8).map(product => (
                                                        <div key={product.id} className="group bg-white p-5 rounded-3xl border border-gray-100 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all relative overflow-hidden cursor-pointer">
                                                            <Link to={`/products/${product.id}`} className="aspect-square bg-[#f9f9f9] rounded-2xl flex items-center justify-center mb-4 p-4 block">
                                                                <img src={product.image} alt={product.title} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                                                            </Link>
                                                            <div className="absolute top-4 left-4">
                                                                <div className="bg-yellow-400 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">Elite Offer</div>
                                                            </div>
                                                            <Link to={`/products/${product.id}`} className="text-[10px] font-black uppercase text-[#111] line-clamp-2 leading-tight mb-2 min-h-[2.5rem] hover:text-cyan-600 transition-colors block">{product.title}</Link>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xl font-black text-[#111]">{formatCurrency(product.price)}</p>
                                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }} className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-cyan-600 transition-all"><ShoppingBag size={16} /></button>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="col-span-full py-10 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Loading specialized collections...</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* WEDDING REGISTRY VIEW */}
                            {activeTab === 'wedding' && (
                                <motion.div key="wedding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                    {!registryData.wedding ? (
                                        <div className="bg-white rounded-[40px] p-16 text-center space-y-10 shadow-2xl border border-gray-100">
                                            <div className="w-24 h-24 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto shadow-inner"><Gift size={48} /></div>
                                            <div className="max-w-xl mx-auto space-y-4">
                                                <h2 className="text-4xl font-black italic tracking-tighter uppercase">Wedding Registry Hub</h2>
                                                <p className="text-gray-400 font-bold text-xs uppercase tracking-[3px] leading-relaxed">Start your new chapter with the perfect collection. Premium essentials for your home.</p>
                                            </div>
                                            <form onSubmit={handleRegisterWedding} className="max-w-md mx-auto space-y-4 bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col text-left gap-1">
                                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Name 1</label>
                                                        <input value={weddingForm.name1} onChange={e => setWeddingForm({ ...weddingForm, name1: e.target.value })} type="text" placeholder="Partner A" className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 font-bold outline-none focus:ring-2 focus:ring-pink-500" />
                                                    </div>
                                                    <div className="flex flex-col text-left gap-1">
                                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Name 2</label>
                                                        <input value={weddingForm.name2} onChange={e => setWeddingForm({ ...weddingForm, name2: e.target.value })} type="text" placeholder="Partner B" className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 font-bold outline-none focus:ring-2 focus:ring-pink-500" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col text-left gap-1">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Big Day Date</label>
                                                    <input value={weddingForm.date} onChange={e => setWeddingForm({ ...weddingForm, date: e.target.value })} type="date" className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 font-bold outline-none focus:ring-2 focus:ring-pink-500" />
                                                </div>
                                                <button type="submit" className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-[4px] shadow-xl hover:bg-pink-600 transition-all mt-4">Initialize Registry</button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="space-y-12">
                                            <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 border-b-8 border-pink-500">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 shadow-inner"><Gift size={32} /></div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Registry Active</p>
                                                        <h2 className="text-3xl font-black italic tracking-tighter text-[#111] uppercase">{registryData.wedding.name1} & {registryData.wedding.name2}</h2>
                                                        <div className="flex gap-4 mt-2">
                                                            <span className="text-[10px] font-black bg-pink-100 text-pink-600 px-3 py-1 rounded-full uppercase italic tracking-widest"><Calendar size={12} className="inline mr-1" /> {registryData.wedding.date}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => { localStorage.removeItem('fs_wedding_reg'); setRegistryData(prev => ({ ...prev, wedding: null })); }} className="text-[10px] font-black text-gray-300 hover:text-red-500 uppercase tracking-[3px] transition-colors">Terminate Registry</button>
                                            </div>

                                            <div className="space-y-8">
                                                <div>
                                                    <h3 className="text-2xl font-black italic tracking-tighter uppercase text-[#111]">Premium <span className="text-pink-600">Wedding Collection</span></h3>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">High-end home essentials curated for the new couple.</p>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                                                    {weddingProducts.length > 0 ? weddingProducts.slice(0, 8).map(product => (
                                                        <div key={product.id} className="group bg-white p-5 rounded-3xl border border-gray-100 hover:shadow-2xl transition-all relative overflow-hidden cursor-pointer">
                                                            <Link to={`/products/${product.id}`} className="aspect-square bg-[#f9f9f9] rounded-2xl flex items-center justify-center mb-4 p-4 block">
                                                                <img src={product.image} alt={product.title} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                                                            </Link>
                                                            <Link to={`/products/${product.id}`} className="text-[10px] font-black uppercase text-[#111] line-clamp-2 min-h-[2.5rem] mb-2 hover:text-pink-600 transition-colors block">{product.title}</Link>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xl font-black text-[#111]">{formatCurrency(product.price)}</p>
                                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }} className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-pink-600 transition-all"><ShoppingBag size={16} /></button>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="col-span-full text-center py-10 text-gray-400 font-bold uppercase tracking-widest">No matching products found.</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* FIND VIEW */}
                            {activeTab === 'find' && (
                                <motion.div key="find" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                    <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 p-20 text-center space-y-10">
                                        <div className="w-24 h-24 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto shadow-inner"><Search size={48} /></div>
                                        <div className="max-w-xl mx-auto space-y-4">
                                            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-[#111]">Find a Registry</h2>
                                            <p className="text-gray-400 font-bold text-xs uppercase tracking-[3px] leading-relaxed">Search by name or email to find a friend's curated collection.</p>
                                        </div>
                                        <div className="max-w-md mx-auto relative">
                                            <input
                                                type="text"
                                                placeholder="Enter name or email..."
                                                value={findQuery}
                                                onChange={e => setFindQuery(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSearchRegistry()}
                                                className="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl pl-14 pr-6 font-bold outline-none focus:ring-2 focus:ring-[#e47911] shadow-inner"
                                            />
                                            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <button
                                                onClick={handleSearchRegistry}
                                                disabled={isSearching}
                                                className="w-full mt-6 h-14 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-[4px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                {isSearching ? <RefreshCw size={14} className="animate-spin" /> : null}
                                                {isSearching ? 'Analyzing Network...' : 'Search Registry'}
                                            </button>
                                        </div>
                                    </div>

                                    {foundRegistries.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                                            {foundRegistries.map(reg => (
                                                <div key={reg.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl flex items-center justify-between group hover:border-[#e47911] transition-all cursor-pointer">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${reg.type === 'wedding' ? 'bg-pink-50 text-pink-500' : 'bg-cyan-50 text-cyan-500'}`}>
                                                            {reg.type === 'wedding' ? <Gift size={24} /> : <Baby size={24} />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black uppercase italic tracking-tighter text-[#111]">{reg.name}</h4>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{reg.owner} • {reg.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-[#e47911] group-hover:text-white transition-all">
                                                        <ChevronRight size={18} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* CREATE MODAL OVERLAY */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white rounded-[40px] w-full max-w-lg p-12 relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                            <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"><Trash2 size={24} /></button>
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2 text-[#111]">New Collection</h2>
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[4px] mb-10">Initialize Your Digital Vault</p>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Collection Name</label>
                                    <input type="text" placeholder="e.g. My Dream Tech Setup" className="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-6 font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Visibility Protocol</label>
                                    <select className="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-6 font-bold text-sm outline-none appearance-none">
                                        <option>Private (Only You)</option>
                                        <option>Shared (Friends Only)</option>
                                        <option>Global Public</option>
                                    </select>
                                </div>
                                <button className="w-full h-16 bg-gradient-to-r from-[#FFD814] to-[#F7CA00] text-black font-black uppercase text-xs tracking-[5px] rounded-2xl shadow-xl hover:shadow-yellow-500/20 active:scale-95 transition-all mt-6">Create List</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PRIME MEMBERSHIP MODAL */}
            <AnimatePresence>
                {isPrimeModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden relative shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                            <div className="bg-[#131921] p-10 text-white relative">
                                <button onClick={() => setIsPrimeModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-white transition-colors"><Trash2 size={24} /></button>
                                <Zap size={40} className="text-[#FF9900] mb-4 animate-pulse" />
                                <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Prime Hub Elite</h2>
                                <p className="text-[#FF9900] text-[10px] font-bold uppercase tracking-[4px] mt-2">Application Protocol</p>
                            </div>
                            <form onSubmit={handlePrimeUpgrade} className="p-12 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Full Name</label>
                                        <input required value={primeFormData.name} onChange={e => setPrimeFormData({ ...primeFormData, name: e.target.value })} type="text" className="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-6 font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Membership Goal</label>
                                        <select value={primeFormData.goal} onChange={e => setPrimeFormData({ ...primeFormData, goal: e.target.value })} className="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-6 font-bold text-sm outline-none appearance-none">
                                            <option>Saving & Rewards</option>
                                            <option>Faster Logistics</option>
                                            <option>Exclusive Access</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Business/Employment Details (Optional)</label>
                                    <input value={primeFormData.business} onChange={e => setPrimeFormData({ ...primeFormData, business: e.target.value })} type="text" placeholder="e.g. Retail Manager" className="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-6 font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[11px] text-gray-400 font-bold leading-relaxed px-2">By submitting this form, you agree to the Elite Membership protocols. Your 20% standard discount will be activated instantly upon system sync.</p>
                                    <button type="submit" className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black uppercase text-xs tracking-[5px] rounded-2xl shadow-xl hover:shadow-blue-500/20 active:scale-95 transition-all">Initialize Enrollment</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Sub-components
const ChevronRight = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>;

export default Wishlist;
