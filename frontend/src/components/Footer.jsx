import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Zap, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin,
    ShieldCheck, Truck, RotateCcw, HelpCircle, ArrowRight, Star,
    Package, CreditCard, Headphones, Youtube, Github, Globe,
    Smartphone, Monitor, ShoppingBag, Mic, Home, BookOpen, Gamepad2,
    Sparkles, TrendingUp, Gift, Heart, Download
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) { setSubscribed(true); setTimeout(() => setSubscribed(false), 3000); setEmail(''); }
    };

    const shoppingLinks = [
        { name: "Smart Mobiles", cat: "Mobiles", icon: <Smartphone size={14} />, badge: "AI", badgeColor: "bg-blue-500/20 text-blue-400", desc: "Neural processing & 6G capable devices" },
        { name: "Pro Electronics", cat: "Electronics", icon: <Monitor size={14} />, desc: "Professional grade tech gear" },
        { name: "Elite Fashion", cat: "Fashion", icon: <ShoppingBag size={14} />, badge: "NEW", badgeColor: "bg-pink-500/20 text-pink-400", desc: "Latest runway collections" },
        { name: "Home Automation", cat: "Home", icon: <Home size={14} />, badge: "IOT", badgeColor: "bg-teal-500/20 text-teal-400", desc: "Smart home connectivity hubs" },
        { name: "Studio Audio & Mics", cat: "Mics", icon: <Mic size={14} />, desc: "Lossless audio and recording gear" },
        { name: "VR & Wearables", cat: "Electronics", icon: <Globe size={14} />, badge: "PRO", badgeColor: "bg-purple-500/20 text-purple-400", desc: "Next-gen immersive reality" },
        { name: "Cyber Accessories", cat: "Electronics", icon: <Zap size={14} />, desc: "Advanced neon gaming setups" },
        { name: "Premium Brands", cat: "All", icon: <Star size={14} />, badge: "EXCLUSIVE", badgeColor: "bg-yellow-500/20 text-yellow-400", desc: "Top tier verified vendors only" },
    ];

    const inventoryLinks = [
        { name: "Esports Gaming", cat: "Gaming", icon: <Gamepad2 size={14} />, desc: "Competitive low-latency gear" },
        { name: "AI Appliances", cat: "Appliances", icon: <Zap size={14} />, badge: "SMART", badgeColor: "bg-blue-500/20 text-blue-400", desc: "Self-learning home appliances" },
        { name: "Digital Books", cat: "Books", icon: <BookOpen size={14} />, desc: "Instant e-reader downloads" },
        { name: "Fresh Arrivals", cat: "All", icon: <Sparkles size={14} />, badge: "HOT", badgeColor: "bg-orange-500/20 text-orange-400", desc: "Algorithm-picked daily drops" },
        { name: "Global Best Sellers", cat: "All", icon: <TrendingUp size={14} />, desc: "Top 1% rated global items" },
        { name: "Overstock Deals", cat: "All", icon: <Package size={14} />, badge: "SALE", badgeColor: "bg-red-500/20 text-red-400", desc: "Wholesale discounted inventory" },
        { name: "Refurbished Hub", cat: "All", icon: <RotateCcw size={14} />, badge: "ECO", badgeColor: "bg-green-500/20 text-green-400", desc: "Certified restored technology" },
        { name: "Global Imports", cat: "All", icon: <Globe size={14} />, desc: "Rare international sourcing" },
    ];

    const helpAccountLinks = [
        { label: "Live Order Tracking", to: "/orders", badge: "GPS", badgeColor: "bg-blue-500/20 text-blue-400", desc: "Real-time satellite logistics tracking" },
        { label: "Instant Return Portal", to: "/orders", desc: "AI-approved 60-second returns" },
        { label: "Identity & Security", to: "/profile", badge: "2FA", badgeColor: "bg-green-500/20 text-green-400", desc: "Biometric and quantum encryption settings" },
        { label: "Digital Wishlist", to: "/wishlist", desc: "Cloud-synced smart cart tracking" },
        { label: "Active Shopping Cart", to: "/cart", desc: "Multi-device session memory" },
        { label: "Prime Ecosystem", to: "/prime", badge: "VIP", badgeColor: "bg-yellow-500/20 text-yellow-400", desc: "Exclusive membership benefits dashboard" },
        { label: "24/7 Priority Support", to: "/support", badge: "LIVE", badgeColor: "bg-red-500/20 text-red-400", desc: "Skip the queue human assistance" },
        { label: "Payment & Billing Logs", to: "/profile", desc: "Blockchain verified transactional history" },
    ];

    return (
        <footer className="bg-gray-950 border-t border-gray-800 mt-20 text-white font-sans overflow-hidden">

            {/* Trust Bar */}
            <div className="bg-[#131921] py-8 border-b border-gray-800">
                <div className="container mx-auto px-4 lg:px-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: <Truck size={24} />, title: "Hyper-Speed Delivery", desc: "Global Logistics Network Active", color: "text-blue-400" },
                            { icon: <ShieldCheck size={24} />, title: "Enterprise Security", desc: "256-bit SSL Encrypted Payment", color: "text-green-400" },
                            { icon: <RotateCcw size={24} />, title: "Infinite Returns", desc: "7-day seamless restoration", color: "text-orange-400" },
                            { icon: <Headphones size={24} />, title: "Elite Support 24/7", desc: "Dedicated expert technicians", color: "text-purple-400" },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-5 group">
                                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${f.color} group-hover:scale-110 group-hover:bg-white/10 transition-all shadow-xl`}>
                                    {f.icon}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-white uppercase tracking-[2px]">{f.title}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container mx-auto px-4 lg:px-12 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 border-b border-gray-800 pb-20">

                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <Link to="/" className="flex items-center gap-4 group w-max">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[22px] flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                                <Zap size={32} className="text-white fill-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent italic">FAST SHOPPING</span>
                                <span className="text-[10px] font-black text-gray-500 tracking-[5px] uppercase -mt-1 opacity-80">Prime Ecosystem · 2026 v4.0</span>
                            </div>
                        </Link>
                        <p className="text-sm font-bold text-gray-500 leading-relaxed max-w-sm italic">
                            Redefining the digital shopping landscape with hyper-speed logistics and verified premium inventory. Part of the Global Fulfillment Network.
                        </p>

                        {/* Newsletter */}
                        <div className="space-y-4 bg-white/5 p-6 rounded-[28px] border border-gray-800 shadow-inner">
                            <p className="text-[10px] font-black uppercase tracking-[4px] text-blue-400">📮 Join Our Newsletter</p>
                            <form onSubmit={handleSubscribe} className="flex gap-2">
                                <input
                                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="your@sector.com"
                                    className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 text-xs font-black italic text-white placeholder:text-gray-700 outline-none focus:border-blue-600 transition-colors"
                                />
                                <button type="submit" className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subscribed ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-blue-600 hover:text-white'}`}>
                                    {subscribed ? 'SYNCED' : 'Authorize'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Categories Column 1 */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[4px] text-white flex items-center gap-2 mb-8 underline decoration-blue-600 decoration-2 underline-offset-8">
                            Shopping
                        </h4>
                        <div className="flex flex-col gap-5">
                            {shoppingLinks.map((c, i) => (
                                <Link
                                    key={i}
                                    to={`/products?category=${c.cat}`}
                                    className="flex flex-col gap-1.5 group"
                                >
                                    <div className="flex items-center gap-3 text-xs font-black text-gray-400 group-hover:text-blue-400 transition-all italic">
                                        <span className="text-gray-800 group-hover:text-blue-400 transition-colors">{c.icon}</span>
                                        <span>{c.name.toUpperCase()}</span>
                                        {c.badge && <span className={`text-[8px] px-1.5 py-0.5 rounded normal-case tracking-widest ${c.badgeColor}`}>{c.badge}</span>}
                                    </div>
                                    <p className="text-[9px] text-gray-600 font-medium not-italic normal-case pl-7 group-hover:text-gray-400 transition-colors">{c.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Categories Column 2 */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[4px] text-white flex items-center gap-2 mb-8 underline decoration-purple-600 decoration-2 underline-offset-8">
                            Inventory
                        </h4>
                        <div className="flex flex-col gap-5">
                            {inventoryLinks.map((c, i) => (
                                <Link
                                    key={i}
                                    to={`/products?category=${c.cat}`}
                                    className="flex flex-col gap-1.5 group"
                                >
                                    <div className="flex items-center gap-3 text-xs font-black text-gray-400 group-hover:text-purple-400 transition-all italic">
                                        <span className="text-gray-800 group-hover:text-purple-400 transition-colors">{c.icon}</span>
                                        <span>{c.name.toUpperCase()}</span>
                                        {c.badge && <span className={`text-[8px] px-1.5 py-0.5 rounded normal-case tracking-widest ${c.badgeColor}`}>{c.badge}</span>}
                                    </div>
                                    <p className="text-[9px] text-gray-600 font-medium not-italic normal-case pl-7 group-hover:text-gray-400 transition-colors">{c.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Support & Contact */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[4px] text-white flex items-center gap-2 mb-8 underline decoration-orange-600 decoration-2 underline-offset-8">
                            Help & Account
                        </h4>
                        <div className="flex flex-col gap-5">
                            {helpAccountLinks.map((l, i) => (
                                <Link key={i} to={l.to} className="flex flex-col gap-1.5 group">
                                    <div className="flex items-center gap-2 text-xs font-black text-gray-400 group-hover:text-orange-400 transition-all italic">
                                        <ArrowRight size={12} className="opacity-40 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                        <span>{l.label.toUpperCase()}</span>
                                        {l.badge && <span className={`text-[8px] px-1.5 py-0.5 rounded normal-case tracking-widest ${l.badgeColor}`}>{l.badge}</span>}
                                    </div>
                                    <p className="text-[9px] text-gray-600 font-medium not-italic normal-case pl-5 group-hover:text-gray-400 transition-colors">{l.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Download & Social */}
                    <div className="space-y-8">
                        <h4 className="text-xs font-black uppercase tracking-[4px] text-white mb-8 underline decoration-green-600 decoration-2 underline-offset-8">Connect</h4>

                        <div className="space-y-4">
                            <button className="w-full h-14 bg-white/5 border border-gray-800 rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all group">
                                <Smartphone size={20} />
                                <div className="text-left">
                                    <p className="text-[8px] font-black uppercase opacity-50">Download on the</p>
                                    <p className="text-[12px] font-black uppercase leading-none">App Store</p>
                                </div>
                            </button>
                            <button className="w-full h-14 bg-white/5 border border-gray-800 rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all group">
                                <Download size={20} />
                                <div className="text-left">
                                    <p className="text-[8px] font-black uppercase opacity-50">Get it on</p>
                                    <p className="text-[12px] font-black uppercase leading-none">Google Play</p>
                                </div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-4">
                            {[
                                { icon: <Facebook size={18} />, url: "https://www.facebook.com/" },
                                { icon: <Twitter size={18} />, url: "https://twitter.com/" },
                                { icon: <Instagram size={18} />, url: "https://www.instagram.com/blood__badshah/" },
                                { icon: <Youtube size={18} />, url: "https://www.youtube.com/" },
                                { icon: <Github size={18} />, url: "https://github.com/amitkumar262002" }
                            ].map((s, i) => (
                                <a key={i} href={s.url} target={s.url !== "#" ? "_blank" : "_self"} rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-white transition-all">
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Secure Site Meta */}
                <div className="py-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-black text-gray-700 uppercase tracking-[4px]">Verified Secure Payment Gateway</p>
                        <div className="flex items-center gap-3">
                            <CreditCard size={18} className="text-gray-800" />
                            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-40">
                                {["VISA", "MASTER", "UPI", "RAZORPAY", "PAYTM"].map(p => <span key={p} className="text-[9px] font-black border border-gray-800 px-2 py-0.5 rounded italic">{p}</span>)}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 bg-white/5 px-8 py-5 rounded-[24px] border border-gray-800 shadow-xl">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={28} className="text-green-500 shadow-green-500/20 shadow-lg" />
                            <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Quantum Encrypted</p>
                                <p className="text-[8px] font-bold text-gray-500 uppercase mt-1">SSL PROTOCOL v4.0.2</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-gray-800"></div>
                        <div className="flex items-center gap-3">
                            <Package size={28} className="text-blue-500" />
                            <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Region: INDIA-SOUTH</p>
                                <p className="text-[8px] font-bold text-gray-500 uppercase mt-1">NODE: FS-BLR-001</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Credits */}
                <div className="pt-10 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-6 text-gray-600 text-[10px] font-black uppercase tracking-[3px]">
                    <p>© 2026 FAST SHOPPING SYSTEMS. OPERATIONAL DATA PRIVACY AUTHORIZED.</p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></div>
                            <span className="text-green-500 italic">Core Engine: 100% Online</span>
                        </div>
                        <span className="text-gray-800">|</span>
                        <div className="flex items-center gap-2 hover:text-red-500 transition-colors cursor-default">
                            <Heart size={12} className="fill-current" /> Made for the Future
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
