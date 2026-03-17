import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Star, Heart, ShoppingCart, Zap, Package, Truck, RotateCcw,
    Shield, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2,
    Share2, MapPin, Plus, Minus, Tag, Award, Clock, Users, X, Info
} from 'lucide-react';
import { productsAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';

const ProductDetails = ({ addToCart, toggleWishlist, wishlist = [], products = [] }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [pincode, setPincode] = useState('');
    const [deliveryCheck, setDeliveryCheck] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [myReview, setMyReview] = useState({ rating: 5, comment: '' });
    const [tab, setTab] = useState('desc');
    const [timeLeft, setTimeLeft] = useState({ hours: 10, minutes: 52, seconds: 14 });
    const [showBankOffers, setShowBankOffers] = useState(false);
    const [showPolicy, setShowPolicy] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev;
                if (seconds > 0) seconds--;
                else if (minutes > 0) { minutes--; seconds = 59; }
                else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
                return { hours, minutes, seconds };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

    useEffect(() => {
        setLoading(true);
        productsAPI.getOne(id)
            .then(res => {
                setProduct(res.data);
                setLoading(false);
            })
            .catch(() => { setLoading(false); });
    }, [id]);

    useEffect(() => {
        if (id) {
            reviewsAPI.getProductReviews(id)
                .then(res => setReviews(res.data || []))
                .catch(() => { });
        }
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart({ ...product, quantity, size: selectedSize, color: selectedColor });
    };

    const handleBuyNow = () => {
        if (!product) return;
        addToCart({ ...product, quantity, size: selectedSize, color: selectedColor });
        navigate('/checkout');
    };

    const handleDeliveryCheck = () => {
        if (pincode.length !== 6) { toast.warning('Enter a valid 6-digit pincode'); return; }
        const days = Math.floor(Math.random() * 4) + 2;
        setDeliveryCheck({ available: true, days, date: new Date(Date.now() + days * 86400000).toDateString() });
    };

    const handleSubmitReview = async () => {
        if (!user) { toast.info('Please login to add a review'); navigate('/login'); return; }
        if (!myReview.comment.trim()) { toast.warning('Please write a comment'); return; }
        try {
            await reviewsAPI.addReview(id, myReview);
            toast.success('Review submitted successfully!');
            setShowReviewForm(false);
            setMyReview({ rating: 5, comment: '' });
            const res = await reviewsAPI.getProductReviews(id);
            setReviews(res.data || []);
        } catch (err) {
            toast.error('Failed to submit review');
        }
    };

    const discount = product ? Math.round(((product.originalPrice || product.price * 1.2) - product.price) / (product.originalPrice || product.price * 1.2) * 100) : 0;
    const finalPrice = product?.price;
    const images = product ? [product.image, ...(product.images?.map(i => i.image_url) || [])].filter(Boolean) : [];
    const similarProducts = products.filter(p => p.category === product?.category && p.id !== product?.id).slice(0, 6);

    const getGeneratedSpecs = () => {
        if (product?.specs && Object.keys(product.specs).length > 0) return product.specs;
        const base = { "Brand": product?.brand || "FastShopping Premium", "Model": product?.title?.split(" ")[0], "Item Weight": "450g", "Warranty": "1 Year Manufacturer" };
        if (product?.category?.toLowerCase().includes("electronic")) return { ...base, "Operating System": "Android/iOS Compatible", "Connectivity": "Bluetooth, Wi-Fi", "Battery Life": "Up to 24 hours" };
        if (product?.category?.toLowerCase().includes("fashion")) return { ...base, "Material": "Premium Cotton/Polyester", "Fit": "Standard Fit", "Care": "Machine Wash" };
        if (product?.category?.toLowerCase().includes("home")) return { ...base, "Material": "Durable Plastic/Steel", "Safe": "BPA Free", "Included": "User Manual, Warranty Card" };
        return base;
    };
    const specs = getGeneratedSpecs();

    if (loading) return (
        <div className="min-h-screen bg-white pt-[150px] lg:pt-[120px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
                <p className="font-bold text-gray-500">Loading details...</p>
            </div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen bg-white pt-[150px] lg:pt-[120px] flex flex-col items-center justify-center gap-6">
            <Package size={64} className="text-gray-100" />
            <h2 className="text-3xl font-bold text-gray-900 text-center">Sorry, we couldn't find that product</h2>
            <button onClick={() => navigate('/products')} className="bg-[#FFD814] hover:bg-[#F7CA00] px-10 py-3 rounded-md font-bold text-sm shadow-sm transition-all text-black">
                Back to Shopping
            </button>
        </div>
    );

    return (
        <div className="bg-white min-h-screen pt-[140px] lg:pt-[100px] pb-20 font-sans">

            {/* BREADCRUMB */}
            <div className="bg-[#f0f2f2] border-b border-gray-200">
                <div className="container mx-auto px-4 lg:px-12 py-3">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide text-[12px] font-medium text-[#565959]">
                        <Link to="/" className="hover:underline hover:text-[#C7511F] whitespace-nowrap">Home</Link>
                        <ChevronRight size={14} className="shrink-0" />
                        <Link to="/products" className="hover:underline hover:text-[#C7511F] whitespace-nowrap">All Products</Link>
                        <ChevronRight size={14} className="shrink-0" />
                        <Link to={`/products?category=${product.category}`} className="hover:underline hover:text-[#C7511F] whitespace-nowrap">{product.category}</Link>
                        <ChevronRight size={14} className="shrink-0" />
                        <span className="text-[#111] font-bold truncate">{product.title}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-12 pt-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* LEFT: IMAGES (Lg-4) */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-[120px] flex gap-4">
                            {/* thumbnail strip */}
                            <div className="hidden md:flex flex-col gap-2 w-20">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onMouseEnter={() => setActiveImage(i)}
                                        className={`w-16 h-16 border-2 rounded-md overflow-hidden p-1 transition-all ${activeImage === i ? 'border-[#e47911] shadow-md shadow-[#e47911]/10' : 'border-gray-200 hover:border-[#e47911]'}`}
                                    >
                                        <img src={img} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                                    </button>
                                ))}
                            </div>
                            {/* main image */}
                            <div className="flex-1 bg-white border border-gray-100 rounded-sm overflow-hidden flex items-center justify-center relative aspect-square p-10 cursor-zoom-in group">
                                <motion.img
                                    key={activeImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    src={images[activeImage]}
                                    className="max-w-full max-h-full object-contain mix-blend-multiply transform transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4">
                                    <button onClick={() => toggleWishlist(product)} className="w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors border border-gray-100">
                                        <Heart size={20} className={wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CENTER: DETAILS (Lg-5) */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <Link to={`/products?brand=${product.brand}`} className="text-[#007185] hover:underline hover:text-[#C7511F] text-[13px] font-bold uppercase tracking-widest">{product.brand || 'Premium Brand'}</Link>
                        <h1 className="text-2xl font-bold text-[#111] leading-tight">{product.title}</h1>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < Math.floor(product.rating || 4) ? "#FF9900" : "none"} className={i < Math.floor(product.rating || 4) ? "text-[#FF9900]" : "text-gray-200"} />
                                ))}
                            </div>
                            <span className="text-sm font-bold text-[#007185] hover:underline cursor-pointer">{reviews.length} ratings</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-sm font-bold text-[#007185] hover:underline cursor-pointer">100+ Answered Questions</span>
                        </div>

                        <div className="h-px bg-gray-200 my-2" />

                        <div className="flex flex-col gap-1">
                            {discount > 0 && <span className="text-[#CC0C39] text-3xl font-light">-{discount}% <span className="text-black font-medium">{formatINR(finalPrice)}</span></span>}
                            {!discount && <span className="text-4xl font-bold text-black">{formatINR(finalPrice)}</span>}
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-500">M.R.P.: <span className="line-through">{formatINR(product.originalPrice || product.price * 1.2)}</span></p>
                                <Info size={14} className="text-gray-400 cursor-help" title="Inclusive of all taxes" />
                            </div>
                        </div>

                        {/* Offers Box */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-4">
                            <div onClick={() => setShowBankOffers(true)} className="p-3 border border-gray-200 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all bg-[#F7F7F7]">
                                <p className="text-xs font-bold text-black mb-1">Bank Offer</p>
                                <p className="text-[11px] text-gray-700 line-clamp-2">Up to ₹1,500.00 discount on select Credit Cards</p>
                                <span className="text-[11px] text-[#007185] font-bold mt-2 block">12 offers ›</span>
                            </div>
                            <div className="p-3 border border-gray-200 rounded-lg shadow-sm bg-[#F7F7F7]">
                                <p className="text-xs font-bold text-black mb-1">No Cost EMI</p>
                                <p className="text-[11px] text-gray-700">Avail No Cost EMI on select cards for orders above ₹3,000</p>
                            </div>
                            <div className="p-3 border border-gray-200 rounded-lg shadow-sm bg-[#F7F7F7]">
                                <p className="text-xs font-bold text-black mb-1">Partner Offers</p>
                                <p className="text-[11px] text-gray-700">Get GST invoice and save up to 28% on business purchases</p>
                            </div>
                        </div>

                        <div className="h-px bg-gray-200 my-2" />

                        {/* Specifications brief */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold">About this item</h3>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-[#111] leading-relaxed">
                                {product.description?.split('.').filter(Boolean).slice(0, 5).map((desc, i) => (
                                    <li key={i}>{desc.trim()}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* RIGHT: BUY BOX (Lg-3) */}
                    <div className="lg:col-span-3">
                        <div className="border border-gray-300 rounded-lg p-5 sticky top-[120px] flex flex-col gap-4 shadow-sm">
                            <span className="text-3xl font-medium text-black">{formatINR(finalPrice)}</span>
                            <div className="text-sm font-bold text-gray-900">
                                FREE delivery <span className="text-black font-black italic">Friday, 12 June</span>. Order within <span className="text-green-700">{timeLeft.hours} hrs {timeLeft.minutes} mins</span>.
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-[#007185] text-xs font-bold">
                                    <MapPin size={14} />
                                    <span>Deliver to {user?.name?.split(' ')[0] || 'Select Location'}</span>
                                </div>
                                {product.stock > 0 ? (
                                    <div className="flex flex-col gap-1 mt-2">
                                        <p className="text-lg font-bold text-green-700">In Stock</p>
                                        <div className="flex items-center gap-1.5 p-1.5 bg-blue-50 border border-blue-100 rounded text-[10px] font-black text-blue-700 uppercase tracking-tighter">
                                            <ShieldCheck size={12} className="fill-blue-700 text-white" /> Fast Shopping A-to-Z Protected
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-lg font-bold text-red-700 mt-2">Currently Unavailable</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 mt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-bold">Quantity:</span>
                                    <select
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="bg-[#f0f2f2] border border-gray-300 rounded-md px-2 py-1 text-xs outline-none focus:border-[#e77600] shadow-sm"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={!product.stock}
                                    className="w-full bg-[#FFD814] hover:bg-[#F7CA00] py-3 rounded-full font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={!product.stock}
                                    className="w-full bg-[#FFA41C] hover:bg-[#FA8900] py-3 rounded-full font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50"
                                >
                                    Buy Now
                                </button>
                            </div>

                            <div className="flex flex-col gap-2 mt-4 text-[12px] text-gray-500">
                                <div className="flex justify-between">
                                    <span>Ships from</span>
                                    <span className="text-black font-medium">Fast Shopping</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sold by</span>
                                    <span className="text-[#007185] font-medium hover:underline cursor-pointer">Prime Retailers</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
                                <div className="flex items-center gap-3 text-xs text-[#007185] font-bold hover:underline cursor-pointer" onClick={() => setShowPolicy(true)}>
                                    <RotateCcw size={14} className="text-gray-600" /> 7-Day Replacement
                                </div>
                                <div className="flex items-center gap-3 text-xs text-[#007185] font-bold">
                                    <Shield size={14} className="text-gray-600" /> Secure Transaction
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABS SECTION */}
                <div className="mt-20">
                    <div className="flex gap-10 border-b border-gray-200 mb-8">
                        {['Description', 'Specifications', `Customer Reviews (${reviews.length})`].map((t, i) => (
                            <button
                                key={i}
                                onClick={() => setTab(i === 0 ? 'desc' : (i === 1 ? 'specs' : 'reviews'))}
                                className={`pb-3 text-sm font-bold transition-all border-b-2 ${tab === (i === 0 ? 'desc' : (i === 1 ? 'specs' : 'reviews')) ? 'border-[#e47911] text-[#e47911]' : 'border-transparent text-gray-500 hover:text-black'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {tab === 'desc' && (
                        <div className="text-sm text-[#111] leading-relaxed max-w-4xl space-y-4">
                            <h3 className="text-lg font-bold">From the Manufacturer</h3>
                            <p className="whitespace-pre-line">{product.description || 'No detailed description available.'}</p>
                        </div>
                    )}

                    {tab === 'specs' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 border border-gray-200 rounded-sm overflow-hidden max-w-4xl shadow-inner bg-white">
                            {Object.entries(specs).map(([k, v], i) => (
                                <div key={k} className={`flex p-4 text-[13px] border-b border-gray-50 ${i % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'}`}>
                                    <span className="w-1/3 font-black text-[#565959] uppercase tracking-tighter">{k}</span>
                                    <span className="w-2/3 text-[#111] font-bold">{v}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'reviews' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Summary */}
                            <div className="lg:col-span-4">
                                <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={18} fill={s <= product.rating ? '#FF9900' : 'none'} className={s <= product.rating ? 'text-[#FF9900]' : 'text-gray-200'} />)}
                                    </div>
                                    <span className="text-lg font-bold">{product.rating.toFixed(1)} out of 5</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-6">{reviews.length} total ratings</p>

                                <div className="space-y-3 mb-10">
                                    {[5, 4, 3, 2, 1].map(r => (
                                        <div key={r} className="flex items-center gap-4 text-sm">
                                            <span className="text-[#007185] whitespace-nowrap">{r} star</span>
                                            <div className="flex-1 h-5 bg-gray-100 rounded-sm overflow-hidden border border-gray-200">
                                                <div className="h-full bg-[#FF9900]" style={{ width: `${reviews.length ? (reviews.filter(rev => rev.rating === r).length / reviews.length) * 100 : (r === 5 ? 75 : (r === 4 ? 15 : 5))}%` }} />
                                            </div>
                                            <span className="text-[#007185]">{reviews.length ? Math.round((reviews.filter(rev => rev.rating === r).length / reviews.length) * 100) : (r === 5 ? 75 : (r === 4 ? 15 : 5))}%</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-10">
                                    <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-gray-500">Customer Images</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group">
                                                <img src={`https://picsum.photos/seed/${product?.id + i}/200`} className="w-full h-full object-cover group-hover:scale-110 transition-all opacity-80 group-hover:opacity-100" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t pt-8">
                                    <h4 className="text-lg font-bold mb-2">Review this product</h4>
                                    <p className="text-sm text-gray-700 mb-6">Share your thoughts with other customers</p>
                                    <button
                                        onClick={() => setShowReviewForm(true)}
                                        className="w-full py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 shadow-sm transition-all"
                                    >
                                        Write a product review
                                    </button>
                                </div>
                            </div>

                            {/* Review List */}
                            <div className="lg:col-span-8 space-y-8">
                                <AnimatePresence>
                                    {showReviewForm && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#F8F9FA] p-8 rounded-lg border border-gray-200 border-l-4 border-l-[#e47911] shadow-xl">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-xl font-bold">Write a Review</h4>
                                                <button onClick={() => setShowReviewForm(false)} className="text-gray-400 hover:text-black"><X size={24} /></button>
                                            </div>
                                            <div className="space-y-6">
                                                <div>
                                                    <p className="text-sm font-bold mb-2 uppercase tracking-wide">Overall rating</p>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <button key={s} onClick={() => setMyReview({ ...myReview, rating: s })}>
                                                                <Star size={32} fill={s <= myReview.rating ? '#FF9900' : 'none'} className={s <= myReview.rating ? 'text-[#FF9900]' : 'text-gray-300'} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold mb-2 uppercase tracking-wide">Tell us more</p>
                                                    <textarea
                                                        value={myReview.comment}
                                                        onChange={(e) => setMyReview({ ...myReview, comment: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-md p-4 text-sm outline-none focus:border-[#e47911] focus:ring-1 focus:ring-[#e47911] min-h-[150px]"
                                                        placeholder="What did you like or dislike? How was the delivery?"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleSubmitReview}
                                                    className="bg-[#FFD814] hover:bg-[#F7CA00] px-10 py-3 rounded-md font-bold text-sm shadow-sm"
                                                >
                                                    Submit Review
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {reviews.length > 0 ? (
                                    <div className="space-y-10">
                                        {reviews.map(r => (
                                            <div key={r.id} className="border-b pb-8">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <Users size={16} className="text-gray-600" />
                                                    </div>
                                                    <span className="text-[13px] font-bold">{r.user_name || 'Verified Customer'}</span>
                                                </div>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="flex">
                                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={s <= r.rating ? '#FF9900' : 'none'} className={s <= r.rating ? 'text-[#FF9900]' : 'text-gray-200'} />)}
                                                    </div>
                                                    <span className="text-[13px] font-bold text-[#111]">Review verified on {new Date(r.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-[#111] leading-relaxed italic border-l-4 border-gray-100 pl-4">"{r.comment}"</p>
                                                <div className="flex items-center gap-6 mt-4">
                                                    <button className="text-xs px-6 py-1 border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm font-medium">Helpful</button>
                                                    <span className="text-xs text-gray-500 hover:underline cursor-pointer">Report abuse</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-10 rounded-lg text-center border-2 border-dashed border-gray-200">
                                        <p className="text-gray-500 font-medium">No reviews yet for this product. Be the first to share your experience!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* SIMILAR PRODUCTS */}
                {similarProducts.length > 0 && (
                    <div className="mt-20 pt-10 border-t border-gray-200">
                        <h3 className="text-xl font-bold mb-8">Related Products</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {similarProducts.map(p => (
                                <ProductCard key={p.id} product={p} addToCart={addToCart} onWishlist={toggleWishlist} compact />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* BANK OFFERS MODAL */}
            <AnimatePresence>
                {showBankOffers && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBankOffers(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-[#f0f2f2]">
                                <h3 className="text-xl font-bold">Bank Offers</h3>
                                <button onClick={() => setShowBankOffers(false)} className="text-gray-500 hover:text-black transition-colors"><X size={24} /></button>
                            </div>
                            <div className="p-8 overflow-y-auto max-h-[60vh] space-y-6">
                                {[
                                    { bank: "HDFC Bank", offer: "Flat ₹2,500 Instant Discount on Credit/Debit Card", detail: "Min purchase ₹30,000. Valid on EMI & Non-EMI transactions." },
                                    { bank: "SBI Card", offer: "10% Instant Discount up to ₹1,500", detail: "Min purchase ₹5,000. Valid on SBI Credit Card only." },
                                    { bank: "ICICI Bank", offer: "Additional ₹500 off on Amazon Pay ICICI Credit Card", detail: "No minimum purchase. Plus 5% unlimited cashback for Prime members." },
                                    { bank: "Axis Bank", offer: "Flat ₹1,000 Savings on Axis Credit Card", detail: "Min purchase ₹15,000. Valid on selected categories." }
                                ].map((b, i) => (
                                    <div key={i} className="flex gap-4 p-5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold shrink-0">{b.bank.charAt(0)}</div>
                                        <div>
                                            <p className="text-sm font-bold text-black uppercase tracking-wide mb-1">{b.bank}</p>
                                            <p className="text-base font-bold text-[#C45500]">{b.offer}</p>
                                            <p className="text-xs text-gray-600 mt-1">{b.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 bg-gray-50 border-t flex justify-end">
                                <button onClick={() => setShowBankOffers(false)} className="bg-[#FFD814] hover:bg-[#F7CA00] px-10 py-2 rounded-md font-bold text-sm shadow-sm">Done</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* REPLACEMENT MODAL */}
            <AnimatePresence>
                {showPolicy && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPolicy(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-white rounded-lg shadow-2xl overflow-hidden p-10">
                            <div className="flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><RotateCcw size={40} /></div>
                                <h3 className="text-2xl font-bold">7-Day Replacement Policy</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    This item is eligible for free replacement, within 7 days of delivery, in an unlikely event of damaged, defective or different item delivered to you.
                                    <br /><br />
                                    Please keep the item in its original condition, with brand outer box, MRP tags attached, user manual, warranty cards, and original accessories in manufacturer packaging for a successful return pick-up.
                                </p>
                                <button onClick={() => setShowPolicy(false)} className="w-full bg-[#FFD814] hover:bg-[#F7CA00] py-3 rounded-md font-bold shadow-sm mt-4">Close Info</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ShieldCheck = ({ size, className, fill }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>;
const Sparkles = ({ size, className }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3 1.912 5.886L20 10.8l-5.886 1.912L12 18.6l-1.912-5.886L4 10.8l5.886-1.912L12 3Z" /><path d="M5 3v4" /><path d="M3 5h4" /><path d="M21 17v4" /><path d="M19 19h4" /></svg>;

export default ProductDetails;
