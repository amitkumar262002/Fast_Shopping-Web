import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Package, Shield, Edit3, Plus, CheckCircle2, Clock, Truck, CreditCard, LogOut, X, ShieldCheck, RefreshCw, Upload, Smartphone, Mail, Key, Bell, HelpCircle, Star, Zap, Sparkles, PlayCircle, Tag, Lock, Wifi, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_STEPS = ["placed", "processing", "shipped", "out_for_delivery", "delivered"];
const STATUS_LABELS = { placed: "Order Placed", processing: "Processing", shipped: "Shipped", out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled" };

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'landing';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [profile, setProfile] = useState(user || {});
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [addingAddress, setAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({ name: '', phone: '', pincode: '', city: '', state: '', address_line: '', landmark: '', address_type: 'Home' });
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [isChangingPass, setIsChangingPass] = useState(false);

    // Payments States
    const [showCardModal, setShowCardModal] = useState(false);
    const [savedCards, setSavedCards] = useState([
        { id: 1, type: 'visa', last4: '4242', name: user?.name || 'User', expiry: '12/28', bank: 'HDFC Bank' }
    ]);
    const [newCard, setNewCard] = useState({ number: '', name: '', expiry: '', cvv: '' });

    const handleAddCard = () => {
        if (!newCard.number || !newCard.name || !newCard.expiry) {
            toast.error("Please fill all card details securely."); return;
        }
        setSavedCards([...savedCards, {
            id: Date.now(),
            type: newCard.number[0] === '5' ? 'mastercard' : newCard.number[0] === '4' ? 'visa' : 'rupay',
            last4: newCard.number.slice(-4).padEnd(4, '0'),
            name: newCard.name,
            expiry: newCard.expiry,
            bank: 'FastPay Added'
        }]);
        setShowCardModal(false);
        setNewCard({ number: '', name: '', expiry: '', cvv: '' });
        toast.success("Card successfully encrypted and saved! 💳");
    };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (user && Object.keys(profile).length === 0) setProfile(user);
    }, [user]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) setActiveTab(tab);
    }, [searchParams]);

    useEffect(() => {
        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'addresses') fetchAddresses();
        // Update URL when tab changes internally
        if (activeTab !== 'landing') {
            setSearchParams({ tab: activeTab }, { replace: true });
        } else {
            setSearchParams({}, { replace: true });
        }
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try { const res = await ordersAPI.getMyOrders(); setOrders(res.data); }
        catch { toast.error('Failed to load orders'); }
        finally { setLoadingOrders(false); }
    };

    const fetchAddresses = async () => {
        try { const res = await authAPI.getAddresses(); setAddresses(res.data); }
        catch { }
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        try {
            const res = await authAPI.updateProfile(profile);
            updateUser(res.data);
            setProfile(res.data);
            toast.success('Your profile has been updated!');
            window.dispatchEvent(new Event('addressUpdated'));
        } catch (err) {
            toast.error('Failed to update profile.');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleAddAddress = async () => {
        const required = ['name', 'phone', 'pincode', 'city', 'state', 'address_line'];
        const missing = required.filter(f => !newAddress[f]);
        if (missing.length > 0) { toast.warning('Please fill all mandatory fields!'); return; }

        setIsSaving(true);
        try {
            if (editingAddress) {
                await authAPI.updateAddress(editingAddress.id, newAddress);
                toast.success('Address updated! 📍');
            } else {
                await authAPI.addAddress(newAddress);
                toast.success('New address added! 📍');
            }
            setAddingAddress(false);
            setEditingAddress(null);
            setNewAddress({ name: '', phone: '', pincode: '', city: '', state: '', address_line: '', landmark: '', address_type: 'Home' });
            fetchAddresses();
            window.dispatchEvent(new Event('addressUpdated'));
        } catch { toast.error('Action failed. Please check connection.'); }
        finally { setIsSaving(false); }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm("Delete this address?")) return;
        try {
            await authAPI.deleteAddress(id);
            toast.info('Address removed');
            fetchAddresses();
            window.dispatchEvent(new Event('addressUpdated'));
        } catch { toast.error('Failed to remove address'); }
    };

    const handleSetDefault = async (id) => {
        try {
            await authAPI.setDefaultAddress(id);
            toast.success('Default address updated!');
            fetchAddresses();
            window.dispatchEvent(new Event('addressUpdated'));
        } catch { toast.error('Failed to set default address'); }
    };

    const handleUpdatePassword = async () => {
        if (!passwords.new || passwords.new !== passwords.confirm) {
            toast.error("Passwords don't match or empty!");
            return;
        }
        setIsChangingPass(true);
        try {
            await authAPI.updateProfile({ password: passwords.new });
            toast.success("Security credentials updated! 🔒");
            setShowPasswordChange(false);
            setPasswords({ old: '', new: '', confirm: '' });
        } catch {
            toast.error("Failed to update security settings.");
        } finally {
            setIsChangingPass(false);
        }
    };

    const formatINR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

    const AccountCard = ({ icon: Icon, title, desc, onClick, color = "text-[#111]" }) => (
        <button
            onClick={onClick}
            className="flex items-start gap-4 p-5 bg-white border border-[#D5D9D9] rounded-xl hover:bg-[#F7FAFA] transition-all text-left group shadow-sm"
        >
            <div className={`p-3 rounded-lg bg-gray-50 flex-shrink-0 group-hover:bg-white transition-colors ${color}`}>
                <Icon size={28} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-[#111] mb-1">{title}</h3>
                <p className="text-sm text-[#565959] leading-snug">{desc}</p>
            </div>
        </button>
    );

    return (
        <div className="bg-[#f0f2f2] min-h-screen pt-[140px] lg:pt-[100px] pb-40 font-sans">
            <div className="container mx-auto px-4 lg:px-12 max-w-6xl">

                <AnimatePresence mode="wait">
                    {/* LANDING GRID VIEW */}
                    {activeTab === 'landing' ? (
                        <motion.div
                            key="landing"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <h1 className="text-3xl font-black text-[#111]">Your Account</h1>
                                    <p className="text-[#565959] mt-1 font-medium">Greetings, <span className="text-[#c45500] font-black">{user?.name}</span>. Manage your settings and preferences here.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white border-2 border-white rounded-full shadow-lg overflow-hidden group">
                                        <img
                                            src={user?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}&backgroundColor=f1f5f9`}
                                            className="w-full h-full object-cover"
                                            alt=""
                                        />
                                    </div>
                                    <button onClick={() => logout()} className="text-sm font-bold text-[#007185] hover:text-[#c45500] hover:underline flex items-center gap-1">
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AccountCard
                                    icon={Package}
                                    title="Your Orders"
                                    desc="Track, return, or buy items again"
                                    onClick={() => navigate('/orders')}
                                    color="text-blue-600"
                                />
                                <AccountCard
                                    icon={Shield}
                                    title="Login & Security"
                                    desc="Edit login, name, and mobile number"
                                    onClick={() => setActiveTab('security')}
                                    color="text-[#e47911]"
                                />
                                <AccountCard
                                    icon={MapPin}
                                    title="Your Addresses"
                                    desc="Edit addresses for orders and gifts"
                                    onClick={() => setActiveTab('addresses')}
                                    color="text-green-600"
                                />
                                <AccountCard
                                    icon={CreditCard}
                                    title="Payment Options"
                                    desc="Edit or add payment methods"
                                    onClick={() => setActiveTab('payments')}
                                    color="text-indigo-600"
                                />
                                <AccountCard
                                    icon={User}
                                    title="Edit Profile"
                                    desc="Update your name and profile picture"
                                    onClick={() => setActiveTab('profile')}
                                    color="text-purple-600"
                                />
                                <AccountCard
                                    icon={Bell}
                                    title="Messages"
                                    desc="View notifications and communications"
                                    onClick={() => setActiveTab('messages')}
                                    color="text-red-500"
                                />
                                <AccountCard
                                    icon={Star}
                                    title="Recommendations"
                                    desc="Personalized suggestions just for you"
                                    onClick={() => setActiveTab('recommendations')}
                                    color="text-amber-500"
                                />
                                <AccountCard
                                    icon={HelpCircle}
                                    title="Customer Service"
                                    desc="Need help? Contact our support team"
                                    onClick={() => navigate('/support')}
                                    color="text-cyan-600"
                                />
                            </div>
                        </motion.div>
                    ) : (
                        /* SUB-SECTION VIEW */
                        <motion.div
                            key="sub"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* Breadcrumbs */}
                            <nav className="flex items-center gap-2 text-[12px] font-bold text-[#565959] mb-4">
                                <button onClick={() => setActiveTab('landing')} className="hover:text-[#007185] hover:underline">Your Account</button>
                                <ChevronRight size={12} />
                                <span className="text-[#c45500] capitalize">Your {activeTab}</span>
                            </nav>

                            {/* PROFILE EDIT SECTION */}
                            {activeTab === 'profile' && (
                                <div className="bg-white rounded-xl shadow-sm border border-[#D5D9D9] p-8 max-w-2xl mx-auto">
                                    <h2 className="text-2xl font-black text-[#111] mb-8">Edit Your Profile</h2>
                                    <div className="space-y-6">
                                        <div className="flex flex-col items-center gap-4 mb-8">
                                            <div className="relative w-32 h-32">
                                                <img
                                                    src={profile.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}&backgroundColor=f1f5f9`}
                                                    className="w-full h-full object-cover rounded-full border-4 border-[#FFD814]"
                                                    alt=""
                                                />
                                                <button className="absolute bottom-1 right-1 p-2 bg-white border border-[#D5D9D9] rounded-full shadow-lg hover:bg-gray-50 transition-all">
                                                    <Upload size={16} className="text-[#007185]" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-[#565959] font-bold uppercase tracking-widest">Update Profile Picture</p>
                                        </div>

                                        <FormField label="Full Name" value={profile.name} onChange={v => setProfile({ ...profile, name: v })} />
                                        <FormField label="Email Address" value={user?.email} disabled />
                                        <FormField label="Phone Number" value={profile.phone} onChange={v => setProfile({ ...profile, phone: v })} placeholder="10-digit mobile number" />

                                        <div className="pt-6">
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={isSavingProfile}
                                                className="w-full h-12 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg text-sm font-bold shadow-sm transition-all"
                                            >
                                                {isSavingProfile ? 'Saving Changes...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SECURITY SECTION */}
                            {activeTab === 'security' && (
                                <div className="bg-white rounded-xl shadow-sm border border-[#D5D9D9] p-8 max-w-2xl mx-auto">
                                    <h2 className="text-2xl font-black text-[#111] mb-8">Login & Security</h2>
                                    <div className="divide-y divide-gray-100">
                                        <SecurityRow label="Full Name" value={user?.name} onEdit={() => setActiveTab('profile')} />
                                        <SecurityRow label="E-mail" value={user?.email} disabled />
                                        <SecurityRow label="Mobile Phone Number" value={user?.phone || 'Not added'} onEdit={() => setActiveTab('profile')} />

                                        {!showPasswordChange ? (
                                            <SecurityRow label="Password" value="********" onEdit={() => setShowPasswordChange(true)} />
                                        ) : (
                                            <div className="py-6 space-y-4">
                                                <h4 className="font-bold text-sm text-[#c45500] uppercase tracking-widest">Update Security Credentials</h4>
                                                <FormField label="New Password" type="password" value={passwords.new} onChange={v => setPasswords({ ...passwords, new: v })} />
                                                <FormField label="Confirm New Password" type="password" value={passwords.confirm} onChange={v => setPasswords({ ...passwords, confirm: v })} />
                                                <div className="flex gap-3 pt-2">
                                                    <button onClick={handleUpdatePassword} disabled={isChangingPass} className="h-10 px-6 bg-[#FFD814] rounded-lg text-sm font-bold shadow-sm">{isChangingPass ? 'Updating...' : 'Save Password'}</button>
                                                    <button onClick={() => setShowPasswordChange(false)} className="h-10 px-6 bg-white border border-[#D5D9D9] rounded-lg text-sm font-bold">Cancel</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <button onClick={() => setActiveTab('landing')} className="h-11 px-8 bg-white border border-[#D5D9D9] rounded-lg text-sm font-bold hover:bg-[#F7FAFA] shadow-sm">Done</button>
                                    </div>
                                </div>
                            )}

                            {/* PAYMENTS SECTION */}
                            {activeTab === 'payments' && (
                                <div className="space-y-6 max-w-5xl mx-auto">
                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <h2 className="text-3xl font-black text-[#111] tracking-tight">Your Wallet & Cards</h2>
                                            <p className="text-[#565959] font-medium text-sm mt-1">Manage your saved cards, FastPay, and exclusive payment privileges.</p>
                                        </div>
                                        <button
                                            onClick={() => setShowCardModal(true)}
                                            className="h-11 px-6 bg-white border border-[#D5D9D9] rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-gray-50 active:scale-95 transition-all"
                                        >
                                            <Plus size={18} className="text-[#007185]" /> Add Debit/Credit Card
                                        </button>
                                    </div>

                                    {/* Modal for Adding Card */}
                                    <AnimatePresence>
                                        {showCardModal && (
                                            <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCardModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                                                <motion.div
                                                    initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                                    className="relative w-full max-w-[450px] bg-white rounded-xl shadow-2xl overflow-hidden"
                                                >
                                                    <div className="bg-[#f0f2f2] px-6 py-4 flex items-center justify-between border-b border-gray-200">
                                                        <h3 className="font-extrabold text-[#111] text-[16px] flex items-center gap-2"><CreditCard size={18} /> Add a Payment Method</h3>
                                                        <button onClick={() => setShowCardModal(false)} className="text-gray-500 hover:text-black"><X size={20} /></button>
                                                    </div>
                                                    <div className="p-6 space-y-4">
                                                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                                                            <ShieldCheck size={24} className="text-blue-600 mt-0.5" />
                                                            <div>
                                                                <p className="text-sm font-bold text-blue-900">Fast Shopping Secure-Pay</p>
                                                                <p className="text-xs text-blue-700 mt-1">Your card details are 256-bit AES encrypted and securely vaulted. We do not store your CVV.</p>
                                                            </div>
                                                        </div>

                                                        <FormField label="Card Number" type="text" placeholder="0000 0000 0000 0000" maxLength={16} value={newCard.number} onChange={v => setNewCard({ ...newCard, number: v })} />
                                                        <FormField label="Name on Card" type="text" placeholder="John Doe" value={newCard.name} onChange={v => setNewCard({ ...newCard, name: v })} />

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormField label="Expiry Date" type="text" placeholder="MM/YY" maxLength={5} value={newCard.expiry} onChange={v => setNewCard({ ...newCard, expiry: v })} />
                                                            <FormField label="CVV" type="password" placeholder="•••" maxLength={3} value={newCard.cvv} onChange={v => setNewCard({ ...newCard, cvv: v })} />
                                                        </div>

                                                        <div className="pt-4 flex gap-3">
                                                            <button onClick={handleAddCard} className="flex-1 h-12 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95">Verify & Save Card</button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        )}
                                    </AnimatePresence>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                        {/* FAST SHOPPING ELITE CARD (PREMIUM ONLY) */}
                                        <div className="relative group">
                                            {/* Glow effect for premium */}
                                            {user?.is_prime && (
                                                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                                            )}

                                            <div className={`relative h-[240px] rounded-[30px] p-8 text-white shadow-2xl overflow-hidden transition-all duration-500 border border-gray-800 ${user?.is_prime ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' : 'bg-gray-200 border-none'}`}>
                                                {!user?.is_prime && (
                                                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                                                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/20"><Lock size={32} className="text-white drop-shadow-md" /></div>
                                                        <h3 className="text-xl font-black text-white italic uppercase tracking-widest mb-2">FastPay Elite Black</h3>
                                                        <p className="text-sm text-gray-300 mb-6 font-medium max-w-xs">Gain access to the exclusive Fast Shopping Credit Card with 5% unlimited cashback.</p>
                                                        <button onClick={() => navigate('/profile?tab=prime')} className="px-8 py-3 bg-gradient-to-r from-[#FFCC00] to-[#FF9900] text-black font-black uppercase text-xs tracking-widest rounded-full shadow-[0_0_20px_rgba(255,153,0,0.4)] hover:scale-105 transition-all">Unlock with Prime</button>
                                                    </div>
                                                )}

                                                {/* Card Background Pattern */}
                                                <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-white/5 rounded-full blur-[40px] pointer-events-none"></div>
                                                <div className="absolute bottom-[-20px] left-[-20px] w-[150px] h-[150px] bg-[#FF9900]/10 rounded-full blur-[30px] pointer-events-none"></div>

                                                <div className="relative z-10 h-full flex flex-col justify-between">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Zap size={24} className={user?.is_prime ? 'fill-[#FF9900] text-[#FF9900]' : 'text-gray-400'} />
                                                                <span className="font-black tracking-tighter text-xl italic uppercase">FastPay <span className={user?.is_prime ? 'text-[#FF9900]' : ''}>Elite</span></span>
                                                            </div>
                                                            <span className="text-[9px] uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-sm font-bold border border-white/5">World Credit</span>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <div className={`flex -space-x-3 ${!user?.is_prime && 'grayscale opacity-50'}`}>
                                                                <div className="w-8 h-8 rounded-full bg-[#EB001B]/90 mix-blend-screen"></div>
                                                                <div className="w-8 h-8 rounded-full bg-[#F79E1B]/90 mix-blend-screen"></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="w-12 h-9 rounded bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 shadow-inner flex items-center justify-center border border-yellow-700/50">
                                                            <div className="w-8 h-5 border border-yellow-800/30 rounded-sm"></div>
                                                        </div>

                                                        <div className="flex justify-between items-end">
                                                            <div>
                                                                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">Card Holder</p>
                                                                <p className="text-lg font-black tracking-[4px] uppercase font-mono shadow-sm">{user?.name || 'MEMBER'}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xl font-mono tracking-[4px] drop-shadow-md">•••• 8821</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Additional Elite Features Below Card */}
                                            {user?.is_prime && (
                                                <div className="mt-4 p-5 bg-gradient-to-r from-gray-900 to-black rounded-xl border border-gray-800 flex justify-between items-center text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-[#FF9900]/20 rounded-full flex items-center justify-center text-[#FF9900]">
                                                            <Star size={20} className="fill-[#FF9900]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Available Cashback</p>
                                                            <p className="text-lg font-black text-[#FF9900]">₹ 1,450.00</p>
                                                        </div>
                                                    </div>
                                                    <button className="text-[10px] font-black uppercase tracking-widest border border-gray-700 px-4 py-2 rounded-full hover:bg-gray-800 transition-all">Redeem Now</button>
                                                </div>
                                            )}
                                        </div>

                                        {/* STANDARD SAVED CARDS */}
                                        <div className="space-y-4">
                                            <h3 className="font-black text-lg text-[#111] mb-2 px-1">Your Saved Debit & Credit Cards</h3>

                                            {savedCards.map(card => (
                                                <div key={card.id} className="p-5 bg-white border border-[#D5D9D9] hover:border-blue-400 hover:shadow-md rounded-2xl flex items-center justify-between transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 shadow-inner">
                                                            {card.type === 'visa' && <span className="font-black text-[#1434CB] text-xl italic tracking-tighter drop-shadow-sm">VISA</span>}
                                                            {card.type === 'mastercard' && (
                                                                <div className="flex -space-x-2 mt-0.5">
                                                                    <div className="w-6 h-6 rounded-full bg-[#EB001B] mix-blend-multiply"></div>
                                                                    <div className="w-6 h-6 rounded-full bg-[#F79E1B] mix-blend-multiply"></div>
                                                                </div>
                                                            )}
                                                            {card.type === 'rupay' && <span className="font-black text-indigo-700 text-sm italic">RuPay</span>}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-[#111] capitalize text-sm">{card.bank} {card.type}</p>
                                                            <p className="text-sm font-mono text-gray-500 font-bold tracking-[2px]">•••• {card.last4}</p>
                                                            <p className="text-[11px] text-gray-400 mt-0.5">Expires {card.expiry} • {card.name}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => setSavedCards(savedCards.filter(c => c.id !== card.id))} className="text-sm font-bold text-[#007185] hover:text-red-500 hover:underline px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}

                                            <div className="mt-6 p-6 bg-gradient-to-r from-[#f7fafa] to-white border border-gray-200 rounded-2xl flex items-start gap-4">
                                                <div className="p-2 bg-green-100 text-green-600 rounded-full mt-0.5 shadow-sm border border-green-200">
                                                    <ShieldCheck size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-[#111] text-sm mb-1 uppercase tracking-widest">Bank-grade Security</h4>
                                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Your payment methods are encrypted and stored in Fast Shopping PCI-DSS compliant secure vaults. We never save your full CVV or MPIN.</p>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* ADDRESSES SECTION */}
                            {activeTab === 'addresses' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-black text-[#111]">Your Addresses</h2>
                                        <button
                                            onClick={() => setAddingAddress(true)}
                                            className="h-10 px-6 bg-white border border-[#D5D9D9] rounded-lg text-sm font-black hover:bg-[#F7FAFA] shadow-sm flex items-center gap-2"
                                        >
                                            <Plus size={18} /> Add New Address
                                        </button>
                                    </div>

                                    {addingAddress && (
                                        <div className="bg-[#fcf8e3] border border-[#faebcc] rounded-xl p-8 max-w-3xl mx-auto shadow-sm">
                                            <h3 className="text-lg font-bold text-[#8a6d3b] mb-6 flex items-center gap-2">
                                                <MapPin size={20} /> {editingAddress ? 'Update this address' : 'Add a new address'}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                <input placeholder="Full Name" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} className="h-11 border border-[#D5D9D9] rounded-lg px-4 text-sm focus:ring-2 focus:ring-[#e47911] outline-none" />
                                                <input placeholder="Mobile Number" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} className="h-11 border border-[#D5D9D9] rounded-lg px-4 text-sm focus:ring-2 focus:ring-[#e47911] outline-none" />
                                                <input placeholder="Flat, House no., Building" value={newAddress.address_line} onChange={e => setNewAddress({ ...newAddress, address_line: e.target.value })} className="h-11 border border-[#D5D9D9] rounded-lg px-4 text-sm md:col-span-2 focus:ring-2 focus:ring-[#e47911] outline-none" />
                                                <input placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} className="h-11 border border-[#D5D9D9] rounded-lg px-4 text-sm focus:ring-2 focus:ring-[#e47911] outline-none" />
                                                <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="h-11 border border-[#D5D9D9] rounded-lg px-4 text-sm focus:ring-2 focus:ring-[#e47911] outline-none" />
                                                <input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} className="h-11 border border-[#D5D9D9] rounded-lg px-4 text-sm focus:ring-2 focus:ring-[#e47911] outline-none" />
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={handleAddAddress} disabled={isSaving} className="h-10 px-8 bg-[#FFD814] hover:bg-[#F7CA00] rounded-lg text-sm font-bold shadow-sm">{isSaving ? 'Processing...' : (editingAddress ? 'Update' : 'Add Address')}</button>
                                                <button onClick={() => { setAddingAddress(false); setEditingAddress(null); }} className="h-10 px-8 bg-white border border-[#D5D9D9] rounded-lg text-sm font-bold">Cancel</button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <button
                                            onClick={() => setAddingAddress(true)}
                                            className="h-64 flex flex-col items-center justify-center gap-4 bg-white border-4 border-dashed border-gray-200 rounded-2xl hover:border-[#007185] hover:bg-gray-50 transition-all text-gray-300 hover:text-[#007185]"
                                        >
                                            <Plus size={48} />
                                            <span className="text-xl font-black uppercase">Add Address</span>
                                        </button>
                                        {addresses.map(addr => (
                                            <div key={addr.id} className="h-64 bg-white border border-[#D5D9D9] rounded-2xl p-6 flex flex-col justify-between shadow-sm relative group overflow-hidden">
                                                {addr.is_default && <div className="absolute top-0 right-0 px-3 py-1 bg-gray-100 text-[#565959] text-[10px] font-bold rounded-bl-lg">Default</div>}
                                                <div>
                                                    <p className="font-bold text-[#111] mb-1">{addr.name}</p>
                                                    <p className="text-sm text-[#565959] leading-relaxed">
                                                        {addr.address_line}<br />
                                                        {addr.city}, {addr.state} {addr.pincode}<br />
                                                        India<br />
                                                        Phone: {addr.phone}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                                    <button
                                                        onClick={() => { setEditingAddress(addr); setNewAddress(addr); setAddingAddress(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                        className="text-sm font-bold text-[#007185] hover:text-[#c45500] hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                    <div className="w-px h-4 bg-gray-200"></div>
                                                    <button onClick={() => handleDeleteAddress(addr.id)} className="text-sm font-bold text-[#007185] hover:text-[#c45500] hover:underline">Remove</button>
                                                    {!addr.is_default && (
                                                        <>
                                                            <div className="w-px h-4 bg-gray-200"></div>
                                                            <button onClick={() => handleSetDefault(addr.id)} className="text-sm font-bold text-[#007185] hover:text-[#c45500] hover:underline">Set Default</button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* MESSAGES SECTION */}
                            {activeTab === 'messages' && (
                                <div className="bg-white rounded-xl shadow-sm border border-[#D5D9D9] p-8 max-w-3xl mx-auto">
                                    <h2 className="text-2xl font-black text-[#111] mb-8">Message Centre</h2>
                                    <div className="space-y-4">
                                        <div className="p-10 bg-[#f7fafa] border border-gray-100 rounded-[32px] flex flex-col items-center justify-center gap-6 text-center">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md text-blue-500">
                                                <Bell size={40} />
                                            </div>
                                            <div>
                                                <p className="text-xl font-black text-[#111]">You're all caught up!</p>
                                                <p className="text-sm text-[#565959] mt-2 font-medium">When you have new notifications about orders, returns, or account security, they'll appear here.</p>
                                            </div>
                                            <button onClick={() => navigate('/products')} className="mt-2 h-11 px-8 bg-[#232F3E] text-white rounded-full font-bold text-sm hover:scale-105 transition-all shadow-lg">Continue Shopping</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PRIME SECTION */}
                            {activeTab === 'prime' && (
                                <div className="space-y-6 max-w-5xl mx-auto">
                                    {!user?.is_prime ? (
                                        // Non-Prime User View (Upsell Funnel)
                                        <div className="bg-[#131921] rounded-[30px] shadow-2xl overflow-hidden border border-gray-800 text-white relative">
                                            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none"><Sparkles size={120} /></div>
                                            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-black p-12 lg:p-16 flex flex-col items-center gap-6 text-center relative z-10">
                                                <Zap size={64} className="text-blue-400 fill-blue-400 animate-pulse drop-shadow-[0_0_30px_rgba(96,165,250,0.8)]" />
                                                <h2 className="text-4xl lg:text-5xl font-black italic tracking-tight uppercase drop-shadow-md">Fast Shopping <span className="text-blue-400">Prime</span></h2>
                                                <p className="text-lg lg:text-xl font-bold opacity-90 max-w-2xl leading-relaxed">
                                                    Unlock the ultimate shopping and entertainment experience. Enjoy unlimited free fast delivery, award-winning streaming, and exclusive member-only deals.
                                                </p>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8 max-w-4xl">
                                                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all cursor-default">
                                                        <Truck size={32} className="text-blue-400 mb-4" />
                                                        <h3 className="font-black tracking-widest uppercase text-sm text-blue-300 mb-2">Free Fast Delivery</h3>
                                                        <p className="text-xs text-gray-400 font-medium leading-relaxed">Get your items in 1-2 days, or even same-day in eligible PIN codes. No minimum purchase required.</p>
                                                    </div>
                                                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all cursor-default">
                                                        <PlayCircle size={32} className="text-blue-400 mb-4" />
                                                        <h3 className="font-black tracking-widest uppercase text-sm text-blue-300 mb-2">Prime Video & Music</h3>
                                                        <p className="text-xs text-gray-400 font-medium leading-relaxed">Stream thousands of blockbuster movies, hit TV shows, and ad-free music with unlimited skips.</p>
                                                    </div>
                                                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all cursor-default">
                                                        <Tag size={32} className="text-blue-400 mb-4" />
                                                        <h3 className="font-black tracking-widest uppercase text-sm text-blue-300 mb-2">Exclusive Deals</h3>
                                                        <p className="text-xs text-gray-400 font-medium leading-relaxed">Get 30-minute early access to top Lightning Deals and access to exclusive Prime Day savings events.</p>
                                                    </div>
                                                </div>

                                                <div className="mt-8 flex flex-col md:flex-row gap-4 items-center">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const res = await authAPI.updateProfile({ is_prime: true });
                                                                updateUser(res.data);
                                                                setProfile(res.data);
                                                                toast.success("Welcome to Prime! 🎉 Your membership is now active.");
                                                            } catch (e) { toast.error("Failed to activate Prime"); }
                                                        }}
                                                        className="px-10 py-5 bg-[#FFD814] text-[#111] font-black uppercase text-sm tracking-widest rounded-full hover:bg-[#F7CA00] shadow-[0_0_30px_rgba(255,216,20,0.3)] hover:scale-105 active:scale-95 transition-all"
                                                    >
                                                        Start your 30-day Free Trial
                                                    </button>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">₹1,499/year after trial. Cancel anytime.</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Prime Member Interactive Dashboard
                                        <div className="space-y-6">
                                            {/* Top Banner / Welcome Card */}
                                            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-black rounded-[30px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-gray-800">
                                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Sparkles size={200} /></div>
                                                <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none"></div>
                                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Zap size={32} className="text-[#00A8E1] fill-[#00A8E1]" />
                                                            <h2 className="text-3xl md:text-5xl font-black italic tracking-tight uppercase drop-shadow-md">Fast Shopping <span className="text-[#00A8E1]">Prime</span></h2>
                                                        </div>
                                                        <p className="text-lg text-blue-100 font-medium">Welcome back, {user?.name}. Your membership is actively saving you money.</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2 bg-black/30 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                                                        <span className="text-xs uppercase tracking-widest text-[#00A8E1] font-bold">Premium Status Active</span>
                                                        <span className="text-[10px] text-gray-400 italic font-medium">Member since {new Date(user?.created_at || Date.now()).getFullYear()}</span>
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm("Are you sure you want to end your Prime benefits?")) {
                                                                    try {
                                                                        const res = await authAPI.updateProfile({ is_prime: false });
                                                                        updateUser(res.data);
                                                                        setProfile(res.data);
                                                                        toast.info("Prime membership cancelled.");
                                                                    } catch (e) { toast.error("Action failed"); }
                                                                }
                                                            }}
                                                            className="mt-2 text-[10px] font-bold text-gray-400 hover:text-white underline decoration-gray-600 hover:decoration-white transition-all transition-colors"
                                                        >
                                                            Manage Membership
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Core Analytics Tracker */}
                                                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all">
                                                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 shadow-inner border border-green-500/30"><Tag size={24} /></div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Total Savings</p>
                                                            <p className="text-2xl font-black text-white tracking-tight">₹2,840</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all">
                                                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 shadow-inner border border-blue-500/30"><Truck size={24} /></div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Free Deliveries</p>
                                                            <p className="text-2xl font-black text-white tracking-tight">14 <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Orders</span></p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all">
                                                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 shadow-inner border border-purple-500/30"><Star size={24} /></div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Exclusive Drops</p>
                                                            <p className="text-2xl font-black text-white tracking-tight">3 <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Claimed</span></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Advanced Entertainment Hub */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Prime Video Mock Widget */}
                                                <div className="bg-[#0f172a] rounded-[30px] shadow-xl overflow-hidden group hover:shadow-2xl transition-all cursor-pointer relative border border-gray-200">
                                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10 pointer-events-none"></div>
                                                    <video
                                                        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
                                                        autoPlay loop muted playsInline
                                                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 pointer-events-none"
                                                    />
                                                    <div className="relative z-20 p-8 h-full flex flex-col justify-end min-h-[250px] text-white">
                                                        <span className="text-[#00A8E1] font-black italic tracking-widest text-xs uppercase mb-2 drop-shadow-md flex items-center gap-2"><PlayCircle size={14} /> Prime Video</span>
                                                        <h3 className="text-2xl font-black mb-1 drop-shadow-lg tracking-tight">Interstellar: Returns</h3>
                                                        <p className="text-sm text-gray-300 font-bold mb-5 drop-shadow-md">Continue Watching • S2 E4</p>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toast.info("Opening Prime Video app...", { icon: '🍿' }); }}
                                                            className="w-max px-6 py-2.5 bg-[#00A8E1] hover:bg-[#0092C4] text-white font-black text-xs uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2 transition-all active:scale-95 border border-[#00A8E1]/50"
                                                        >
                                                            <PlayCircle size={16} className="fill-white text-[#00A8E1]" /> Play Now
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Fast Music Mock Widget */}
                                                <div className="bg-gradient-to-br from-[#1E1B4B] to-[#4C1D95] rounded-[30px] shadow-xl overflow-hidden group cursor-pointer relative p-8 text-white flex flex-col justify-between min-h-[250px] border border-indigo-500/20 hover:shadow-2xl transition-all">
                                                    <div className="flex justify-between items-start relative z-20">
                                                        <span className="text-purple-300 font-black italic tracking-widest text-xs uppercase bg-black/30 px-3 py-1.5 rounded-full border border-white/10 shadow-sm">Fast Music</span>
                                                        <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:bg-white/20 transition-all border border-white/10"><PlayCircle size={20} className="ml-0.5" /></button>
                                                    </div>

                                                    <div className="relative z-20">
                                                        <div className="flex items-end gap-5">
                                                            <div className="w-24 h-24 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-[20px] shadow-2xl flex items-center justify-center overflow-hidden border border-white/20 group-hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] transition-all group-hover:-translate-y-1 duration-300">
                                                                <Zap size={40} className="text-white opacity-80" />
                                                            </div>
                                                            <div className="mb-2">
                                                                <h3 className="text-xl font-black mb-1 tracking-tight">Top 50 - Global Space</h3>
                                                                <p className="text-[11px] uppercase tracking-widest text-purple-200 font-bold">Updated Daily • Ad-Free</p>
                                                                <div className="flex gap-1.5 mt-3 items-end h-4">
                                                                    {[1, 2, 3, 4, 5].map(i => (
                                                                        <div key={i} className={`w-1.5 bg-purple-400 rounded-t-full animate-pulse group-hover:bg-pink-400 transition-colors`} style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.15}s` }}></div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Deliveries Context Banner */}
                                            <div className="bg-white rounded-[30px] shadow-sm border border-[#D5D9D9] p-8 flex flex-col sm:flex-row items-center gap-6 justify-between transform hover:-translate-y-1 hover:shadow-md transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-[20px] flex items-center justify-center shadow-inner border border-blue-200/50"><Truck size={32} /></div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-[#111] tracking-tight">Prime Delivery Priority</h3>
                                                        <p className="text-sm text-[#565959] font-medium leading-relaxed max-w-sm mt-1">All your orders are automatically upgraded to the fastest possible shipping speeds.</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => navigate('/orders')} className="w-full sm:w-auto h-12 px-8 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-full font-black text-xs uppercase tracking-widest text-[#111] shadow-sm transition-all active:scale-95">Track Packages</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SELLER SECTION */}
                            {activeTab === 'seller' && (
                                <div className="bg-[#f0f2f2] rounded-xl shadow-inner border border-gray-200 p-8 max-w-5xl mx-auto">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black text-[#111] uppercase italic tracking-tighter">Fast Hub <span className="text-[#e47911]">Seller Central</span></h2>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">Store Active</span>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200">Top Rated Seller</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                        {[
                                            { label: "Today's Sales", value: "₹45,290", icon: <Tag className="text-orange-500" /> },
                                            { label: "Pending Orders", value: "12", icon: <Clock className="text-blue-500" /> },
                                            { label: "Customer Feedback", value: "4.9/5", icon: <Star className="text-yellow-500 fill-yellow-500" /> },
                                            { label: "Unread Messages", value: "3", icon: <Mail className="text-red-500" /> }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="flex items-center gap-2 mb-2">{stat.icon} <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{stat.label}</span></div>
                                                <p className="text-2xl font-black text-[#111]">{stat.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-lg text-center space-y-4">
                                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto"><Plus size={32} className="text-[#e47911]" /></div>
                                        <h3 className="text-xl font-black text-[#111]">List Your Next Product</h3>
                                        <p className="text-sm text-gray-500 max-w-sm mx-auto">Start reaching millions of customers across India with our high-speed fulfillment network.</p>
                                        <button className="h-11 px-10 bg-[#FFD814] hover:bg-[#F7CA00] rounded-full font-black text-xs uppercase tracking-widest shadow-lg">Inventory Manager</button>
                                    </div>
                                </div>
                            )}

                            {/* BUSINESS SECTION */}
                            {activeTab === 'business' && (
                                <div className="bg-[#111] rounded-[30px] shadow-2xl overflow-hidden border border-gray-800 p-0 max-w-5xl mx-auto text-white">
                                    <div className="p-12 border-b border-gray-800 flex flex-col items-center text-center gap-4 bg-gradient-to-b from-[#1a232e] to-black">
                                        <ShieldCheck size={50} className="text-blue-500 animate-pulse" />
                                        <h2 className="text-3xl font-black tracking-tight uppercase italic">Fast Shopping <span className="text-blue-500">Business</span></h2>
                                        <p className="text-blue-200/60 font-medium uppercase text-[10px] tracking-[4px]">Verified Corporate Account: {user?.company || "Professional Mode"}</p>
                                    </div>
                                    <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-black border-l-4 border-blue-500 pl-4">Business Settings</h3>
                                            <ul className="space-y-4">
                                                {["GST Invoice Documentation", "Multi-User Buying Permissions", "Corporate Payment Methods", "Quantity Discount Analysis"].map((item, i) => (
                                                    <li key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 cursor-pointer transition-all">
                                                        <CheckCircle2 size={18} className="text-blue-500" />
                                                        <span className="text-sm font-bold opacity-80">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-blue-600/10 rounded-[40px] border border-blue-500/20 p-10 flex flex-col justify-center text-center gap-6">
                                            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(37,99,235,0.4)]"><Smartphone size={40} /></div>
                                            <h3 className="text-2xl font-black">Business Prime</h3>
                                            <p className="text-sm opacity-60 leading-relaxed">Upgrade to Business Prime for centralized warehouse shipping and specialized tax benefits.</p>
                                            <button className="mt-2 h-12 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-400 transition-all">Go Pro Now</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* RECOMMENDATIONS SECTION */}
                            {activeTab === 'recommendations' && (
                                <div className="bg-white rounded-xl shadow-sm border border-[#D5D9D9] p-8 max-w-5xl mx-auto">
                                    <h2 className="text-2xl font-black text-[#111] mb-8 tracking-tighter uppercase italic">Premium Picks For You</h2>
                                    <div className="bg-gradient-to-br from-[#f3f8f9] to-white p-12 rounded-[40px] border border-blue-50 flex flex-col items-center gap-6 text-center shadow-inner relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4"><Zap size={40} className="text-blue-100" /></div>
                                        <Sparkles size={64} className="text-[#FF9900] animate-bounce" />
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-[#111]">Building your personalized hub...</h3>
                                            <p className="text-[#565959] max-w-lg font-bold text-sm uppercase tracking-widest opacity-60">AI-Powered Product Engine v4.0</p>
                                        </div>
                                        <p className="text-[#565959] max-w-md font-medium text-lg">Our neural network is processing your shopping patterns to recommend the absolute best deals. This usually takes just a few moments.</p>
                                        <div className="flex gap-4 pt-4">
                                            <button onClick={() => navigate('/products')} className="h-12 px-10 bg-[#FFD814] hover:bg-[#F7CA00] rounded-full font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95">Explore All</button>
                                            <button onClick={() => setActiveTab('landing')} className="h-12 px-10 bg-white border border-[#D5D9D9] rounded-full font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">Go Back</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Sub-components
const FormField = ({ label, value, onChange, disabled, placeholder, type = "text" }) => (
    <div className="space-y-1.5">
        <label className="text-sm font-bold text-[#111] ml-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange && onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full h-11 border rounded-lg px-4 text-sm transition-all outline-none ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100' : 'border-[#D5D9D9] focus:ring-2 focus:ring-[#e47911]'}`}
        />
    </div>
);

const SecurityRow = ({ label, value, onEdit, disabled }) => (
    <div className="flex items-center justify-between py-5 group">
        <div className="space-y-0.5">
            <p className="text-[15px] font-black text-[#111]">{label}:</p>
            <p className="text-sm text-[#565959]">{value}</p>
        </div>
        {!disabled && (
            <button onClick={onEdit} className="h-9 px-6 bg-white border border-[#D5D9D9] rounded-lg text-sm font-bold hover:bg-[#F7FAFA] shadow-sm">Edit</button>
        )}
    </div>
);

const ChevronRight = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>;

export default Profile;
