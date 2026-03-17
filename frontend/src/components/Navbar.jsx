import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShoppingCart, Search, User, Menu, MapPin, ChevronDown,
    Package, Heart, LogOut, Mic, History, Wallet, Bell,
    Settings, ShieldCheck, HelpCircle, Star, Plus, ArrowRight, Tag, Timer, X, Zap, Globe, Languages, AudioLines, Sparkles, CreditCard, PlayCircle, Library, Share2, ClipboardList, UserPlus, Layers, Baby, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

const Navbar = ({ cartCount = 0, products = [] }) => {
    const { user, logout, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [defaultAddress, setDefaultAddress] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState("");
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [tempPincode, setTempPincode] = useState("");
    const [sessionPincode, setSessionPincode] = useState(() => localStorage.getItem('fs_pincode') || null);
    const [selectedLang, setSelectedLang] = useState("EN");
    const [selectedCurrency, setSelectedCurrency] = useState({ code: "INR", symbol: "₹", name: "Indian Rupee" });
    const [showCurrencyOptions, setShowCurrencyOptions] = useState(false);

    const dropdownRef = useRef(null);
    const langRef = useRef(null);
    const recognitionRef = useRef(null);

    const handleApplyPincode = () => {
        if (tempPincode.length === 6) {
            localStorage.setItem('fs_pincode', tempPincode);
            setSessionPincode(tempPincode);
            setShowLocationModal(false);
            toast.success(`Location set to ${tempPincode} 📍`);
        } else {
            toast.warning("Please enter a valid 6-digit pincode");
        }
    };

    const fetchDefaultAddress = async () => {
        if (!isLoggedIn) {
            setDefaultAddress(null);
            return;
        }
        try {
            console.log("📍 Syncing location for:", user?.name);
            const res = await authAPI.getAddresses();
            if (res.data && res.data.length > 0) {
                const def = res.data.find(a => a.is_default) || res.data[res.data.length - 1];
                setDefaultAddress(def);
                console.log("✅ Location synced:", def.city, def.pincode);
            } else {
                setDefaultAddress(null);
                console.log("ℹ️ No addresses found for user.");
            }
        } catch (err) {
            console.error("❌ Location sync failed:", err.response?.status === 401 ? "Unauthorized" : err.message);
            if (err.response?.status === 401) setDefaultAddress(null);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowAccountDropdown(false);
            }
            if (langRef.current && !langRef.current.contains(e.target)) {
                setShowLanguageDropdown(false);
            }
        };

        const handleStorageChange = () => {
            if (!localStorage.getItem('fs_token')) {
                setDefaultAddress(null);
            } else {
                fetchDefaultAddress();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener('addressUpdated', fetchDefaultAddress);
        window.addEventListener('storage', handleStorageChange);
        fetchDefaultAddress();

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener('addressUpdated', fetchDefaultAddress);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [isLoggedIn, user]);

    const suggestions = (products || [])
        .filter(p => (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 10);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            setShowSuggestions(false);
            navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const startVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Voice search not supported in this browser");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognitionRef.current = recognition;

        recognition.onstart = () => {
            setIsListening(true);
            setShowVoiceOverlay(true);
            setInterimTranscript("Listening...");
        };

        recognition.onresult = (event) => {
            let current = event.resultIndex;
            let transcript = event.results[current][0].transcript.toLowerCase();
            setInterimTranscript(transcript);

            if (event.results[current].isFinal) {
                setSearchQuery(transcript);

                // Smart Commands Logic
                const commands = {
                    "orders": "/profile?tab=orders",
                    "order": "/profile?tab=orders",
                    "profile": "/profile",
                    "account": "/profile",
                    "cart": "/cart",
                    "checkout": "/checkout",
                    "home": "/",
                    "recommendations": "/profile?tab=recommendations",
                    "prime": "/profile?tab=prime",
                    "messages": "/profile?tab=messages"
                };

                const commandMatch = Object.keys(commands).find(c => transcript.includes(c));

                setTimeout(() => {
                    setShowVoiceOverlay(false);
                    setIsListening(false);
                    if (commandMatch) {
                        toast.success(`Navigating to ${commandMatch}... 🚀`);
                        navigate(commands[commandMatch]);
                    } else {
                        navigate(`/products?q=${encodeURIComponent(transcript)}`);
                    }
                }, 1000);
            }
        };

        recognition.onerror = (event) => {
            console.error("Voice Search Error:", event.error);
            setIsListening(false);
            setInterimTranscript("Could not hear you. Please try again.");
            setTimeout(() => setShowVoiceOverlay(false), 2000);
        };

        recognition.onend = () => {
            setIsListening(false);
            if (!interimTranscript || interimTranscript === "Listening...") {
                setShowVoiceOverlay(false);
            }
        };

        recognition.start();
    };

    const stopVoiceSearch = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setShowVoiceOverlay(false);
        setIsListening(false);
    };

    return (
        <header className="fixed top-0 w-full z-[1000] font-sans shadow-xl">
            {/* TOP BAR - AMAZON BLACK THEME */}
            <div className="bg-[#131921] py-2 lg:py-0 lg:h-[60px] flex flex-wrap lg:flex-nowrap items-center px-3 gap-y-2 gap-x-1 lg:gap-4 text-white">

                <div className="flex items-center justify-between w-full lg:w-auto shrink-0">
                    {/* LOGO */}
                    <Link to="/" className="flex items-center p-1 lg:p-2 border border-transparent hover:border-white rounded-sm transition-all focus:outline-none">
                        <div className="relative flex flex-col items-center">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-lg sm:text-2xl font-black italic tracking-tighter text-white leading-none">
                                    FAST SHOPPING
                                </span>
                                {user?.is_prime && (
                                    <span className="text-[8px] bg-gradient-to-r from-blue-600 to-purple-600 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-[2px] shadow-lg shadow-blue-500/20">Elite</span>
                                )}
                            </div>
                            <span className="text-[9px] sm:text-[10px] text-[#FF9900] font-black self-end -mt-1 mr-1">.in</span>
                        </div>
                    </Link>

                    {/* Mobile Only Cart & Login indicator (shows when lg breaks) */}
                    <div className="flex lg:hidden items-center gap-3">
                        {!isLoggedIn && (
                            <Link to="/login" className="text-sm font-bold tracking-tight border border-transparent hover:border-white p-1 rounded">Sign in</Link>
                        )}
                        {isLoggedIn && (
                            <Link to="/profile" className="flex items-center gap-1 font-bold text-[13px] border border-transparent p-1 truncate max-w-[80px]">
                                <User size={16} /> {user?.name?.split(" ")[0]}
                            </Link>
                        )}
                        <Link to="/cart" className="flex items-center p-1 border border-transparent hover:border-white rounded-sm relative group">
                            <ShoppingCart size={26} className="text-white" />
                            <span className="absolute -top-1 left-[14px] text-[#e47911] text-[14px] font-black">
                                {cartCount}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* LOCATION PICKER - DYNAMIC */}
                <div
                    onClick={() => setShowLocationModal(true)}
                    className="hidden lg:flex items-center p-2 border border-transparent hover:border-white rounded-sm cursor-pointer min-w-fit shrink-0 group transition-all"
                >
                    <MapPin size={18} className="mt-2 text-[#CCCCCC] group-hover:text-white transition-colors" />
                    <div className="flex flex-col ml-1">
                        <span className="text-[11px] text-[#CCCCCC] leading-tight font-medium">Deliver to {user?.name || 'Guest'}</span>
                        <span className="text-[14px] font-extrabold leading-tight text-white flex items-center gap-1">
                            {defaultAddress ? `${defaultAddress.city} ${defaultAddress.pincode}` :
                                sessionPincode ? `India ${sessionPincode}` : 'Select your address'}
                            <ChevronDown size={10} className="mt-1 opacity-50" />
                        </span>
                    </div>
                </div>

                {/* SEARCH BAR - AMAZON STYLE */}
                <form
                    onSubmit={handleSearch}
                    className="w-full lg:flex-1 order-last lg:order-none flex items-center h-[40px] relative group mt-1 lg:mt-0"
                >
                    <div className="hidden md:flex items-center h-full bg-[#f3f3f3] hover:bg-[#dadada] text-[#555] px-3 rounded-l-md border-r border-[#bbb] cursor-pointer text-[12px] font-bold">
                        All <ChevronDown size={14} className="ml-1" />
                    </div>
                    <div className="flex-1 h-full relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onFocus={() => setShowSuggestions(true)}
                            onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                            placeholder="Search Fast Shopping"
                            className="w-full h-full px-3 text-[#111] text-[15px] outline-none group-focus-within:ring-2 group-focus-within:ring-[#FF9900] rounded-r-md md:rounded-none"
                        />

                        {/* Suggestions Layer */}
                        <AnimatePresence>
                            {showSuggestions && searchQuery.trim() && (
                                <motion.div
                                    initial={{ opacity: 0, y: 0 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute top-[40px] left-0 right-0 bg-white shadow-2xl border border-[#bbb] z-[2100] max-h-[400px] overflow-y-auto rounded-b-md"
                                >
                                    {suggestions.length > 0 ? (
                                        suggestions.map(s => (
                                            <div
                                                key={s.id}
                                                onClick={() => { setSearchQuery(s.title); handleSearch(); }}
                                                className="px-4 py-3 flex items-center gap-3 hover:bg-[#f3f3f3] cursor-pointer text-[#111] border-b border-gray-50 last:border-0"
                                            >
                                                <Search size={16} className="text-[#888]" />
                                                <span className="text-[14px] font-bold">{s.title}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-gray-500 italic">No exact matches found</div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Advanced Voice Search Mic Button */}
                    <button
                        type="button"
                        onClick={startVoiceSearch}
                        className={`absolute right-14 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-all group/mic ${isListening ? 'text-blue-600 scale-125' : 'text-gray-400'}`}
                        title="Search with your voice"
                    >
                        <Mic size={22} className={isListening ? "animate-bounce" : "group-hover/mic:text-blue-500"} />
                        {isListening && <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-25"></span>}
                    </button>

                    <button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] h-full px-5 rounded-r-md transition-all shrink-0 hidden md:block">
                        <Search size={22} className="text-[#333]" />
                    </button>
                    {showSuggestions && <div className="fixed inset-0 z-[1050]" onClick={() => setShowSuggestions(false)}></div>}
                </form>

                {/* LANGUAGE & COUNTRY SELECTOR */}
                <div
                    ref={langRef}
                    className="relative hidden xl:flex items-center p-2 border border-transparent hover:border-white rounded-sm cursor-pointer gap-1 group transition-all"
                    onMouseEnter={() => setShowLanguageDropdown(true)}
                    onMouseLeave={() => setShowLanguageDropdown(false)}
                >
                    <div className="relative">
                        <img src="https://flagcdn.com/in.svg" className="w-5 h-4 object-cover shadow-sm rounded-[1px]" alt="IN" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-[#131921]"></div>
                    </div>
                    <span className="text-[14px] font-bold ml-1 tracking-tight">{selectedLang}</span>
                    <ChevronDown size={11} className="mt-1 text-[#ccc] group-hover:text-white transition-colors" />

                    <AnimatePresence>
                        {showLanguageDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute top-[38px] left-[-20px] w-[260px] bg-white text-[#333] shadow-[0_10px_30px_rgba(0,0,0,0.3)] rounded-sm border border-gray-200 p-5 z-[2000]"
                                onMouseEnter={() => setShowLanguageDropdown(true)}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                        <div className="flex items-center gap-2">
                                            <Globe size={16} className="text-gray-500" />
                                            <span className="text-[13px] font-extrabold text-[#111] uppercase tracking-wider">Settings</span>
                                        </div>
                                        <X size={14} className="text-gray-300 cursor-pointer hover:text-black transition-colors" onClick={() => setShowLanguageDropdown(false)} />
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { lang: "English", code: "EN" },
                                            { lang: "हिन्दी", code: "HI" },
                                            { lang: "தமிழ்", code: "TA" },
                                            { lang: "తెలుగు", code: "TE" },
                                            { lang: "ಕನ್ನಡ", code: "KN" },
                                            { lang: "മലയാളം", code: "ML" },
                                            { lang: "বাংলা", code: "BN" },
                                            { lang: "मराठी", code: "MR" }
                                        ].map((l, i) => (
                                            <label key={i} className="flex items-center gap-3 cursor-pointer group/item py-0.5">
                                                <input
                                                    type="radio"
                                                    name="lang"
                                                    checked={selectedLang === l.code}
                                                    onChange={async () => {
                                                        setSelectedLang(l.code);
                                                        toast.success(`Language changed to ${l.lang}`);
                                                        setTimeout(() => setShowLanguageDropdown(false), 500);
                                                    }}
                                                    className="w-4 h-4 accent-[#e47911] cursor-pointer"
                                                />
                                                <span className={`text-[13px] transition-colors ${selectedLang === l.code ? 'text-[#e47911] font-bold' : 'text-[#444] group-hover/item:text-[#e47911]'}`}>
                                                    {l.lang} <span className="text-[10px] opacity-40 ml-1">({l.code})</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {/* Advanced Currency Switcher */}
                                    <div className="border-t border-gray-100 pt-3 mt-2">
                                        <div className="flex items-center justify-between text-[11px] text-gray-400 font-black uppercase tracking-widest mb-2">
                                            <span className="flex items-center gap-1"><CreditCard size={12} /> Currency</span>
                                            <span
                                                onClick={() => setShowCurrencyOptions(!showCurrencyOptions)}
                                                className="text-[#007185] cursor-pointer hover:underline flex items-center gap-1 bg-blue-50/50 px-2 py-0.5 rounded-full"
                                            >
                                                Change <ChevronDown size={10} className={`transition-transform duration-300 ${showCurrencyOptions ? 'rotate-180' : ''}`} />
                                            </span>
                                        </div>

                                        <AnimatePresence initial={false}>
                                            {showCurrencyOptions ? (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden space-y-1 mb-2 bg-[#fcfdfe] border border-blue-50 rounded-md p-1"
                                                >
                                                    {[
                                                        { code: "INR", symbol: "₹", name: "Indian Rupee" },
                                                        { code: "USD", symbol: "$", name: "US Dollar" },
                                                        { code: "EUR", symbol: "€", name: "Euro" },
                                                        { code: "GBP", symbol: "£", name: "British Pound" },
                                                        { code: "AED", symbol: "د.إ", name: "Arab Emirates Dirham" }
                                                    ].map((c) => (
                                                        <div
                                                            key={c.code}
                                                            onClick={async () => {
                                                                setSelectedCurrency(c);
                                                                toast.success(`Currency switched to ${c.code} (${c.symbol})`);
                                                                setTimeout(() => setShowCurrencyOptions(false), 300);
                                                            }}
                                                            className={`flex items-center justify-between text-[13px] px-2 py-1.5 rounded cursor-pointer transition-all ${selectedCurrency.code === c.code ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-sm' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}
                                                        >
                                                            <span>{c.symbol} - {c.code} - {c.name}</span>
                                                            {selectedCurrency.code === c.code && <span className="text-blue-600 font-bold">✓</span>}
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            ) : (
                                                <p className="text-[13px] font-bold text-[#111] flex items-center justify-between bg-gray-50 px-2 py-1.5 rounded-md border border-gray-100">
                                                    <span>{selectedCurrency.symbol} &nbsp; {selectedCurrency.code} &nbsp; <span className="font-medium text-gray-500">- {selectedCurrency.name}</span></span>
                                                    {selectedCurrency.code === "INR" && <span className="text-[9px] px-1.5 py-0.5 bg-[#131921] text-white rounded uppercase tracking-wider font-bold">Default</span>}
                                                </p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Advanced Country / Region Selector */}
                                    <div className="border-t border-gray-100 pt-3 mt-2">
                                        <div className="flex items-center gap-3 mb-3 p-2.5 bg-gradient-to-r from-[#f3f8f9] to-[#e6f3f5] border border-blue-100 rounded-md shadow-sm relative overflow-hidden group/region cursor-default">
                                            {/* Decorative shine */}
                                            <div className="absolute inset-0 bg-white/40 w-[30px] -skew-x-12 -translate-x-10 group-hover/region:translate-x-[250px] transition-transform duration-700 ease-in-out pointer-events-none"></div>

                                            <div className="relative">
                                                <img src="https://flagcdn.com/in.svg" className="w-7 h-5 object-cover shadow-md border border-gray-200 rounded-sm relative z-10" alt="IN" />
                                                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-white z-20 shadow-sm animate-pulse"></div>
                                            </div>

                                            <div className="flex flex-col z-10">
                                                <span className="text-[10px] uppercase font-black tracking-widest text-[#007185] flex items-center gap-1 mb-0.5">
                                                    Current Region <Globe size={10} />
                                                </span>
                                                <span className="text-[13px] font-black text-gray-800 leading-tight">FastShopping.in</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => toast.info("🌍 Global shipping destinations active. Over 100+ countries supported!", { icon: "✈️" })}
                                            className="w-full text-[13px] text-white bg-[#131921] border border-transparent hover:bg-[#232f3e] rounded-md font-bold py-2 flex items-center justify-center gap-2 group/btn transition-all shadow-md active:scale-95"
                                        >
                                            Change Country/Region
                                            <Globe size={14} className="group-hover/btn:animate-spin transition-transform opacity-70 group-hover/btn:opacity-100" />
                                        </button>
                                        <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">Valid customs and duties apply for international shipping.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ACCOUNT & LISTS */}
                <div
                    ref={dropdownRef}
                    className="relative hidden lg:flex flex-col p-2 border border-transparent hover:border-white rounded-sm cursor-pointer min-w-fit shrink-0 group"
                    onMouseEnter={() => setShowAccountDropdown(true)}
                    onMouseLeave={() => setShowAccountDropdown(false)}
                >
                    <span className="text-[12px] leading-tight font-medium">Hello, {user?.name?.split(" ")[0] || 'sign in'}</span>
                    <span className="text-[14px] font-extrabold leading-tight flex items-center text-white">
                        Account & Lists <ChevronDown size={11} className="ml-1 mt-1 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </span>

                    <AnimatePresence>
                        {showAccountDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute top-[42px] right-[-40px] w-[500px] bg-white text-[#333] shadow-[0_10px_40px_rgba(0,0,0,0.3)] rounded-sm border border-gray-200 p-8 z-[2000] cursor-default"
                            >
                                {!isLoggedIn && (
                                    <div className="flex flex-col items-center mb-8 border-b border-gray-100 pb-8">
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="w-[200px] py-1.5 bg-gradient-to-b from-[#f7dfa1] to-[#f0c14b] border border-[#a88734] hover:bg-gradient-to-b hover:from-[#f5d78e] hover:to-[#eeb933] rounded-md font-bold text-[14px] text-black shadow-sm mb-2"
                                        >
                                            Sign in
                                        </button>
                                        <p className="text-[11px] text-[#222]">New customer? <Link to="/register" className="text-[#007185] hover:underline font-bold">Start here.</Link></p>
                                    </div>
                                )}

                                <div className="flex gap-10">
                                    {/* Left: Your Lists */}
                                    <div className="flex-1 border-r border-gray-100 pr-8">
                                        <h3 className="font-bold text-[16px] text-[#111] mb-5 tracking-tight flex items-center gap-2">
                                            <ClipboardList size={18} className="text-gray-400" /> Your Lists
                                        </h3>
                                        <ul className="space-y-3.5 text-[13px] font-medium text-[#444]">
                                            <Link to="/wishlist?tab=create" className="hover:underline hover:text-[#e47911] cursor-pointer flex items-center gap-2 group/link">
                                                <Plus size={14} className="text-gray-400 group-hover/link:text-[#e47911]" /> Create a List
                                            </Link>
                                            <Link to="/wishlist?tab=find" className="hover:underline hover:text-[#e47911] cursor-pointer flex items-center gap-2">
                                                <Search size={14} className="text-gray-400" /> Find a List or Registry
                                            </Link>
                                            <li className="hover:underline hover:text-[#e47911] cursor-pointer flex items-center gap-2">
                                                <Share2 size={14} className="text-gray-400" /> Wish from Any Website
                                            </li>
                                            <Link to="/wishlist?tab=baby" className="hover:underline hover:text-[#e47911] cursor-pointer flex items-center gap-2">
                                                <Baby size={14} className="text-cyan-600" /> Baby Registry
                                            </Link>
                                            <Link to="/wishlist?tab=wedding" className="hover:underline hover:text-[#e47911] cursor-pointer flex items-center gap-2">
                                                <Gift size={14} className="text-pink-500" /> Wedding Registry
                                            </Link>
                                            <div className="h-[1px] bg-gray-50 my-3"></div>
                                            <Link to="/wishlist" className="flex items-center gap-2 hover:underline hover:text-[#e47911] font-bold text-[#e47911]">
                                                <Settings size={14} /> Manage Your Lists
                                            </Link>
                                        </ul>
                                    </div>

                                    {/* Right: Your Account */}
                                    <div className="flex-[1.2] pl-2">
                                        <h3 className="font-bold text-[16px] text-[#111] mb-5 tracking-tight flex items-center gap-2">
                                            <User size={18} className="text-gray-400" /> Your Account
                                        </h3>
                                        <ul className="space-y-3 text-[13px] font-medium text-[#444]">
                                            <Link to="/profile" className="flex items-center gap-2 hover:underline hover:text-[#e47911]">
                                                <User size={14} className="text-gray-400" /> Your Account
                                            </Link>
                                            <Link to="/profile?tab=orders" className="flex items-center gap-2 hover:underline hover:text-[#e47911]">
                                                <Package size={14} className="text-gray-400" /> Your Orders
                                            </Link>
                                            <Link to="/wishlist" className="flex items-center gap-2 hover:underline hover:text-[#e47911]">
                                                <Heart size={14} className="text-gray-400" /> Your Wishlist
                                            </Link>

                                            <Link to="/profile?tab=recommendations" className="hover:underline hover:text-[#e47911] cursor-pointer flex items-center gap-2">
                                                <Star size={14} className="text-[#FF9900]" /> Your Recommendations
                                            </Link>
                                            <Link to="/profile?tab=prime" className="hover:underline hover:text-[#e47911] cursor-pointer flex items-center gap-2">
                                                <Zap size={14} className="text-blue-500" /> Your Prime Membership
                                            </Link>
                                            <li className="hover:underline hover:text-[#e47911] cursor-pointer flex items-center gap-2">
                                                <PlayCircle size={14} className="text-red-500" /> Your Prime Video
                                            </li>
                                            <Link to="/profile?tab=payments" className="hover:underline hover:text-[#e47911] cursor-pointer flex items-center gap-2">
                                                <CreditCard size={14} className="text-gray-400" /> Your Payments
                                            </Link>
                                            <Link to="/profile?tab=seller" className="hover:underline hover:text-[#e47911] cursor-pointer flex items-center gap-2 font-bold text-[#007185]">
                                                <Tag size={14} className="text-pink-600" /> Your Seller Account
                                            </Link>
                                            <Link to="/profile?tab=business" className="hover:underline hover:text-[#e47911] cursor-pointer flex items-center gap-2 font-bold text-[#007185]">
                                                <ShieldCheck size={14} className="text-blue-500" /> Your Business Account
                                            </Link>
                                            <Link to="/profile?tab=messages" className="hover:underline hover:text-[#e47911] cursor-pointer flex items-center gap-2 relative">
                                                <Bell size={14} className="text-gray-400" /> Message Centre
                                                <span className="absolute -top-1 -right-4 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-black">2</span>
                                            </Link>

                                            {user?.role === 'admin' && (
                                                <Link to="/admin" className="block font-bold text-blue-700 hover:underline pt-2 border-t border-blue-50 mt-2 flex items-center gap-2">
                                                    <ShieldCheck size={16} className="text-blue-600 animate-pulse" /> Admin Control Center
                                                </Link>
                                            )}

                                            <div className="h-[1px] bg-gray-100 my-4"></div>

                                            {isLoggedIn ? (
                                                <div className="space-y-3">
                                                    <li className="hover:underline hover:text-[#e47911] cursor-pointer flex items-center gap-2 text-[#007185] font-bold">
                                                        <UserPlus size={16} /> Switch Accounts
                                                    </li>
                                                    <li onClick={logout} className="hover:underline hover:text-[#e47911] cursor-pointer font-extrabold text-[#111] flex items-center gap-2 pt-1">
                                                        <LogOut size={16} className="text-red-500" /> Sign Out ({user.name?.split(' ')[0]})
                                                    </li>
                                                </div>
                                            ) : (
                                                <li className="text-[11px] text-gray-500 italic mt-2">Sign in to see more personalized accounts and lists features.</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* CART - DESKTOP ONLY */}
                <Link to="/cart" className="hidden lg:flex items-center p-2 border border-transparent hover:border-white rounded-sm relative group shrink-0">
                    <div className="relative">
                        <ShoppingCart size={32} className="text-white" />
                        <span className="absolute -top-1 left-[18px] text-[#e47911] text-[16px] font-black group-hover:scale-110 transition-transform">
                            {cartCount}
                        </span>
                    </div>
                    <span className="self-end font-extrabold text-[14px] ml-1 mb-1 text-white">Cart</span>
                </Link>
            </div>

            {/* SUB-HEADER */}
            <div className="bg-[#232f3e] h-[39px] flex items-center px-3 text-white text-[14px] gap-1 overflow-x-auto scrollbar-hide">
                <div
                    onClick={() => navigate('/products')}
                    className="flex items-center gap-1 font-extrabold p-2 border border-transparent hover:border-white rounded-sm cursor-pointer whitespace-nowrap"
                >
                    <Menu size={20} /> All
                </div>
                <Link to="/products?category=Mobiles" className="p-2 border border-transparent hover:border-white rounded-sm whitespace-nowrap">Mobiles</Link>
                <Link to="/products?category=Fashion" className="p-2 border border-transparent hover:border-white rounded-sm whitespace-nowrap">Fashion</Link>
                <Link to="/products?category=Electronics" className="p-2 border border-transparent hover:border-white rounded-sm whitespace-nowrap">Electronics</Link>
                <Link to="/products?category=Home & Kitchen" className="p-2 border border-transparent hover:border-white rounded-sm whitespace-nowrap">Home & Kitchen</Link>
                <Link to="/products?category=Beauty" className="p-2 border border-transparent hover:border-white rounded-sm whitespace-nowrap">Beauty</Link>
                <Link to="/products?category=Audio" className="p-2 border border-transparent hover:border-white rounded-sm whitespace-nowrap">Audio</Link>
                <Link to="/products?category=Gaming" className="p-2 border border-transparent hover:border-white rounded-sm whitespace-nowrap">Gaming</Link>

                <div className="ml-auto flex items-center gap-2 font-extrabold text-[#FF9900] whitespace-nowrap border-l border-gray-600 pl-4 py-1">
                    <Zap size={18} fill="currentColor" /> Premium Hub
                </div>
            </div>

            {/* LOCATION SELECTION MODAL */}
            <AnimatePresence>
                {showLocationModal && (
                    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLocationModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-[400px] bg-white rounded-lg shadow-2xl overflow-hidden"
                        >
                            <div className="bg-[#f0f2f2] px-6 py-4 flex items-center justify-between border-b border-gray-200">
                                <h3 className="font-extrabold text-[#111] text-[16px]">Choose your location</h3>
                                <button onClick={() => setShowLocationModal(false)} className="text-gray-500 hover:text-black"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-5">
                                <p className="text-[13px] text-[#565959] leading-tight">Delivery options and delivery speeds may vary for different locations</p>

                                {isLoggedIn && defaultAddress ? (
                                    <div className="p-3 bg-[#fdfaf3] border border-[#e47911] rounded-lg cursor-pointer">
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 rounded-full border-2 border-[#e47911] flex items-center justify-center mt-0.5">
                                                <div className="w-2.5 h-2.5 bg-[#e47911] rounded-full"></div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[13px] font-bold text-[#111]">{user?.name} - {defaultAddress.city} {defaultAddress.pincode}</p>
                                                <p className="text-[12px] text-[#565959] truncate">{defaultAddress.address_line}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : isLoggedIn ? (
                                    <button onClick={() => navigate('/profile')} className="w-full justify-center h-11 border border-[#D5D9D9] rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center">Add an address</button>
                                ) : null}

                                <div className="flex items-center gap-2">
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                    <span className="text-[11px] text-gray-400 font-bold uppercase">or enter a pincode</span>
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="Enter pincode"
                                        value={tempPincode}
                                        onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
                                        className="flex-1 h-11 border border-[#D5D9D9] rounded-lg px-4 text-sm font-bold focus:ring-2 focus:ring-[#e47911] outline-none shadow-inner"
                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPincode()}
                                    />
                                    <button
                                        onClick={handleApplyPincode}
                                        className="h-11 px-6 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#a88734] rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-all"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* PROFESSIONAL VOICE SEARCH OVERLAY */}
            <AnimatePresence>
                {showVoiceOverlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/85 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-gradient-to-b from-[#1a232e] to-[#131921] text-white p-12 rounded-[2rem] border border-gray-700/50 w-full max-w-2xl text-center shadow-[0_0_100px_rgba(37,99,235,0.2)] relative overflow-hidden"
                        >
                            {/* AI Glow Effect */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                            <div className="absolute top-6 left-6 text-[#FF9900] animate-pulse"><Sparkles size={28} /></div>
                            <div className="absolute top-6 right-6 text-blue-400 animate-pulse"><AudioLines size={28} /></div>

                            <h2 className="text-3xl font-black italic tracking-tighter mb-10 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 uppercase">Personal Voice Assistant</h2>

                            <div className="flex flex-col items-center gap-10">
                                {/* Large Animated Mic Node */}
                                <div className="relative">
                                    <motion.div
                                        animate={{ scale: [1, 1.15, 1], boxShadow: ["0 0 20px rgba(37,99,235,0.4)", "0 0 60px rgba(37,99,235,0.8)", "0 0 20px rgba(37,99,235,0.4)"] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="w-40 h-40 bg-blue-600 rounded-full flex items-center justify-center border-8 border-[#131921] z-10 relative shadow-2xl"
                                    >
                                        <Mic size={64} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                    </motion.div>
                                    {/* Sonic Waves */}
                                    {[1, 2, 3].map(i => (
                                        <motion.div
                                            key={i}
                                            initial={{ scale: 1, opacity: 0.3 }}
                                            animate={{ scale: 2.5, opacity: 0 }}
                                            transition={{ repeat: Infinity, duration: 2, delay: i * 0.6 }}
                                            className="absolute inset-0 w-40 h-40 border-4 border-blue-500 rounded-full pointer-events-none"
                                        />
                                    ))}
                                </div>

                                <div className="min-h-[100px] flex flex-col items-center justify-center space-y-4">
                                    <p className="text-3xl font-black tracking-tight text-[#FF9900] italic leading-tight max-w-lg">
                                        "{interimTranscript || "I'm listening..."}"
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase text-gray-400 tracking-widest border border-white/5">Voice Engine 4.0</span>
                                        <span className="px-3 py-1 bg-blue-600/20 rounded-full text-[10px] font-black uppercase text-blue-400 tracking-widest border border-blue-500/20 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div> Active
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={stopVoiceSearch}
                                    className="h-14 px-12 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full font-black text-sm uppercase tracking-[4px] transition-all border border-white/10 active:scale-95 group"
                                >
                                    <span className="group-hover:text-red-500 transition-colors">Stop Session</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </header>
    );
};

export default Navbar;
