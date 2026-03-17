import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight,
    CheckCircle2, RefreshCw, KeyRound, ShieldCheck,
    MapPin, Home, ArrowLeft, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    updateFirebaseProfile,
    resetPassword
} from '../firebase';

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.4 30.2 0 24 0 14.8 0 7 5.4 3.2 13.3l7.8 6C12.9 13.2 18 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.2-10 7.2-17z" />
        <path fill="#FBBC05" d="M11 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.8-6C1.2 16.4 0 20 0 24s1.2 7.6 3.2 10.7l7.8-6.1z" />
        <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6 0-11.1-3.7-13-9.1l-7.8 6.1C7 42.6 14.9 48 24 48z" />
    </svg>
);

const Blob = ({ className }) => (
    <div className={`absolute rounded-full blur-3xl opacity-20 animate-pulse ${className}`} />
);

const Login = () => {
    const [mode, setMode] = useState('login');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [regStep, setRegStep] = useState(1);
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '', phone: '',
        profile_image: 'https://api.dicebear.com/7.x/personas/svg?seed=FastShopping&backgroundColor=f1f5f9',
        pincode: '', city: '', state: '', address_line: ''
    });
    const [passwordStrength, setPasswordStrength] = useState(0);

    const avatarStyles = [
        { id: "personas", label: "Personas" },
        { id: "adventurer", label: "Adventurer" },
        { id: "miniavs", label: "Minimalist" },
        { id: "big-ears", label: "Stylized" },
        { id: "avataaars", label: "Classic" }
    ];
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        if (!form.password) { setPasswordStrength(0); return; }
        let score = 0;
        if (form.password.length > 8) score++;
        if (/[A-Z]/.test(form.password)) score++;
        if (/[0-9]/.test(form.password)) score++;
        if (/[^A-Za-z0-9]/.test(form.password)) score++;
        setPasswordStrength(score);
    }, [form.password]);

    useEffect(() => {
        if (form.pincode?.length === 6) {
            const mappings = {
                '110001': { city: 'New Delhi', state: 'Delhi' },
                '400001': { city: 'Mumbai', state: 'Maharashtra' },
                '560001': { city: 'Bengaluru', state: 'Karnataka' },
                '600001': { city: 'Chennai', state: 'Tamil Nadu' },
                '700001': { city: 'Kolkata', state: 'West Bengal' },
                '800001': { city: 'Patna', state: 'Bihar' },
                '226001': { city: 'Lucknow', state: 'Uttar Pradesh' },
                '302001': { city: 'Jaipur', state: 'Rajasthan' },
                // Haryana & Specialized Mappings
                '122001': { city: 'Gurugram', state: 'Haryana' },
                '122002': { city: 'Gurugram', state: 'Haryana' },
                '122018': { city: 'Gurugram', state: 'Haryana' },
                '121001': { city: 'Faridabad', state: 'Haryana' },
                '121002': { city: 'Faridabad', state: 'Haryana' },
                '124001': { city: 'Rohtak', state: 'Haryana' },
                '124103': { city: 'Jhajjar', state: 'Haryana' },
                '124104': { city: 'Jhajjar', state: 'Haryana' },
                '131001': { city: 'Sonipat', state: 'Haryana' },
                '132103': { city: 'Panipat', state: 'Haryana' },
                '124507': { city: 'Bahadurgarh', state: 'Haryana' },
                '134109': { city: 'Panchkula', state: 'Haryana' },
                '125001': { city: 'Hisar', state: 'Haryana' },
                '127021': { city: 'Bhiwani', state: 'Haryana' },
                '133001': { city: 'Ambala', state: 'Haryana' },
                '136118': { city: 'Kurukshetra', state: 'Haryana' },
                '121102': { city: 'Palwal', state: 'Haryana' },
                '201301': { city: 'Noida', state: 'Uttar Pradesh' },
                '201010': { city: 'Ghaziabad', state: 'Uttar Pradesh' },
            };
            const found = mappings[form.pincode];
            if (found) {
                setForm(p => ({ ...p, city: found.city, state: found.state }));
                toast.success(`📍 Identified: ${found.city}, ${found.state}`, { autoClose: 1000 });
            }
        }
    }, [form.pincode]);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleGoogleSignIn = async () => {
        if (googleLoading) return;
        setGoogleLoading(true);
        try {
            const result = await signInWithGoogle();
            const fbUser = result.user;

            // Use the specialized socialLogin endpoint which handles both login & auto-registration
            const res = await authAPI.socialLogin({
                name: fbUser.displayName || fbUser.email.split('@')[0],
                email: fbUser.email,
                uid: fbUser.uid,
                phone: fbUser.phoneNumber || '',
                profile_image: fbUser.photoURL || '',
            });

            login(res.data.token, res.data.user);
            window.dispatchEvent(new Event('addressUpdated'));
            toast.success(`🎉 Welcome, ${fbUser.displayName || 'User'}!`);
            navigate('/');
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user') {
                toast.info('Sign-in cancelled');
            } else {
                console.error("G-Auth Error:", err);
                toast.error('Google Sign-In failed or sync issue.');
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (mode === 'login') {
            if (!form.email || !form.password) { toast.error('Required fields missing'); return; }
            setLoading(true);
            try {
                // Relying on FastAPI backend for login to avoid Firebase overhead/errors
                const res = await authAPI.login({ email: form.email, password: form.password });
                login(res.data.token, res.data.user);
                window.dispatchEvent(new Event('addressUpdated'));
                toast.success(`Welcome back, ${res.data.user.name}! 🎉`);
                navigate('/');
            } catch (err) {
                toast.error(err.response?.data?.detail || 'Invalid credentials or connection error.');
            } finally {
                setLoading(false);
            }
            return;
        }

        if (mode === 'register') {
            if (regStep === 1) {
                if (!form.email || !form.password || !form.name) { toast.error('Basic info is mandatory'); return; }
                if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
                if (form.password.length < 6) { toast.error('Password too weak'); return; }
                setRegStep(2);
                return;
            }

            if (regStep === 2) {
                if (!form.pincode || !form.city || !form.address_line) { toast.error('Address is required'); return; }
                if (form.phone && form.phone.length !== 10) { toast.warning('Mobile number must be 10 digits'); return; }
                setRegStep(3);
                return;
            }

            setLoading(true);
            try {
                // Removed registerWithEmail and updateFirebaseProfile as we prioritize FastAPI backend
                // This resolves the 400 identitytoolkit error which occurred in manual flows.

                const res = await authAPI.register({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    phone: form.phone || '',
                    profile_image: form.profile_image
                });

                try {
                    await authAPI.addAddress({
                        name: form.name,
                        phone: form.phone || '0000000000',
                        pincode: form.pincode,
                        city: form.city,
                        state: form.state || 'India',
                        address_line: form.address_line,
                        address_type: 'Home',
                        is_default: true
                    });
                    window.dispatchEvent(new Event('addressUpdated'));
                } catch (addrErr) {
                    console.error("Address sync failed:", addrErr);
                }

                setShowSuccess(true);
                setTimeout(() => {
                    login(res.data.token, res.data.user);
                    navigate('/');
                }, 2500);
            } catch (err) {
                const detail = err.response?.data?.detail || err.message || 'Registration failed.';
                toast.error(detail);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!form.email) { toast.error('Enter your email'); return; }
        setLoading(true);
        try {
            await resetPassword(form.email);
            toast.success('Check your inbox for reset link.');
            setMode('login');
        } catch (err) {
            toast.error('Failed to send reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans overflow-hidden bg-slate-50">
            <div className="hidden lg:flex w-[55%] bg-gray-950 relative flex-col items-center justify-center p-20 overflow-hidden">
                <Blob className="w-96 h-96 bg-blue-600 top-[-10%] left-[-10%]" />
                <Blob className="w-72 h-72 bg-purple-600 bottom-[-5%] right-[-5%]" />
                <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&fit=crop&q=60)` }} />
                <div className="relative z-10 max-w-lg text-white">
                    <div className="flex items-center gap-4 mb-16">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
                            <Zap size={30} className="text-white fill-white" />
                        </div>
                        <div>
                            <div className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Fast Shopping</div>
                            <div className="text-[10px] text-gray-400 font-bold tracking-[4px] uppercase">Future of Retail</div>
                        </div>
                    </div>
                    <h1 className="text-7xl font-black italic tracking-tighter leading-[0.85] uppercase mb-8">Shop Smart. Live Better.</h1>
                    <p className="text-gray-400 font-medium leading-relaxed mb-12 text-lg">200+ premium products. Lightning-fast delivery. Secure payments.</p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
                <div className="w-full max-w-md">
                    {mode !== 'forgot' && (
                        <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
                            {[{ k: 'login', l: 'Sign In' }, { k: 'register', l: 'Create Account' }].map(m => (
                                <button key={m.k} onClick={() => setMode(m.k)} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${mode === m.k ? 'bg-white shadow-md text-gray-900' : 'text-gray-400'}`}>{m.l}</button>
                            ))}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div key={mode + (mode === 'register' ? regStep : '')} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                            <div className="flex justify-between items-start mb-8">
                                <h2 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase">
                                    {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join Us' : 'Reset'}
                                </h2>
                                {mode === 'register' && (
                                    <div className="flex gap-1 mt-2">
                                        {[1, 2, 3].map(s => <div key={s} className={`w-6 h-1 rounded-full ${regStep >= s ? 'bg-blue-600' : 'bg-gray-200'}`} />)}
                                    </div>
                                )}
                            </div>

                            {mode !== 'forgot' && (
                                <>
                                    <button onClick={handleGoogleSignIn} disabled={googleLoading} className="w-full h-14 flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-2xl font-black text-sm text-gray-700 hover:border-blue-400 transition-all disabled:opacity-60 mb-6">
                                        {googleLoading ? <RefreshCw className="animate-spin" size={20} /> : <GoogleIcon />} {googleLoading ? 'Connecting...' : 'Continue with Google'}
                                    </button>
                                    <div className="flex items-center gap-4 mb-6"><div className="flex-1 h-px bg-gray-100" /><span className="text-[10px] font-black text-gray-300 uppercase">or</span><div className="flex-1 h-px bg-gray-100" /></div>
                                </>
                            )}

                            <form onSubmit={mode === 'forgot' ? handleForgotPassword : handleSubmit} className="space-y-4">
                                {mode === 'register' && regStep === 1 && (
                                    <>
                                        <InputField icon={<User size={16} />} name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
                                        <InputField icon={<Mail size={16} />} name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
                                        <InputField icon={<Lock size={16} />} name="password" type={showPass ? "text" : "password"} placeholder="Password" value={form.password} onChange={handleChange} />
                                        <InputField icon={<ShieldCheck size={16} />} name="confirmPassword" type="password" placeholder="Verify Password" value={form.confirmPassword} onChange={handleChange} />
                                    </>
                                )}
                                {mode === 'register' && regStep === 2 && (
                                    <>
                                        <InputField icon={<MapPin size={16} />} name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} />
                                        <InputField icon={<Phone size={16} />} name="phone" placeholder="Mobile" value={form.phone} onChange={handleChange} />
                                        <InputField icon={<Home size={16} />} name="city" placeholder="City" value={form.city} onChange={handleChange} />
                                        <InputField icon={<MapPin size={16} />} name="address_line" placeholder="Address Details" value={form.address_line} onChange={handleChange} />
                                    </>
                                )}
                                {mode === 'register' && regStep === 3 && (
                                    <div className="p-5 bg-indigo-50/50 rounded-[28px] border border-indigo-100/50">
                                        <p className="text-[10px] font-black uppercase mb-4">CHOOSE AVATAR</p>
                                        <div className="flex justify-between gap-2 overflow-x-auto pb-1">
                                            {avatarStyles.map(style => (
                                                <div key={style.id} onClick={() => setForm(p => ({ ...p, profile_image: `https://api.dicebear.com/7.x/${style.id}/svg?seed=${form.name || 'Fast'}&backgroundColor=f1f5f9` }))} className={`w-14 h-14 shrink-0 rounded-[20px] border-2 cursor-pointer ${form.profile_image.includes(style.id) ? 'border-blue-600 bg-white' : 'border-white'}`}>
                                                    <img src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=${form.name || 'Fast'}&backgroundColor=f1f5f9`} alt="Avatar" className="w-full h-full p-1" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {mode === 'login' && (
                                    <>
                                        <InputField icon={<Mail size={16} />} name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
                                        <InputField icon={<Lock size={16} />} name="password" type={showPass ? "text" : "password"} placeholder="Password" value={form.password} onChange={handleChange} />
                                    </>
                                )}
                                {mode === 'forgot' && <InputField icon={<Mail size={16} />} name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />}

                                <button type="submit" disabled={loading} className="w-full h-14 bg-gray-950 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3">
                                    {loading ? <RefreshCw className="animate-spin" /> : (mode === 'login' ? 'Sign In' : mode === 'register' ? (regStep === 3 ? 'Finalize' : 'Next Step') : 'Reset Password')}
                                </button>
                                {mode === 'register' && regStep > 1 && <button type="button" onClick={() => setRegStep(regStep - 1)} className="w-full text-[10px] font-black text-gray-400 uppercase">Back</button>}
                            </form>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* SUCCESS OVERLAY */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[5000] bg-blue-600 flex items-center justify-center text-white text-center">
                        <div className="max-w-sm">
                            <img src={form.profile_image} alt="Profile" className="w-24 h-24 bg-white rounded-[40px] mx-auto mb-10 p-1" />
                            <h2 className="text-5xl font-black italic uppercase mb-4">Welcome Home, {form.name.split(" ")[0]}!</h2>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const InputField = ({ icon, name, type = 'text', placeholder, value, onChange }) => (
    <div className="relative flex items-center">
        <div className="absolute left-4 text-gray-400">{icon}</div>
        <input name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl pl-11 pr-5 text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition-all" />
    </div>
);

export default Login;
