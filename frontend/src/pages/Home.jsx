import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Zap, ShieldCheck, Timer, ChevronRight,
    Sparkles, Smartphone, Monitor, ShoppingBag,
    Truck, Star, Heart, RotateCcw, Mic, ChevronLeft,
    CheckCircle2, Box, CreditCard, Headphones, Laptop, Shirt, Gamepad2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const BANNERS = [
    {
        title: "UP TO 70% OFF",
        subtitle: "Electronics & Gadgets Sale",
        tag: "Limited Time Offer",
        img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2670&auto=format&fit=crop",
        accent: "#FF9900"
    },
    {
        title: "FASHION FRIDAY",
        subtitle: "The Ultimate Style Guide 2026",
        tag: "Premium Brands",
        img: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2670&auto=format&fit=crop",
        accent: "#232F3E"
    },
    {
        title: "HOME ESSENTIALS",
        subtitle: "Upgrade Your Living Space",
        tag: "Top Rated",
        img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2669&auto=format&fit=crop",
        accent: "#007185"
    }
];

const CATEGORY_BOXES = [
    {
        title: "Electronics & Gadgets",
        items: [
            { name: "Mobiles", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop", link: "/products?category=Mobiles" },
            { name: "Laptops", img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop", link: "/products?category=Electronics" },
            { name: "Audio", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop", link: "/products?category=Audio" },
            { name: "Gaming", img: "https://images.unsplash.com/photo-1606813907291-d86ebb9b7427?w=400&auto=format&fit=crop", link: "/products?category=Gaming" }
        ],
        link: "/products?category=Electronics"
    },
    {
        title: "New Arrivals in Fashion",
        items: [
            { name: "Menswear", img: "https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=400&auto=format&fit=crop", link: "/products?category=Fashion" },
            { name: "Womenswear", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop", link: "/products?category=Fashion" },
            { name: "Footwear", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop", link: "/products?category=Fashion" },
            { name: "Accessories", img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&auto=format&fit=crop", link: "/products?category=Fashion" }
        ],
        link: "/products?category=Fashion"
    },
    {
        title: "Home & Kitchen",
        items: [
            { name: "Kitchen", img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&auto=format&fit=crop", link: "/products?category=Home & Kitchen" },
            { name: "Decor", img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop", link: "/products?category=Home & Kitchen" },
            { name: "Furniture", img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&auto=format&fit=crop", link: "/products?category=Home & Kitchen" },
            { name: "Appliances", img: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&auto=format&fit=crop", link: "/products?category=Home & Kitchen" }
        ],
        link: "/products?category=Home & Kitchen"
    },
    {
        title: "Best Sellers in Beauty",
        items: [
            { name: "Skincare", img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop", link: "/products?category=Beauty" },
            { name: "Fragrance", img: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&auto=format&fit=crop", link: "/products?category=Beauty" },
            { name: "Wellness", img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&auto=format&fit=crop", link: "/products?category=Beauty" },
            { name: "Books", img: "https://images.unsplash.com/photo-1543004629-ff569587207d?w=400&auto=format&fit=crop", link: "/products?category=Books" }
        ],
        link: "/products?category=Beauty"
    }
];

const Home = ({ products = [], toggleWishlist, addToCart }) => {
    const navigate = useNavigate();
    const [activeBanner, setActiveBanner] = useState(0);
    const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 54 });
    const scrollRef = useRef(null);

    useEffect(() => {
        const bannerTimer = setInterval(() => setActiveBanner(prev => (prev + 1) % BANNERS.length), 6000);
        const clockTimer = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev;
                if (seconds > 0) seconds--;
                else if (minutes > 0) { minutes--; seconds = 59; }
                else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
                return { hours, minutes, seconds };
            });
        }, 1000);
        return () => {
            clearInterval(bannerTimer);
            clearInterval(clockTimer);
        };
    }, []);

    const nextBanner = () => setActiveBanner((activeBanner + 1) % BANNERS.length);
    const prevBanner = () => setActiveBanner((activeBanner - 1 + BANNERS.length) % BANNERS.length);

    // Filter deals (discounted products)
    const deals = products.filter(p => p.discount_price < p.price || p.discount).slice(0, 10);
    // If no deals, just show some products
    const displayDeals = deals.length > 0 ? deals : products.slice(0, 10);

    return (
        <div className="bg-[#E3E6E6] min-h-screen font-sans pb-10 pt-[140px] lg:pt-[100px]">

            {/* HERO CAROUSEL */}
            <div className="relative w-full h-[300px] sm:h-[450px] lg:h-[600px] overflow-hidden group">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeBanner}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0"
                    >
                        <img src={BANNERS[activeBanner].img} className="w-full h-full object-cover" alt="Banner" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#E3E6E6]"></div>
                    </motion.div>
                </AnimatePresence>

                {/* Banner Controls */}
                <button onClick={prevBanner} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-20 bg-black/10 hover:bg-black/20 flex items-center justify-center text-white rounded-r-md transition-all z-20">
                    <ChevronLeft size={48} strokeWidth={1} />
                </button>
                <button onClick={nextBanner} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-20 bg-black/10 hover:bg-black/20 flex items-center justify-center text-white rounded-l-md transition-all z-20">
                    <ChevronRight size={48} strokeWidth={1} />
                </button>

                {/* Banner Text Content */}
                <div className="absolute top-[20%] left-12 z-20 max-w-xl hidden lg:block">
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        key={activeBanner + "text"}
                    >
                        <span className="text-white bg-[#CC0C39] px-4 py-1 text-sm font-bold rounded-sm mb-4 inline-block">{BANNERS[activeBanner].tag}</span>
                        <h1 className="text-7xl font-black text-white leading-tight drop-shadow-2xl">{BANNERS[activeBanner].title}</h1>
                        <p className="text-2xl text-white font-medium drop-shadow-lg">{BANNERS[activeBanner].subtitle}</p>
                        <button onClick={() => navigate('/products')} className="mt-8 bg-white text-black px-10 py-4 rounded-full font-bold shadow-2xl hover:bg-[#FF9900] hover:text-white transition-all transform hover:scale-105 active:scale-95">
                            Shop Now
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* MAIN GRID - AMAZON OVERLAP STYLE */}
            <div className="container mx-auto px-4 lg:-mt-[280px] relative z-30">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {CATEGORY_BOXES.map((box, i) => (
                        <div key={i} className="bg-white p-5 shadow-sm flex flex-col h-full">
                            <h3 className="text-[21px] font-bold text-[#111] mb-4 h-14 overflow-hidden">{box.title}</h3>
                            <div className="grid grid-cols-2 gap-3 flex-1 mb-4">
                                {box.items.map((item, idx) => (
                                    <div key={idx} onClick={() => navigate(item.link || box.link)} className="cursor-pointer group flex flex-col">
                                        <div className="aspect-square bg-gray-50 overflow-hidden mb-1 flex items-center justify-center">
                                            <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <span className="text-[12px] font-medium text-[#111] group-hover:text-[#C7511F]">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                            <Link to={box.link} className="text-[#007185] text-xs font-bold hover:text-[#C7511F] hover:underline uppercase tracking-wider">See More</Link>
                        </div>
                    ))}
                </div>

                {/* SIGN IN PROMPT */}
                {!localStorage.getItem('fs_token') && (
                    <div className="bg-white p-8 my-6 shadow-sm flex flex-col items-center border border-gray-200">
                        <h4 className="text-[21px] font-bold text-black mb-4">Experience the best of Fast Shopping</h4>
                        <button onClick={() => navigate('/login')} className="bg-gradient-to-b from-[#f7dfa1] to-[#f0c14b] hover:from-[#f5d78e] hover:to-[#eeb933] border border-[#a88734] px-16 py-2.5 rounded-md font-bold text-[14px] text-black shadow-sm transition-all active:scale-95">
                            Sign in securely
                        </button>
                        <Link to="/login" className="mt-4 text-[#007185] text-sm hover:underline hover:text-[#C7511F]">New customer? Start here.</Link>
                    </div>
                )}

                {/* TODAY'S DEALS */}
                <div className="bg-white p-6 my-6 shadow-sm overflow-hidden border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                        <h3 className="text-[21px] font-bold text-[#111]">Today's Top Deals</h3>
                        <div className="flex items-center gap-2 bg-[#CC0C39] text-white px-3 py-1.5 text-xs font-bold rounded-sm shadow-sm">
                            <Timer size={14} />
                            Ends in {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                        </div>
                        <Link to="/products" className="text-[#007185] text-sm font-bold sm:ml-auto hover:text-[#C7511F] hover:underline">See all deals</Link>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide select-none snap-x">
                        {displayDeals.map((p, i) => (
                            <div key={i} className="min-w-[220px] max-w-[220px] flex flex-col group cursor-pointer snap-start" onClick={() => navigate(`/product/${p.id || i}`)}>
                                <div className="aspect-square bg-gray-50 flex items-center justify-center p-6 mb-3 relative rounded-sm border border-gray-100 group-hover:bg-white transition-colors">
                                    <img src={p.image} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" alt={p.title} />
                                    <div className="absolute top-2 left-2 bg-[#CC0C39] text-white text-[11px] font-black px-2 py-1 rounded-sm shadow-sm">
                                        UP TO {p.discount || 40}% OFF
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="bg-[#CC0C39] text-white text-[10px] font-black px-2 py-0.5 rounded-sm uppercase">LTD Deal</span>
                                    <span className="text-[#CC0C39] text-[11px] font-bold uppercase tracking-tight">Ends Soon</span>
                                </div>
                                <p className="text-[14px] font-medium text-[#111] leading-tight line-clamp-2 min-h-[40px] group-hover:text-[#C7511F]">{p.title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TRENDING COLLECTIONS */}
                <div className="my-10">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h3 className="text-3xl font-black text-[#131921] uppercase tracking-tighter italic border-l-[10px] border-[#FF9900] pl-4 leading-none">Trending Collections</h3>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Curated by our expert shoppers</p>
                        </div>
                        <Link to="/products" className="text-[#007185] font-bold hover:text-[#C7511F] flex items-center gap-1 text-sm border-b-2 border-transparent hover:border-[#C7511F] transition-all pb-1">Explore All <ChevronRight size={18} /></Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {products.sort(() => 0.5 - Math.random()).slice(0, 10).map((p, i) => (
                            <ProductCard key={p.id || i} product={p} addToCart={addToCart} onWishlist={toggleWishlist} />
                        ))}
                    </div>
                </div>

                {/* PREMIUM FEATURES BAR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-20 mb-10">
                    {[
                        { icon: <Truck size={24} />, title: "Free Fast Delivery", sub: "Available for Prime members on millions of items" },
                        { icon: <ShieldCheck size={24} />, title: "Secure Payments", sub: "We use 100% secure SSL encryption for transactions" },
                        { icon: <RotateCcw size={24} />, title: "7-Day Replacement", sub: "Hassle-free replacement policy for all categories" },
                        { icon: <CheckCircle2 size={24} />, title: "Authentic Products", sub: "Sourced directly from verified brands and sellers" }
                    ].map((f, i) => (
                        <div key={i} className="bg-white p-6 shadow-sm border border-gray-100 flex flex-col gap-4 group hover:shadow-md transition-all duration-300 rounded-sm">
                            <div className="text-[#FF9900] group-hover:scale-110 transition-transform w-[50px] h-[50px] bg-gray-50 flex items-center justify-center rounded-full">{f.icon}</div>
                            <div>
                                <h4 className="font-bold text-[15px] text-[#111] mb-1">{f.title}</h4>
                                <p className="text-[12px] text-[#565959] font-medium leading-tight">{f.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* NEWSLETTER */}
                <div className="bg-[#232F3E] rounded-md p-10 lg:p-16 mt-20 text-center relative overflow-hidden flex flex-col items-center">
                    <div className="relative z-10 max-w-3xl space-y-6">
                        <Sparkles size={40} className="text-[#FF9900] mx-auto opacity-80" />
                        <h3 className="text-4xl lg:text-5xl font-black italic tracking-tighter text-white uppercase leading-tight">Get the Insider Advantage</h3>
                        <p className="text-gray-300 font-medium text-lg leading-relaxed">Sign up to receive early access to Lightning Deals, New Releases, and exclusive Prime-only member rewards.</p>
                        <div className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto overflow-hidden rounded-md shadow-2xl">
                            <input type="email" placeholder="Your Email Address" className="flex-1 px-6 py-4 outline-none text-black font-medium" />
                            <button className="bg-[#FF9900] hover:bg-[#E47911] px-10 py-4 font-bold text-white transition-all uppercase tracking-widest text-sm">Subscribe</button>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">We never share your data. Unsubscribe at any time.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
