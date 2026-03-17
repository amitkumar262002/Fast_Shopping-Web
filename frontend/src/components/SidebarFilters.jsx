import React from 'react';
import {
    Check, Star, ChevronDown, SlidersHorizontal, ArrowUpRight,
    X, RotateCcw, Tag, Smartphone, Zap, Truck, Sparkles, Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

const SidebarFilters = ({
    categories, selectedCategory, setSelectedCategory,
    priceRange, setPriceRange,
    minRating, setMinRating,
    selectedBrands, toggleBrand, brands,
    discount, setDiscount,
    onReset
}) => {

    const RATINGS = [4, 3, 2, 1];
    const DISCOUNTS = [10, 25, 40, 50];

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* ── FILTER HEADER ── */}
            <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-bold text-[16px] text-[#111]">Filters</h3>
                {(selectedCategory !== "All" || selectedBrands.length > 0 || minRating > 0 || discount > 0) && (
                    <button onClick={onReset} className="text-[12px] text-[#007185] hover:text-[#C7511F] font-bold hover:underline">Clear All</button>
                )}
            </div>

            {/* ── CATEGORY ── */}
            <div className="space-y-4">
                <p className="text-[14px] font-bold text-[#111]">Category</p>
                <div className="flex flex-col gap-2.5">
                    {categories.map(c => (
                        <div
                            key={c}
                            onClick={() => setSelectedCategory(c)}
                            className={`text-[13px] cursor-pointer hover:text-[#C7511F] transition-colors ${selectedCategory === c ? 'font-bold text-[#C7511F]' : 'text-[#444] font-medium'}`}
                        >
                            {c === "All" ? 'Any Category' : c}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── CUSTOMER REVIEWS ── */}
            <div className="space-y-3">
                <p className="text-[14px] font-bold text-[#111]">Customer Reviews</p>
                <div className="flex flex-col gap-2">
                    {RATINGS.map(rate => (
                        <div
                            key={rate}
                            onClick={() => setMinRating(rate)}
                            className={`flex items-center gap-1 cursor-pointer group ${minRating === rate ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
                        >
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={18}
                                        className={`${i < rate ? 'text-[#FF9900] fill-[#FF9900]' : 'text-gray-200'}`}
                                    />
                                ))}
                            </div>
                            <span className={`text-[13px] ml-1 font-medium ${minRating === rate ? 'text-[#C7511F] font-bold' : 'text-[#444] group-hover:text-[#C7511F]'}`}>
                                & Up
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── PRICE ── */}
            <div className="space-y-4">
                <p className="text-[14px] font-bold text-[#111]">Price Range</p>
                <div className="space-y-3">
                    <div className="flex justify-between text-[13px] text-gray-500 font-bold italic">
                        <span>Min</span>
                        <span className="text-[#C7511F]">Up to ₹{priceRange.toLocaleString()}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="200000"
                        step="1000"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#e77600]"
                    />
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        {[
                            { label: 'Under ₹10,000', val: 10000 },
                            { label: 'Under ₹50,000', val: 50000 },
                        ].map(p => (
                            <button
                                key={p.val}
                                onClick={() => setPriceRange(p.val)}
                                className={`text-[11px] py-1.5 px-2 rounded border transition-all font-bold ${priceRange === p.val ? 'bg-[#f7fafa] border-[#e77600] text-[#e77600]' : 'bg-white border-gray-300 hover:bg-gray-50 text-[#111]'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── BRANDS ── */}
            {brands.length > 0 && (
                <div className="space-y-4">
                    <p className="text-[14px] font-bold text-[#111]">Brand</p>
                    <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {brands.map(brand => (
                            <div
                                key={brand}
                                onClick={() => toggleBrand(brand)}
                                className="flex items-center gap-2.5 group cursor-pointer"
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedBrands.includes(brand) ? 'bg-[#e77600] border-[#e77600]' : 'border-gray-300 bg-white group-hover:border-[#e77600]'}`}>
                                    {selectedBrands.includes(brand) && <Check size={12} className="text-white" strokeWidth={4} />}
                                </div>
                                <span className={`text-[13px] font-medium transition-colors ${selectedBrands.includes(brand) ? 'text-[#111] font-bold' : 'text-[#444] group-hover:text-[#111]'}`}>
                                    {brand}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── DISCOUNT ── */}
            <div className="space-y-4">
                <p className="text-[14px] font-bold text-[#111]">Discount</p>
                <div className="flex flex-col gap-3">
                    {DISCOUNTS.map(d => (
                        <div
                            key={d}
                            onClick={() => setDiscount(d)}
                            className={`text-[13px] font-medium cursor-pointer transition-colors ${discount === d ? 'text-[#C7511F] font-bold underline decoration-2 underline-offset-4' : 'text-[#444] hover:text-[#C7511F]'}`}
                        >
                            {d}% Off or more
                        </div>
                    ))}
                </div>
            </div>

            {/* ── PRIME DELIVERY ── */}
            <div className="bg-[#f7fafa] p-5 border border-[#e7e7e7] rounded-sm">
                <div className="flex items-center gap-2 text-[#007185] font-black text-sm uppercase italic tracking-tighter">
                    <Zap size={16} fill="currentColor" /> Prime
                </div>
                <p className="text-[11px] text-[#565959] mt-2 font-medium">Enjoy FREE fast delivery on millions of items as a member.</p>
                <button className="text-[11px] text-[#007185] font-bold mt-2 hover:underline hover:text-[#C7511F]">Join Fast Prime</button>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #bbb; }
            `}</style>
        </div>
    );
};

export default SidebarFilters;
