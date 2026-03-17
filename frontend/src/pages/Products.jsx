import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Filter, Search, Grid, List, ChevronDown, ChevronRight, Check, X, SlidersHorizontal,
    ArrowUpRight, Zap, Mic, Headphones, Volume2, ShieldCheck, Cpu, Database, Home, Box, Star, Tag, Truck, Smartphone, ShoppingBag, Monitor, Gamepad2, Book, Sparkles
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SidebarFilters from '../components/SidebarFilters';

const Products = ({ products = [], toggleWishlist, addToCart }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [view, setView] = useState('grid');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [priceRange, setPriceRange] = useState(500000);
    const [sortBy, setSortBy] = useState("Relevance");

    const [minRating, setMinRating] = useState(0);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [discount, setDiscount] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 24;

    const categoriesList = ["All", "Mobiles", "Electronics", "Fashion", "Home & Kitchen", "Audio", "Gaming", "Beauty", "Books"];
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean).sort())];

    useEffect(() => {
        const cat = searchParams.get('category');
        const q = searchParams.get('q');
        const brand = searchParams.get('brand');
        const type = searchParams.get('type');

        if (cat) setSelectedCategory(cat);
        if (q) setSearchQuery(q);
        if (brand) setSelectedBrands([brand]);
        if (type === 'arrivals') setSortBy("Newest");
    }, [searchParams]);

    const handleReset = () => {
        setSelectedCategory("All");
        setPriceRange(500000);
        setSearchQuery("");
        setMinRating(0);
        setSelectedBrands([]);
        setDiscount(0);
        setCurrentPage(1);
        navigate('/products');
    };

    const toggleBrand = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

    const categoryDetails = {
        "All": { title: "Official Storefront", sub: "Explore All Products", icon: Box },
        "Mobiles": { title: "Mobile Phones", sub: "Latest Smartphones & Accessories", icon: Smartphone },
        "Electronics": { title: "Electronics", sub: "Computers, Laptops & Smart Home", icon: Monitor },
        "Fashion": { title: "Fashion Store", sub: "Trending Apparel & Footwear", icon: ShoppingBag },
        "Home & Kitchen": { title: "Home & Kitchen", sub: "Essentials for Your Space", icon: Home },
        "Audio": { title: "Audio & Headphones", sub: "Premium Sound Experience", icon: Headphones },
        "Gaming": { title: "Gaming Hub", sub: "Consoles, PC & Gear", icon: Gamepad2 },
        "Beauty": { title: "Beauty & Personal Care", sub: "Look and Feel Your Best", icon: Sparkles },
        "Books": { title: "Books & Literature", sub: "Best Sellers & New Releases", icon: Book }
    };

    const details = categoryDetails[selectedCategory] || categoryDetails["All"];

    const filteredProducts = products
        .filter(p => {
            const query = (searchQuery || "").toLowerCase();
            const titleMatch = (p.title || p.name || "").toLowerCase().includes(query);
            const matchesSearch = titleMatch ||
                (p.description || "").toLowerCase().includes(query) ||
                (p.category || "").toLowerCase().includes(query) ||
                (p.brand || "").toLowerCase().includes(query);

            const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
            const matchesPrice = p.price <= priceRange;
            const matchesRating = (p.rating || 4) >= minRating;
            const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
            const matchesDiscount = !discount || (p.discount >= discount || (p.discount_price && ((p.price - p.discount_price) / p.price) * 100 >= discount));

            return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesBrand && matchesDiscount;
        })
        .sort((a, b) => {
            if (sortBy === "Price: Low to High") return a.price - b.price;
            if (sortBy === "Price: High to Low") return b.price - a.price;
            if (sortBy === "Newest") return (b.id || 0) - (a.id || 0);
            return 0;
        });

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const currentProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory, priceRange, minRating, selectedBrands, discount, sortBy]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    };

    return (
        <div className="bg-[#f0f2f2] min-h-screen pt-[140px] lg:pt-[100px] font-sans pb-20">

            {/* HEADER BANNER - CLEAN */}
            <div className="bg-white border-b border-gray-200 py-6">
                <div className="container mx-auto px-4 lg:px-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#f3f3f3] rounded-full flex items-center justify-center text-[#232F3E]">
                                <details.icon size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#111] leading-tight">{details.title}</h1>
                                <p className="text-sm text-[#565959] font-medium">{details.sub}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 bg-[#f0f2f2] px-4 py-2 rounded-md border border-gray-200">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent text-xs font-bold outline-none cursor-pointer text-[#111]"
                                >
                                    <option>Relevance</option>
                                    <option>Newest</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RESULTS NAVIGATION BAR */}
            <div className="bg-[#fafafa] border-b border-gray-100 py-3 shadow-inner">
                <div className="container mx-auto px-4 lg:px-12 flex items-center justify-between">
                    <div className="text-[13px] text-[#565959] font-medium">
                        {filteredProducts.length > 0 ? (
                            <span>Displaying <span className="font-bold text-[#111]">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> of <span className="font-bold text-[#111]">{filteredProducts.length}</span> results</span>
                        ) : (
                            <span>No items found matching your criteria</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-12 py-8 flex flex-col lg:flex-row gap-8">

                {/* SIDEBAR FILTERS */}
                <aside className="w-full lg:w-72 shrink-0">
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200 sticky top-[120px]">
                        <SidebarFilters
                            categories={categoriesList}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            minRating={minRating}
                            setMinRating={setMinRating}
                            selectedBrands={selectedBrands}
                            toggleBrand={toggleBrand}
                            brands={brands}
                            discount={discount}
                            setDiscount={setDiscount}
                            onReset={handleReset}
                        />
                    </div>
                </aside>

                {/* PRODUCT FEED */}
                <main className="flex-1">
                    <AnimatePresence mode="wait">
                        {filteredProducts.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="bg-white p-20 flex flex-col items-center justify-center gap-6 text-center border border-gray-200 shadow-sm"
                            >
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                    <Search size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-[#111]">No product matches for your filter</h3>
                                <button onClick={handleReset} className="bg-[#FFD814] hover:bg-[#F7CA00] px-10 py-3 rounded-md font-bold text-sm shadow-sm">
                                    Refresh Filters
                                </button>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col gap-10">
                                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                    {currentProducts.map((p) => (
                                        <ProductCard key={p.id} product={p} onWishlist={toggleWishlist} addToCart={addToCart} />
                                    ))}
                                </div>

                                {/* PAGINATION */}
                                {totalPages > 1 && (
                                    <div className="flex flex-col items-center gap-4 pt-10 border-t border-gray-200">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-[13px] font-bold shadow-sm h-10"
                                            >
                                                Previous
                                            </button>
                                            {Array.from({ length: totalPages }).map((_, idx) => {
                                                const p = idx + 1;
                                                if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                                                    return (
                                                        <button
                                                            key={p}
                                                            onClick={() => handlePageChange(p)}
                                                            className={`w-10 h-10 rounded-md border text-[13px] font-bold shadow-sm transition-all ${p === currentPage ? 'bg-white border-[#e77600] text-[#e77600] ring-2 ring-[#e77600]/10' : 'bg-white border-gray-300 hover:bg-gray-50 text-black'}`}
                                                        >
                                                            {p}
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })}
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-[13px] font-bold shadow-sm h-10"
                                            >
                                                Next
                                            </button>
                                        </div>
                                        <span className="text-[12px] font-medium text-gray-500 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Products;
