import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, CheckCircle2, Truck, Home, MapPin, ClipboardList,
    ShoppingCart, ChevronRight, RefreshCw, Clock, Phone, Star, ArrowLeft,
    Download, RotateCcw, ShieldCheck, HelpCircle, MessageSquare, AlertCircle,
    Navigation, ExternalLink, Repeat, Trash2, XCircle, CreditCard, Zap, Search
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SNYh5IBLPCqXUW";

const STATUS_STEPS = [
    { key: 'placed', label: 'Order Placed', icon: ClipboardList, desc: 'Your order has been confirmed' },
    { key: 'processing', label: 'Processing', icon: Package, desc: 'Warehouse is packing your items' },
    { key: 'shipped', label: 'Shipped', icon: Truck, desc: 'On its way to your city' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Navigation, desc: 'Delivery agent is nearby' },
    { key: 'delivered', label: 'Delivered', icon: Home, desc: 'Package delivered successfully' },
];

const STATUS_ORDER = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const getStatusIndex = (status) => STATUS_ORDER.indexOf(status);

const OrderTracking = () => {
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeRange, setActiveRange] = useState('3 months');

    const formatINR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const downloadInvoice = (orderId) => {
        toast.info(`Downloading Invoice for Order #${orderId}...`);
    };

    const fetchOrders = async () => {
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }
        try {
            const res = await ordersAPI.getMyOrders();
            const sortedOrders = (res.data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setOrders(sortedOrders);
            if (selectedOrder) {
                const refreshed = sortedOrders.find(o => o.id === selectedOrder.id);
                if (refreshed) setSelectedOrder(refreshed);
            } else if (sortedOrders.length > 0) {
                setSelectedOrder(sortedOrders[0]);
            }
        } catch (err) {
            toast.error('Failed to connect to Fulfillment Center');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchOrders();
        setTimeout(() => {
            setRefreshing(false);
            toast.success('Orders refreshed!');
        }, 800);
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        setActionLoading(true);
        try {
            await ordersAPI.cancelOrder(orderId);
            toast.success('Order Cancelled Successfully');
            await fetchOrders();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Cancellation Failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Remove this order from your history?")) return;
        setActionLoading(true);
        try {
            await ordersAPI.deleteOrder(orderId);
            toast.success('Order Removed');
            setSelectedOrder(null);
            await fetchOrders();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Deletion Failed');
        } finally {
            setActionLoading(false);
        }
    };

    const loadRazorpay = () => new Promise(resolve => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

    const handleResumePayment = async (order) => {
        setActionLoading(true);
        const rzp_order_id = order.razorpay_order_id;
        if (!rzp_order_id) {
            toast.error("Invalid payment order. Contact support.");
            setActionLoading(false);
            return;
        }

        const loaded = await loadRazorpay();
        if (!loaded) {
            toast.error('Payment gateway unavailable.');
            setActionLoading(false);
            return;
        }

        const options = {
            key: RAZORPAY_KEY,
            amount: order.total_price * 100,
            currency: 'INR',
            name: 'Fast Shopping',
            description: `Payment for Order #${order.id}`,
            order_id: rzp_order_id,
            prefill: {
                name: user?.name,
                contact: user?.phone,
                email: user?.email
            },
            theme: { color: '#2563eb' },
            handler: async (response) => {
                setActionLoading(true);
                try {
                    await ordersAPI.verifyPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    });
                    toast.success('🎉 Payment Verified! Order Processing.');
                    fetchOrders();
                } catch (error) {
                    toast.error('Verification failed.');
                } finally {
                    setActionLoading(false);
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setActionLoading(false);
    };

    const STATUS_COLORS = {
        placed: 'text-blue-600 bg-blue-50 border-blue-200 shadow-sm',
        processing: 'text-orange-600 bg-orange-50 border-orange-200 shadow-sm',
        shipped: 'text-purple-600 bg-purple-50 border-purple-200 shadow-sm',
        out_for_delivery: 'text-cyan-600 bg-cyan-50 border-cyan-200 shadow-sm',
        delivered: 'text-green-600 bg-green-50 border-green-200 shadow-sm',
        cancelled: 'text-red-600 bg-red-50 border-red-200 shadow-sm',
    };

    if (!isLoggedIn) return (
        <div className="min-h-screen bg-[#f0f2f2] flex flex-col items-center justify-center p-8 pt-[140px] lg:pt-[100px] font-sans">
            <ShieldCheck size={80} className="text-[#007185] mb-8 opacity-20" />
            <h2 className="text-4xl font-black text-[#111] mb-6">Sign in to see your orders</h2>
            <Link to="/login" className="h-14 px-12 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full text-sm font-bold shadow-sm transition-all focus:ring-2 focus:ring-[#e47911] flex items-center gap-3">
                Sign In Now
            </Link>
        </div>
    );

    if (loading) return (
        <div className="min-h-screen bg-[#f0f2f2] pt-[140px] lg:pt-[100px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#007185] rounded-full animate-spin" />
                <p className="font-bold text-[#565959]">Fetching your orders...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-[#f0f2f2] min-h-screen pt-[140px] lg:pt-[100px] pb-20 font-sans">
            <div className="container mx-auto px-4 lg:px-12">

                {/* Breadcrumbs & Header */}
                <div className="mb-10">
                    <nav className="flex items-center gap-2 text-[12px] font-bold text-[#565959] mb-4">
                        <Link to="/profile" className="hover:text-[#007185] hover:underline">Your Account</Link>
                        <ChevronRight size={12} />
                        <span className="text-[#c45500]">Your Orders</span>
                    </nav>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h1 className="text-3xl font-black text-[#111] tracking-tight">Your Orders</h1>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search all orders"
                                    className="h-10 w-full sm:w-64 bg-white border border-[#D5D9D9] rounded-lg px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#e47911] shadow-sm"
                                />
                                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                            <button className="h-10 px-6 bg-white border border-[#D5D9D9] rounded-lg shadow-sm text-sm font-bold hover:bg-[#F7FAFA]">Filter</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 items-start">

                    {/* Orders List Sidebar */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-[#D5D9D9] pb-2">
                            <div className="flex items-center gap-4 text-sm font-bold text-[#565959]">
                                <button onClick={() => setActiveRange('3 months')} className={`pb-2 border-b-2 transition-all ${activeRange === '3 months' ? 'border-[#e47911] text-[#111]' : 'border-transparent'}`}>3 months</button>
                                <button onClick={() => setActiveRange('2024')} className={`pb-2 border-b-2 transition-all ${activeRange === '2024' ? 'border-[#e47911] text-[#111]' : 'border-transparent'}`}>2024</button>
                                <button onClick={() => setActiveRange('2023')} className={`pb-2 border-b-2 transition-all ${activeRange === '2023' ? 'border-[#e47911] text-[#111]' : 'border-transparent'}`}>2023</button>
                            </div>
                            <button onClick={handleRefresh} className="p-2 hover:bg-white rounded-full transition-all">
                                <RefreshCw size={18} className={`text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {orders.length === 0 ? (
                            <div className="bg-white rounded-xl p-10 text-center border border-[#D5D9D9] shadow-sm">
                                <Package size={48} className="text-gray-200 mx-auto mb-4" />
                                <p className="font-bold text-[#111] mb-2">You haven't placed any orders.</p>
                                <Link to="/products" className="text-sm font-bold text-[#007185] hover:underline">Start shopping</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <motion.div
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className={`bg-white rounded-xl p-5 shadow-sm border cursor-pointer transition-all relative ${selectedOrder?.id === order.id ? 'border-[#e47911] bg-[#fdfaf3]' : 'border-[#D5D9D9] hover:bg-gray-50'}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-bold text-[#565959] uppercase">Order #{order.id}</p>
                                                <p className="text-sm font-black text-[#111]">{formatDate(order.created_at).split(',')[0]}</p>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${STATUS_COLORS[order.order_status] || STATUS_COLORS.placed}`}>
                                                {order.order_status?.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-4 overflow-hidden">
                                            {order.items?.slice(0, 3).map(item => (
                                                <img key={item.id} src={item.image} className="w-12 h-12 rounded-lg object-contain bg-[#f8f8f8] border border-gray-100" alt="" />
                                            ))}
                                            {order.items?.length > 3 && (
                                                <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center text-[11px] font-black text-white">+{order.items.length - 3}</div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <span className="font-black text-[#111]">{formatINR(order.total_price)}</span>
                                            <ChevronRight size={18} className="text-gray-400" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Order Detailed View */}
                    <AnimatePresence mode="wait">
                        {selectedOrder ? (
                            <motion.div
                                key={selectedOrder.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                {/* PAYMENT ACTION */}
                                {selectedOrder.payment_status === 'pending' && selectedOrder.order_status !== 'cancelled' && (
                                    <div className="bg-[#fff4f4] border border-[#f5c2c7] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                                <AlertCircle size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-[#111]">Payment Action Required</h3>
                                                <p className="text-sm text-[#565959] font-medium uppercase tracking-wider">Your order will be cancelled automatically if payment isn't received.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleResumePayment(selectedOrder)}
                                            disabled={actionLoading}
                                            className="h-12 px-8 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full text-sm font-bold shadow-sm flex items-center gap-2 whitespace-nowrap"
                                        >
                                            {actionLoading ? <RefreshCw className="animate-spin" /> : <ShieldCheck size={18} />} Pay Now
                                        </button>
                                    </div>
                                )}

                                {/* ORDER DETAILS CARD */}
                                <div className="bg-white rounded-xl shadow-sm border border-[#D5D9D9] overflow-hidden">
                                    <div className="p-6 bg-[#f6f6f6] border-b border-[#D5D9D9] flex flex-wrap justify-between items-center gap-4">
                                        <div className="flex gap-8">
                                            <div>
                                                <p className="text-[11px] font-bold text-[#565959] uppercase mb-1">Order Placed</p>
                                                <p className="text-sm font-bold text-[#111]">{formatDate(selectedOrder.created_at)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-[#565959] uppercase mb-1">Total</p>
                                                <p className="text-sm font-bold text-[#111]">{formatINR(selectedOrder.total_price)}</p>
                                            </div>
                                            <div className="hidden sm:block">
                                                <p className="text-[11px] font-bold text-[#565959] uppercase mb-1">Ship to</p>
                                                <button className="text-sm font-bold text-[#007185] hover:text-[#c45500] hover:underline flex items-center gap-1">{user?.name} <ChevronDown size={14} /></button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-bold text-[#565959] uppercase mb-1">Order #{selectedOrder.id}</p>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => downloadInvoice(selectedOrder.id)} className="text-sm font-bold text-[#007185] hover:text-[#c45500] hover:underline">Invoice</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        {/* Status Progress */}
                                        {selectedOrder.order_status !== 'cancelled' && (
                                            <div className="mb-12">
                                                <h3 className="text-xl font-black text-[#111] mb-8 flex items-center gap-2">
                                                    <Package className="text-green-600" />
                                                    {selectedOrder.order_status === 'delivered' ? 'Delivered' : 'Arriving Soon'}
                                                </h3>
                                                <div className="relative flex justify-between">
                                                    <div className="absolute top-1/2 left-[5%] right-[5%] h-1 bg-gray-100 -translate-y-1/2 overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500 transition-all duration-1000"
                                                            style={{ width: `${(getStatusIndex(selectedOrder.order_status) / (STATUS_STEPS.length - 1)) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    {STATUS_STEPS.map((step, i) => {
                                                        const currentIdx = getStatusIndex(selectedOrder.order_status);
                                                        const isCompleted = i <= currentIdx;
                                                        const isActive = i === currentIdx;
                                                        return (
                                                            <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-green-600 text-white border-4 border-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-300'}`}>
                                                                    {isCompleted ? <CheckCircle2 size={18} /> : <step.icon size={18} />}
                                                                </div>
                                                                <p className={`text-[10px] font-black uppercase whitespace-nowrap ${isCompleted ? 'text-green-700' : 'text-gray-400'}`}>{step.label}</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-gray-100">
                                            <div className="space-y-6">
                                                <h4 className="text-sm font-black uppercase text-[#111] tracking-wider mb-4">Items in this shipment</h4>
                                                {selectedOrder.items?.map(item => (
                                                    <div key={item.id} className="flex gap-4 group">
                                                        <div className="w-20 h-20 bg-[#f8f8f8] rounded-lg border border-gray-100 flex items-center justify-center p-2 shrink-0">
                                                            <img src={item.image} className="max-w-full max-h-full object-contain" alt="" />
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <Link to={`/products?id=${item.id}`} className="text-sm font-bold text-[#007185] hover:text-[#c45500] hover:underline line-clamp-2 leading-snug">{item.title}</Link>
                                                            <p className="text-xs text-[#565959] font-medium">Qty: {item.quantity}</p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <button className="h-8 px-4 bg-[#FFDB5C] hover:bg-[#F7CA00] rounded-lg shadow-sm text-xs font-bold text-[#111]">Buy it again</button>
                                                                <button className="h-8 px-4 bg-white border border-[#D5D9D9] hover:bg-[#f7fafa] rounded-lg shadow-sm text-xs font-bold text-[#111]">Review</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="bg-[#fcfcfc] border border-gray-100 rounded-xl p-6 space-y-6">
                                                <div>
                                                    <h4 className="text-sm font-black uppercase text-[#111] tracking-wider mb-4">Shipping Address</h4>
                                                    <p className="text-sm font-bold text-[#111]">{user?.name}</p>
                                                    <p className="text-sm text-[#565959] leading-relaxed mt-1">
                                                        {selectedOrder.shipping_address_line || "Flat No 402, Block B"}<br />
                                                        {selectedOrder.shipping_city || "Gurugram"}, {selectedOrder.shipping_state || "Haryana"}<br />
                                                        {selectedOrder.shipping_pincode || "122018"}
                                                    </p>
                                                </div>
                                                <div className="pt-6 border-t border-gray-200">
                                                    <h4 className="text-sm font-black uppercase text-[#111] tracking-wider mb-4">Order Summary</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-[#565959]">Item(s) Subtotal:</span>
                                                            <span className="font-medium">{formatINR(selectedOrder.total_price)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[#565959]">Shipping:</span>
                                                            <span className="font-medium">₹0.00</span>
                                                        </div>
                                                        <div className="flex justify-between pt-2 text-[#111] font-black border-t">
                                                            <span>Grand Total:</span>
                                                            <span>{formatINR(selectedOrder.total_price)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="pt-6 border-t border-gray-200 space-y-3">
                                                    <button
                                                        onClick={() => handleCancelOrder(selectedOrder.id)}
                                                        disabled={selectedOrder.order_status === 'delivered' || selectedOrder.order_status === 'cancelled'}
                                                        className="w-full h-11 border border-[#D5D9D9] hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-bold transition-all disabled:opacity-30"
                                                    >
                                                        Cancel Items
                                                    </button>
                                                    <button className="w-full h-11 border border-[#D5D9D9] hover:bg-gray-50 rounded-xl text-xs font-bold">Track Package</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                                <ClipboardList size={64} className="text-gray-100 mb-6" />
                                <h3 className="text-2xl font-black text-gray-300 uppercase">Select an order</h3>
                                <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-[3px]">Click an order card to view its tracking lifecycle</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// Help Icons
const ChevronDown = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>;

export default OrderTracking;
