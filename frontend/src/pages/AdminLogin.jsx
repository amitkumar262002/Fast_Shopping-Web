import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Mail, Zap, RefreshCw, ArrowRight, ShieldAlert, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI, storeAuth } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const [creds, setCreds] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        if (!creds.email || !creds.password) {
            toast.warning("Protocol Error: Credentials Required");
            return;
        }

        setLoading(true);
        setIsAuthenticating(true);

        try {
            const res = await authAPI.login(creds);
            const user = res.data.user;

            if (user.role !== 'admin') {
                toast.error("Access Denied: High-Level Clearance Required");
                setIsAuthenticating(false);
                setLoading(false);
                return;
            }

            // Success: Sythesize Auth
            login(res.data.token, user);
            toast.success("Admin Verified. Accessing Control Panel...", { icon: "🚀" });

            setTimeout(() => {
                navigate('/admin');
            }, 1500);

        } catch (err) {
            toast.error("Encryption Mismatch: Invalid Credentials");
            setIsAuthenticating(false);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-500/30">
            {/* --- MATRIX BACKGROUND ELEMENTS --- */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            </div>

            <AnimatePresence>
                {isAuthenticating ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 text-center space-y-8"
                    >
                        <div className="relative">
                            <div className="w-32 h-32 border-4 border-blue-500/10 rounded-full mx-auto" />
                            <div className="w-32 h-32 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 -translate-x-1/2" />
                            <ShieldCheck size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-2">Authenticating Admin</h2>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[6px] animate-pulse">Establishing Secure Connection...</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 w-full max-w-md"
                    >
                        {/* Header Section */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[28px] shadow-2xl shadow-blue-500/20 mb-6 group cursor-default">
                                <Zap size={36} className="text-white fill-white group-hover:scale-110 transition-transform" />
                            </div>
                            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none mb-2">Admin Portal</h1>
                            <div className="flex items-center justify-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[4px]">Restricted Domain v4.5</p>
                            </div>
                        </div>

                        {/* Login Card */}
                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[48px] p-10 shadow-3xl">
                            <form onSubmit={handleAdminLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Admin Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            value={creds.email}
                                            onChange={(e) => setCreds({ ...creds, email: e.target.value })}
                                            placeholder="admin@fastshopping.com"
                                            className="w-full h-16 bg-white/5 border border-white/10 rounded-[24px] pl-14 pr-6 text-white text-sm font-medium outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="password"
                                            value={creds.password}
                                            onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                                            placeholder="Admin Password"
                                            className="w-full h-16 bg-white/5 border border-white/10 rounded-[24px] pl-14 pr-6 text-white text-sm font-medium outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-18 bg-blue-600 text-white rounded-[24px] font-black italic text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-white hover:text-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    {loading ? <RefreshCw className="animate-spin" /> : <><ShieldCheck size={20} /> Login as Admin</>}
                                </button>
                            </form>

                            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4 text-center">
                                <div className="flex items-center justify-center gap-4">
                                    <div className="flex items-center gap-1.5 opacity-40">
                                        <Globe size={12} className="text-gray-400" />
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter tracking-[2px]">Encrypted Session</span>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-gray-700" />
                                    <div className="flex items-center gap-1.5 opacity-40">
                                        <ShieldAlert size={12} className="text-gray-400" />
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter tracking-[2px]">TLS 1.3 Active</span>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/')} className="text-[9px] font-black text-gray-500 uppercase tracking-[3px] hover:text-blue-400 transition-colors">Return to Homepage</button>
                            </div>
                        </div>

                        {/* Footer Warning */}
                        <p className="mt-10 text-center text-gray-600 text-[10px] font-medium leading-relaxed max-w-xs mx-auto">
                            WARNING: UNAUTHORIZED ACCESS ATTEMPTS ARE LOGGED AND SECURITY TRACED.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminLogin;
