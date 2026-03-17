import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Zap, ArrowRight, ShieldCheck, ShoppingBag, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, addToCart, onWishlist, ribbon = null, compact = false }) => {
    const formatINR = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

    if (!product) return (
        <div className={`bg-white rounded-xl p-4 ${compact ? 'h-64' : 'h-72'} shadow-sm border border-gray-100 flex flex-col gap-4`}>
            <div className="flex-1 bg-gray-50 rounded animate-pulse"></div>
            <div className="h-3 w-3/4 bg-gray-50 rounded animate-pulse"></div>
            <div className="h-5 w-1/2 bg-gray-50 rounded animate-pulse"></div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={`group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer relative border border-gray-200 flex flex-col h-full overflow-hidden`}
        >
            {/* BADGES */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 pointer-events-none">
                {product.discount && (
                    <div className="bg-[#CC0C39] text-white px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-tighter shadow-lg">
                        {product.discount}% OFF
                    </div>
                )}
                {ribbon && (
                    <div className="bg-[#FF9900] text-black px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest shadow-md">
                        {ribbon}
                    </div>
                )}
                <div className="bg-blue-600/5 text-blue-600 px-2 py-0.5 rounded-sm text-[9px] font-bold tracking-tight flex items-center gap-1 border border-blue-100 backdrop-blur-sm">
                    <Zap size={10} fill="currentColor" /> PRIME
                </div>
            </div>

            {/* WISHLIST BTN */}
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlist && onWishlist(product); }}
                className="absolute top-3 right-3 w-9 h-9 bg-white shadow-md border border-gray-100 rounded-full text-gray-300 hover:text-red-500 z-20 transition-all hover:scale-110 active:scale-95 flex items-center justify-center group/heart"
            >
                <Heart size={16} className="group-hover/heart:fill-red-500 transition-all" />
            </button>

            {/* PRODUCT IMAGE */}
            <Link to={`/products/${product.id}`} className={`relative ${compact ? 'h-40' : 'h-60'} w-full flex items-center justify-center p-6 bg-gray-50 overflow-hidden shrink-0 group-hover:bg-white transition-colors duration-500`}>
                <motion.img
                    src={product.image}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'; }}
                    className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                    alt={product.title}
                />
            </Link>

            {/* INFO & PRICE */}
            <div className="p-4 flex flex-col flex-1 justify-between gap-2 overflow-hidden">
                <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none truncate">{product.brand || 'Official Store'}</p>
                    <Link to={`/products/${product.id}`} className="block text-[15px] font-bold text-[#111] leading-tight line-clamp-2 hover:text-[#C7511F] min-h-[40px]">
                        {product.title}
                    </Link>

                    <div className="flex items-center gap-2 pt-1">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill={i < Math.floor(product.rating || 4) ? "#FF9900" : "none"} className={i < Math.floor(product.rating || 4) ? "text-[#FF9900]" : "text-gray-200"} />
                            ))}
                        </div>
                        <span className="text-xs text-[#007185] font-medium hover:underline">{(product.reviews || Math.floor(product.id * 13) % 1000 + 42).toLocaleString()}</span>
                    </div>
                </div>

                <div className="space-y-3 mt-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#111] tracking-tighter">
                            {formatINR(product.price)}
                        </span>
                        {product.originalPrice && (
                            <span className="text-xs text-gray-500 line-through">
                                {formatINR(product.originalPrice)}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart && addToCart(product); }}
                            className="w-full h-11 bg-[#FFD814] hover:bg-[#F7CA00] text-black rounded-md font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={16} /> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
