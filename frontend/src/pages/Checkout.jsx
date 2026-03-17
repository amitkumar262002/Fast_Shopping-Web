import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, CreditCard, Smartphone, Landmark, Wallet2, Package,
    CheckCircle2, ChevronRight, ShieldCheck, Truck, Zap, Plus, Edit2, Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ordersAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Real Razorpay Key from .env ───────────────────────────────────────────────
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;


const PAYMENT_METHODS = [
    { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', label: 'Net Banking', icon: Landmark, desc: 'All major banks supported' },
    { id: 'wallet', label: 'Wallets', icon: Wallet2, desc: 'Paytm, MobiKwik, Amazon Pay' },
    { id: 'cod', label: 'Cash on Delivery', icon: Package, desc: 'Pay when delivered' },
];

const Checkout = ({ cart = [], clearCart, couponData = null }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1); // 1=address, 2=payment, 3=review
    const [loading, setLoading] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [addingNew, setAddingNew] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [address, setAddress] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        pincode: '',
        city: '',
        state: '',
        address_line: ''
    });

    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const couponDiscount = couponData?.discount_amount || 0;

    //---PRIME HUB ELITE CALCULATION---
    const isPrime = user?.is_prime;
    const primeDiscount = isPrime ? Math.round(subtotal * 0.2) : 0; // 20% Elite Discount

    const delivery = subtotal > 499 ? 0 : 49;
    const finalTotal = subtotal - couponDiscount - primeDiscount + delivery;
    const formatINR = (n) => `₹${Number(n).toLocaleString('en-IN')} `;

    useEffect(() => {
        if (user) {
            authAPI.getAddresses()
                .then(res => {
                    setSavedAddresses(res.data || []);
                    if (res.data?.length > 0) setSelectedAddressId(res.data[0].id);
                    else setAddingNew(true);
                })
                .catch(() => setAddingNew(true));
        } else {
            setAddingNew(true);
        }
    }, [user]);

    const handleAddressChange = (e) => setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const getActiveAddress = () => {
        if (addingNew) return address;
        return savedAddresses.find(a => a.id === selectedAddressId) || address;
    };

    const validateAddress = () => {
        const a = getActiveAddress();
        if (!a.name || !a.phone || !a.pincode || !a.city || !a.address_line) {
            toast.warning('Please fill all address fields');
            return false;
        }
        return true;
    };

    const loadRazorpay = () => new Promise(resolve => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

    const handlePlaceOrder = async () => {
        if (cart.length === 0) { toast.warning('Your cart is empty'); return; }
        setLoading(true);
        const shippingAddress = getActiveAddress();

        try {
            const orderRes = await ordersAPI.create({
                total_price: finalTotal,
                items: cart.map(i => ({ id: i.id, quantity: i.quantity, price: i.price * i.quantity })),
                shipping_address: shippingAddress,
                payment_method: paymentMethod,
                coupon_code: couponData?.code || null
            });

            if (paymentMethod === 'cod') {
                clearCart && clearCart();
                toast.success('🎉 Order placed! Cash on Delivery selected.');
                navigate('/orders/track');
                return;
            }

            const { razorpay_order_id, amount, key } = orderRes.data;
            const loaded = await loadRazorpay();
            if (!loaded) {
                toast.error('Payment gateway unavailable. Please try COD.');
                setLoading(false);
                return;
            }

            const options = {
                key: key || RAZORPAY_KEY,
                amount: amount,
                currency: 'INR',
                name: 'Fast Shopping Master',
                description: `Order Protocol #${razorpay_order_id.split('_').pop()} `,
                image: 'https://api.dicebear.com/7.x/shapes/svg?seed=fastshopping&backgroundColor=0052cc',
                order_id: razorpay_order_id,
                prefill: {
                    name: shippingAddress.name,
                    contact: shippingAddress.phone,
                    email: user?.email || 'customer@fastshopping.in'
                },
                theme: { color: '#2563eb' },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        toast.info('Payment window closed. Order verification paused.');
                    }
                },
                handler: async (response) => {
                    setLoading(true);
                    try {
                        const verifyRes = await ordersAPI.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyRes.data.status === "PAYMENT_VERIFIED") {
                            clearCart && clearCart();
                            toast.success('🎉 Transaction Verified! Order Initialized.');
                            navigate('/orders/track');
                        }
                    } catch (error) {
                        toast.error('Security verification failed. Please contact support.');
                    } finally {
                        setLoading(false);
                    }
                },
                notes: {
                    address: "Fast Shopping Digital Headquarters",
                    shipping_id: razorpay_order_id
                }
            };

            const rzp = new window.Razorpay(options);

            // Advanced Error Analytics as requested
            rzp.on('payment.failed', function (response) {
                toast.error(`Payment Failed: ${response.error.description} `);
                console.error("Commerce failure telemetry:", response.error);
                setLoading(false);
            });

            rzp.open();
            setLoading(false);
        } catch (err) {
            setLoading(false);
            toast.error(err.response?.data?.detail || 'Failed to create order. Please try again.');
        }
    };

    if (cart.length === 0) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 font-sans">
            <Package size={64} className="text-gray-200 mb-6" />
            <h2 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase mb-3">Cart Empty</h2>
            <button onClick={() => navigate('/products')} className="h-14 px-10 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95">
                Browse Products
            </button>
        </div>
    );

    const STEPS = ['Address', 'Payment', 'Review & Pay'];

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">

            {/* ── STICKY HEADER ── */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40 px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <Zap size={16} className="text-white fill-white" />
                    </div>
                    <span className="font-black italic tracking-tighter text-lg text-gray-900">Fast Checkout</span>
                </div>
                {/* Step indicator */}
                <div className="hidden sm:flex items-center gap-2">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s}>
                            <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${i + 1 <= step ? 'text-blue-600' : 'text-gray-300'} `}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i + 1 < step ? 'bg-green-500 text-white' : i + 1 === step ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'} `}>
                                    {i + 1 < step ? <CheckCircle2 size={12} /> : i + 1}
                                </div>
                                <span className="hidden md:block">{s}</span>
                            </div>
                            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-gray-200" />}
                        </React.Fragment>
                    ))}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <ShieldCheck size={14} className="text-green-500" /> SSL Secured
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-8 py-8 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

                    {/* ── LEFT PANEL ── */}
                    <div className="space-y-6">

                        {/* STEP 1: ADDRESS */}
                        <div className={`bg-white rounded-[32px] overflow-hidden shadow-sm border transition-all ${step >= 1 ? 'border-gray-100' : 'border-gray-100 opacity-60'} `}>
                            <button
                                onClick={() => step > 1 && setStep(1)}
                                className="w-full flex items-center justify-between p-6 sm:p-8 text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${step > 1 ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'} `}>
                                        {step > 1 ? <CheckCircle2 size={18} /> : '1'}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black italic tracking-tighter uppercase text-gray-900">Delivery Address</h2>
                                        {step > 1 && <p className="text-xs font-bold text-gray-400 truncate max-w-[240px]">{getActiveAddress().address_line}, {getActiveAddress().city}</p>}
                                    </div>
                                </div>
                                {step > 1 && <span className="text-xs font-black text-blue-600 uppercase">Change</span>}
                            </button>

                            {step === 1 && (
                                <div className="px-6 sm:px-8 pb-8 space-y-4">
                                    {/* Saved addresses */}
                                    {savedAddresses.length > 0 && (
                                        <div className="space-y-3 mb-4">
                                            {savedAddresses.map(addr => (
                                                <div
                                                    key={addr.id}
                                                    onClick={() => { setSelectedAddressId(addr.id); setAddingNew(false); }}
                                                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id && !addingNew ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 hover:border-blue-300'} `}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${selectedAddressId === addr.id && !addingNew ? 'border-blue-600' : 'border-gray-300'} `}>
                                                        {selectedAddressId === addr.id && !addingNew && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-sm">{addr.name}</p>
                                                        <p className="text-xs text-gray-500 font-medium">{addr.address_line}</p>
                                                        <p className="text-xs text-gray-500 font-medium">{addr.city}, {addr.state}-{addr.pincode}</p>
                                                        <p className="text-xs text-gray-500 font-medium">📱 {addr.phone}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => { setAddingNew(true); setSelectedAddressId(null); }}
                                                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all text-sm font-black text-gray-400 hover: border-blue-400 hover: text-blue-600 ${addingNew ? 'border-blue-600 text-blue-600' : 'border-gray-200'} `}
                                            >
                                                <Plus size={16} /> Add New Address
                                            </button>
                                        </div>
                                    )}

                                    {/* New address form */}
                                    {(addingNew || savedAddresses.length === 0) && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { name: 'name', placeholder: 'Full Name *', span: 1 },
                                                { name: 'phone', placeholder: 'Phone Number *', span: 1 },
                                                { name: 'address_line', placeholder: 'House/Flat, Street, Area *', span: 2 },
                                                { name: 'city', placeholder: 'City *', span: 1 },
                                                { name: 'state', placeholder: 'State *', span: 1 },
                                                { name: 'pincode', placeholder: 'PIN Code *', span: 1 },
                                            ].map(field => (
                                                <input
                                                    key={field.name}
                                                    name={field.name}
                                                    value={address[field.name]}
                                                    onChange={handleAddressChange}
                                                    placeholder={field.placeholder}
                                                    className={`h-14 bg-gray-50 border border-gray-200 rounded-2xl px-5 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus: bg-white focus: ring-4 focus: ring-blue-100 focus: border-blue-500 transition-all ${field.span === 2 ? 'sm:col-span-2' : ''} `}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => { if (validateAddress()) setStep(2); }}
                                        className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        Continue to Payment <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* STEP 2: PAYMENT */}
                        <div className={`bg-white rounded-[32px] overflow-hidden shadow-sm border transition-all ${step >= 2 ? 'border-gray-100' : 'border-gray-100 opacity-50 pointer-events-none'} `}>
                            <button
                                onClick={() => step > 2 && setStep(2)}
                                className="w-full flex items-center justify-between p-6 sm:p-8 text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${step > 2 ? 'bg-green-500 text-white' : step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'} `}>
                                        {step > 2 ? <CheckCircle2 size={18} /> : '2'}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black italic tracking-tighter uppercase text-gray-900">Payment Method</h2>
                                        {step > 2 && <p className="text-xs font-bold text-gray-400">{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}</p>}
                                    </div>
                                </div>
                                {step > 2 && <span className="text-xs font-black text-blue-600 uppercase">Change</span>}
                            </button>

                            {step === 2 && (
                                <div className="px-6 sm:px-8 pb-8 space-y-6">
                                    {/*---BANK OFFERS ALERT---*/}
                                    <div className="bg-orange-50/50 border border-orange-100 rounded-[24px] p-5 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20 animation-pulse">
                                            <Tag size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black italic tracking-tighter text-gray-900 uppercase">Available Bank Protocols</h4>
                                            <p className="text-[11px] font-bold text-gray-600 leading-tight mt-1">
                                                10% Instant Discount on <span className="text-orange-600">HDFC Bank</span> Credit Cards. <br />
                                                Flat ₹1,500 Off on <span className="text-blue-600">SBI Bank</span> Debit Card EMI transactions.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc }) => (
                                            <div
                                                key={id}
                                                onClick={() => setPaymentMethod(id)}
                                                className={`flex items-center gap-4 p-5 rounded-[28px] border-2 cursor-pointer transition-all relative overflow-hidden group ${paymentMethod === id ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-gray-100 hover:border-blue-300 bg-white'} `}
                                            >
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === id ? 'border-blue-600' : 'border-gray-200'} `}>
                                                    {paymentMethod === id && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                                                </div>
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${paymentMethod === id ? 'bg-blue-100 text-blue-600 scale-110 shadow-lg shadow-blue-500/10' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50'} `}>
                                                    <Icon size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-black italic tracking-tighter text-gray-900 uppercase text-sm">{label}</p>
                                                        {id === 'card' && <span className="text-[8px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">EMI Available</span>}
                                                        {id === 'upi' && <span className="text-[8px] font-black bg-green-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Extra Cashback</span>}
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-bold">{desc}</p>
                                                </div>

                                                {/* Hidden Glow Effect */}
                                                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-blue-500/5 to-transparent skew-x-[-20deg] translate-x-10 pointer-events-none" />
                                            </div>
                                        ))}
                                    </div>

                                    {/*---EMI OPTIONS PREVIEW---*/}
                                    {paymentMethod === 'card' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-50 border border-gray-100 rounded-[28px] p-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">Select EMI Plan</h4>
                                                <Link to="#" className="text-[9px] font-black text-blue-600 uppercase hover:underline">View All Banks</Link>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {[
                                                    { bank: 'HDFC Bank', rate: 'No Cost EMI', mo: '₹' + Math.round(finalTotal / 6), tenure: '6 Months' },
                                                    { bank: 'SBI Bank', rate: '14% p.a.', mo: '₹' + Math.round(finalTotal / 12 + 50), tenure: '12 Months' }
                                                ].map((plan, i) => (
                                                    <div key={i} className="bg-white border border-gray-100 p-4 rounded-2xl flex flex-col gap-1 hover:border-blue-400 transition-all cursor-pointer">
                                                        <p className="text-[10px] font-black text-gray-900 uppercase">{plan.bank}</p>
                                                        <p className="text-lg font-black italic tracking-tighter text-blue-600">{plan.mo}<span className="text-[10px] text-gray-400 font-bold ml-1">/mo</span></p>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase">{plan.tenure}</span>
                                                            <span className="text-[8px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-widest">{plan.rate}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    <button
                                        onClick={() => setStep(3)}
                                        className="w-full h-14 bg-gray-950 text-white rounded-[24px] font-black italic text-xs uppercase tracking-[3px] shadow-2xl hover:bg-blue-600 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3"
                                    >
                                        Deploy Verification Step <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* STEP 3: ORDER REVIEW */}
                        <div className={`bg-white rounded-[32px] overflow-hidden shadow-sm border transition-all ${step >= 3 ? 'border-gray-100' : 'border-gray-100 opacity-50 pointer-events-none'} `}>
                            <div className="p-6 sm:p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-sm">3</div>
                                    <h2 className="text-lg font-black italic tracking-tighter uppercase text-gray-900">Order Review</h2>
                                </div>

                                {step === 3 && (
                                    <div className="space-y-4">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                                                <img src={item.image} alt={item.title} className="w-16 h-16 object-contain rounded-xl bg-white border border-gray-100" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='%23cbd5e1'%3E🛒%3C/text%3E%3C/svg%3E"; }} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-gray-900 truncate">{item.title}</p>
                                                    <p className="text-xs text-gray-400 font-semibold">Qty: {item.quantity} × {formatINR(item.price)}</p>
                                                </div>
                                                <span className="font-black text-gray-900 text-sm">{formatINR(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT SUMMARY ── */}
                    <div>
                        <div className="bg-gray-900 rounded-[40px] p-7 text-white shadow-2xl sticky top-24">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase mb-6">Price Details</h3>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm font-semibold text-gray-400">
                                    <span>Price ({cart.length} items)</span>
                                    <span className="text-white">{formatINR(subtotal)}</span>
                                </div>
                                {couponDiscount > 0 && (
                                    <div className="flex justify-between text-sm font-semibold text-green-400">
                                        <span>Coupon Discount</span>
                                        <span>-{formatINR(couponDiscount)}</span>
                                    </div>
                                )}
                                {primeDiscount > 0 && (
                                    <div className="flex justify-between text-sm font-bold text-blue-400 animate-pulse">
                                        <span className="flex items-center gap-1"><Zap size={14} className="fill-blue-400" /> Elite Protocol Discount</span>
                                        <span>-{formatINR(primeDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-semibold text-gray-400">
                                    <span>Delivery</span>
                                    <span className={delivery === 0 ? 'text-green-400' : 'text-white'}>{delivery === 0 ? 'FREE' : formatINR(delivery)}</span>
                                </div>
                                <div className="h-px bg-white/10" />
                                <div className="flex justify-between text-2xl font-black">
                                    <span>Total</span>
                                    <span className="text-blue-400">{formatINR(finalTotal)}</span>
                                </div>
                            </div>

                            {step === 3 && (
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black italic text-sm uppercase tracking-widest shadow-xl hover:shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <><CreditCard size={20} /> Place Order · {formatINR(finalTotal)}</>
                                    )}
                                </button>
                            )}

                            <div className="flex flex-col gap-2 mt-5">
                                {["🔒 100% Secure Payment", "🚚 Fast delivery 2-5 days", "↩️ Easy 7-day returns", "📞 24/7 Customer Support"].map(t => (
                                    <p key={t} className="text-[10px] text-gray-500 font-bold">{t}</p>
                                ))}
                            </div>

                            {/*---INTERNAL DEMO SIMULATOR---*/}
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <p className="text-[10px] font-black uppercase tracking-[3px] text-blue-400 mb-3 text-center">Development Sandbox</p>
                                <button
                                    onClick={async () => {
                                        if (loading) return;
                                        setLoading(true);
                                        try {
                                            const orderRes = await ordersAPI.create({
                                                total_price: finalTotal,
                                                items: cart.map(i => ({ id: i.id, quantity: i.quantity, price: i.price * i.quantity })),
                                                shipping_address: getActiveAddress(),
                                                payment_method: 'upi_mock'
                                            });

                                            // Simulate the verification protocol locally
                                            await ordersAPI.verifyPayment({
                                                razorpay_order_id: orderRes.data.razorpay_order_id || "order_mock_demo",
                                                razorpay_payment_id: "pay_demo_success_999",
                                                razorpay_signature: "sig_demo_verified"
                                            });

                                            clearCart && clearCart();
                                            toast.info("🛠️ [DEMO] Order Simulated Successfully!");
                                            navigate('/orders/track');
                                        } catch (e) {
                                            toast.error("Demo failed. Use manual Netbanking.");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    className="w-full h-12 border border-dashed border-blue-500/50 rounded-2xl text-[10px] font-black uppercase text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-50"
                                >
                                    Force Simulator: Skip Gateway
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
