import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import OrderTracking from './pages/OrderTracking';
import AdminLogin from './pages/AdminLogin';

import { productsAPI, getStoredUser, getStoredToken, storeAuth, clearAuth } from './services/api';
import { AuthContext, useAuth } from './context/AuthContext';
import { rtdb } from './firebase';
import { ref, onValue } from 'firebase/database';

const App = () => {
    const [cart, setCart] = useState(() => {
        try { return JSON.parse(localStorage.getItem('fs_cart') || '[]'); } catch { return []; }
    });
    const [wishlist, setWishlist] = useState(() => {
        try { return JSON.parse(localStorage.getItem('fs_wishlist') || '[]'); } catch { return []; }
    });
    const [savedItems, setSavedItems] = useState(() => {
        try { return JSON.parse(localStorage.getItem('fs_saved') || '[]'); } catch { return []; }
    });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(getStoredUser);
    const [token, setToken] = useState(getStoredToken);
    const [couponData, setCouponData] = useState(null);

    // Persist cart to localStorage
    useEffect(() => {
        localStorage.setItem('fs_cart', JSON.stringify(cart));
    }, [cart]);

    // Persist wishlist to localStorage
    useEffect(() => {
        localStorage.setItem('fs_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    // Persist savedItems to localStorage
    useEffect(() => {
        localStorage.setItem('fs_saved', JSON.stringify(savedItems));
    }, [savedItems]);

    // Fetch products from backend or RTDB
    useEffect(() => {
        const fetchFromRTDB = async () => {
            const productsRef = ref(rtdb, 'products');
            onValue(productsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const productsList = Object.keys(data).map(key => ({
                        ...(data[key] || {}),
                        id: key // ensure ID is set correctly
                    }));
                    setProducts(productsList);
                    setLoading(false);
                }
            });
        };

        const fetchProducts = async () => {
            try {
                // Try backend first
                const response = await productsAPI.getAll({ skip: 0, limit: 500 });
                if (response.data && response.data.length > 0) {
                    setProducts(response.data);
                    setLoading(false);
                } else {
                    // Fallback to RTDB
                    await fetchFromRTDB();
                }
            } catch (error) {
                console.error("Backend unreachable, switching to RTDB:", error.message);
                // Fallback to RTDB
                await fetchFromRTDB();
            }
        };

        fetchProducts();
    }, []);

    // ─── CART ─────────────────────────────────────────────────────────────────
    const addToCart = (product, overwrite = false, skipToast = false) => {
        setCart(prev => {
            const exists = prev.find(i => String(i.id) === String(product.id));
            if (exists) {
                if (overwrite) {
                    if (!skipToast) toast.success('Cart updated! 🎉');
                    return prev.map(i => String(i.id) === String(product.id) ? { ...i, quantity: product.quantity || 1 } : i);
                }
                if (!skipToast) toast.success('Quantity updated! 📦');
                return prev.map(i => String(i.id) === String(product.id) ? { ...i, quantity: i.quantity + (product.quantity || 1) } : i);
            }
            if (!skipToast) toast.success('Added to cart! 🛒');
            return [...prev, { ...product, quantity: product.quantity || 1 }];
        });
    };

    const moveToSaved = (id) => {
        const item = cart.find(i => String(i.id) === String(id));
        if (item) {
            setSavedItems(prev => [...prev, item]);
            removeItem(id, false);
            toast.success('Moved to "Saved for Later"! 📄');
        }
    };

    const moveToCartFromSaved = (id) => {
        const item = savedItems.find(i => String(i.id) === String(id));
        if (item) {
            addToCart(item, false, true);
            setSavedItems(prev => prev.filter(i => String(i.id) !== String(id)));
            toast.info('Moved back to cart');
        }
    };

    const removeFromSaved = (id) => {
        setSavedItems(prev => prev.filter(i => String(i.id) !== String(id)));
        toast.info('Item removed from saved list');
    };

    const updateQuantity = (id, q) => {
        if (q < 1) return removeItem(id);
        setCart(prev => prev.map(i => String(i.id) === String(id) ? { ...i, quantity: q } : i));
    };

    const removeItem = (id, showToast = true) => {
        setCart(prev => prev.filter(i => String(i.id) !== String(id)));
        if (showToast) toast.info('Removed from cart');
    };

    const clearCart = () => {
        setCart([]);
        setCouponData(null);
    };

    // ─── WISHLIST ─────────────────────────────────────────────────────────────
    // Wishlist is now stored as array of IDs for simplicity
    const toggleWishlist = (productOrId) => {
        const id = typeof productOrId === 'object' ? productOrId.id : productOrId;
        setWishlist(prev => {
            if (prev.includes(id)) {
                toast.info('💔 Removed from wishlist');
                return prev.filter(i => i !== id);
            }
            toast.success('❤️ Added to wishlist!');
            return [...prev, id];
        });
    };

    const isInWishlist = (id) => wishlist.includes(Number(id));

    // Wishlist products for the wishlist page
    const wishlistProducts = products.filter(p => wishlist.includes(p.id));

    // ─── AUTH ─────────────────────────────────────────────────────────────────
    const login = (tokenVal, userData) => {
        storeAuth(tokenVal, userData);
        setToken(tokenVal);
        setUser(userData);
        toast.success(`Welcome back, ${userData.name}! 🎉`);
    };

    const logout = () => {
        clearAuth();
        setToken(null);
        setUser(null);
        toast.info('Logged out successfully');
    };

    const syncUser = (userData) => {
        const currentToken = getStoredToken();
        storeAuth(currentToken, userData);
        setUser(userData);
    };

    const authValue = { user, token, login, logout, isLoggedIn: !!token, updateUser: syncUser };

    return (
        <AuthContext.Provider value={authValue}>
            <Router basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AppContent
                    cart={cart}
                    wishlist={wishlist}
                    wishlistProducts={wishlistProducts}
                    savedItems={savedItems}
                    products={products}
                    loading={loading}
                    couponData={couponData}
                    addToCart={addToCart}
                    updateQuantity={updateQuantity}
                    removeItem={removeItem}
                    clearCart={clearCart}
                    toggleWishlist={toggleWishlist}
                    isInWishlist={isInWishlist}
                    setCouponData={setCouponData}
                    moveToSaved={moveToSaved}
                    moveToCartFromSaved={moveToCartFromSaved}
                    removeFromSaved={removeFromSaved}
                />
            </Router>
        </AuthContext.Provider>
    );
};

const AppContent = ({ cart, wishlist, wishlistProducts, savedItems, products, loading, couponData, addToCart, updateQuantity, removeItem, clearCart, toggleWishlist, isInWishlist, setCouponData, moveToSaved, moveToCartFromSaved, removeFromSaved }) => {
    const location = useLocation();
    const noNavRoutes = ['/login', '/admin'];
    const showNav = !noNavRoutes.some(r => location.pathname.startsWith(r));
    const { isLoggedIn, user } = useAuth();

    return (
        <>
            {showNav && <Navbar cartCount={cart.length} wishlistCount={wishlist.length} products={products} />}
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    {/* ─── PUBLIC ROUTES ─── */}
                    <Route path="/" element={<Home products={products} loading={loading} toggleWishlist={toggleWishlist} isInWishlist={isInWishlist} addToCart={addToCart} />} />
                    <Route path="/products" element={<Products products={products} loading={loading} toggleWishlist={toggleWishlist} isInWishlist={isInWishlist} addToCart={addToCart} />} />
                    <Route path="/products/:id" element={<ProductDetails products={products} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />} />
                    <Route path="/product/:id" element={<ProductDetails products={products} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />} />
                    <Route path="/login" element={<Login />} />

                    {/* ─── CART & CHECKOUT ─── */}
                    <Route path="/cart" element={<Cart cart={cart} updateQuantity={updateQuantity} removeItem={removeItem} toggleWishlist={toggleWishlist} products={products} addToCart={addToCart} moveToSaved={moveToSaved} savedItems={savedItems} moveToCartFromSaved={moveToCartFromSaved} removeFromSaved={removeFromSaved} />} />
                    <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} couponData={couponData} />} />

                    {/* ─── USER ROUTES ─── */}
                    <Route path="/wishlist" element={<Wishlist wishlist={wishlistProducts} savedItems={savedItems} toggleWishlist={toggleWishlist} addToCart={addToCart} moveToCartFromSaved={moveToCartFromSaved} removeFromSaved={removeFromSaved} products={products} />} />
                    <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
                    <Route path="/orders" element={<OrderTracking />} />
                    <Route path="/orders/track" element={<OrderTracking />} />

                    {/* ─── ADMIN ROUTES ─── */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                        path="/admin"
                        element={user?.role === 'admin' ? <Admin /> : <Navigate to="/admin/login" />}
                    />
                    <Route
                        path="/admin/*"
                        element={user?.role === 'admin' ? <Admin /> : <Navigate to="/admin/login" />}
                    />

                    {/* ─── FALLBACK ─── */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AnimatePresence>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                theme="dark"
                toastClassName="rounded-2xl font-sans text-sm shadow-2xl"
                style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <ScrollToTop />
            {showNav && <Footer />}
        </>
    );
};

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
};

export default App;
