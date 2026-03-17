import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, Package, Truck, ShieldCheck, Heart, Bookmark, ArrowRight } from 'lucide-react';

const CartItem = ({ item, updateQuantity, removeItem, onWishlist }) => {
    const formatINR = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

    if (!item) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="group bg-white p-6 sm:p-10 border-x border-b border-gray-100/50 flex flex-col md:flex-row items-center gap-8 sm:gap-12 transition-all duration-300 relative overflow-hidden h-auto md:h-64"
        >
            {/* PRODUCT ASSET - Fixed Module */}
            <div className="relative w-full md:w-48 h-48 md:h-full bg-gray-50/50 rounded-[32px] overflow-hidden flex items-center justify-center p-6 group-hover:bg-blue-50/30 transition-all duration-500 shrink-0 border border-gray-50">
                <img src={item.image} className="max-w-[90%] max-h-full object-contain filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest text-blue-600 shadow-sm border border-blue-50">
                    <ShieldCheck size={10} /> Authenticated
                </div>
            </div>

            {/* PRODUCT PROTOCOLS */}
            <div className="flex-1 flex flex-col justify-between h-full w-full py-1">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[3px] text-blue-600 opacity-60 italic">{item.brand || 'Enterprise'}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-black italic text-gray-950 tracking-tighter uppercase leading-[1.1] line-clamp-2 max-w-xl">
                            {item.title}
                        </h4>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <span className="flex items-center gap-1.5"><Package size={14} className="text-blue-500" /> Stock Protocol Active</span>
                            <span className="text-gray-200">|</span>
                            <span className="flex items-center gap-1.5"><Truck size={14} className="text-orange-500" /> Express Fulfill</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-16 shrink-0 w-full md:w-auto justify-between md:justify-end">
                        {/* QUANTITY CONTROLLER */}
                        <div className="flex items-center gap-2 bg-slate-50 border border-gray-100 rounded-[20px] p-1.5 shrink-0 shadow-inner">
                            <button
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm active:scale-90"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="w-8 flex items-center justify-center text-sm font-black italic tabular-nums text-gray-900 border-x border-gray-200/50">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm active:scale-90"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* VALUATION MODULE */}
                        <div className="text-right flex flex-col items-end">
                            <p className="text-2xl sm:text-3xl font-black italic text-gray-950 tracking-tighter leading-none">
                                {formatINR(item.price * item.quantity)}
                            </p>
                            <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mt-2 border-b border-gray-100">{formatINR(item.price)} per unit</p>
                        </div>
                    </div>
                </div>

                {/* ACTION LAYER */}
                <div className="flex flex-wrap items-center gap-6 mt-8 md:mt-0 pt-4 border-t border-gray-50 border-dashed">
                    <button onClick={() => removeItem(item.id)} className="text-[11px] font-black uppercase tracking-[2px] text-gray-400 hover:text-red-500 flex items-center gap-2 transition-all hover:translate-x-1"><Trash2 size={14} /> Remove Node</button>
                    <button onClick={() => onWishlist && onWishlist(item)} className="text-[11px] font-black uppercase tracking-[2px] text-gray-400 hover:text-blue-600 flex items-center gap-2 transition-all hover:translate-x-1"><Bookmark size={14} /> Save Protocol</button>
                    <button className="text-[11px] font-black uppercase tracking-[2px] text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-all ml-auto">Identify Specs <ArrowRight size={14} /></button>
                </div>
            </div>
        </motion.div>
    );
};

export default CartItem;
