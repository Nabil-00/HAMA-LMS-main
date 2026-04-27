import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from './icons/HamaUIIcons';
import { useToast } from './Toast';
import { useAuth } from '../contexts/AuthContext';
import BrandLogo from './ui/BrandLogo';
import { HamaCertificateIcon } from './icons';

const Signup = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { user, isAuthenticated, signUp } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate, isLoading]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await signUp(email, password, name);
            
            if (result.requiresEmailConfirmation) {
                addToast('An aika imel. Duba inbox ka don tabbatarwa.', 'success');
                navigate('/login');
            } else {
                addToast('Barka da zuwa!', 'success');
                navigate('/dashboard');
            }
        } catch (e: any) {
            setError(e.message || 'Rijiya ta ki yi. Sake gwadawa.');
        } finally {
            setIsLoading(false);
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#1A1A1A] text-[#F5F5DC] selection:bg-[#D4AF37] selection:text-[#1A1A1A] overflow-hidden relative">
            {/* Background Effects */}
            <div className="noise" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.4, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[15%] -left-28 h-[22rem] w-[22rem] md:-left-32 md:h-[30rem] md:w-[30rem] bg-[#046307] blur-[180px] rounded-full opacity-20"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, -45, 0], y: [0, 100, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[20%] -right-28 h-[24rem] w-[24rem] md:-right-32 md:h-[35rem] md:w-[35rem] bg-[#D4AF37] blur-[200px] rounded-full opacity-10"
                />
            </div>

            {/* Left Side - Visual */}
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-20 border-r border-[#D4AF37]/10"
            >
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30 grayscale contrast-[1.2] brightness-[0.6]"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1920&auto=format&fit=crop')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/20 via-[#1A1A1A]/60 to-[#1A1A1A]" />
                <div className="absolute inset-0 bg-[#046307]/20 mix-blend-overlay" />

                <div className="relative z-10 max-w-xl text-center">
                    <motion.div variants={itemVariants} className="flex items-center justify-center gap-6 mb-12">
                        <div className="h-[1px] w-12 bg-[#D4AF37]/50"></div>
                        <span className="text-[#D4AF37] font-black tracking-[0.8em] text-[11px] uppercase">
                            Shiga cikin Makarantar
                        </span>
                        <div className="h-[1px] w-12 bg-[#D4AF37]/50"></div>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl font-black text-[#F5F5DC] mb-8 tracking-tight leading-tight serif">
                        Zama <br />
                        <span className="bg-gradient-to-r from-[#D4AF37] via-[#F5F5DC] to-[#D4AF37] bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer-fast">
                            Malami
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-lg text-[#F5F5DC]/60 max-w-md mx-auto leading-[1.3]">
                        Koyi yin kiɗa na gargajiya tare da malaman kiɗa.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex justify-center gap-16 mt-16">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                                <HamaCertificateIcon size={28} variant="gold" aria-hidden />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#666666]">Tabbatacce</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Side - Signup Form */}
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative z-20"
            >
                <div className="w-full max-w-md space-y-10">
                    <div className="text-center space-y-6">
                        <div className="flex flex-col items-center mb-6">
                            <BrandLogo
                                variant="full"
                                size="lg"
                                plate
                                clickable
                                href="/"
                                alt="HAMA Academy"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-2xl font-black text-[#F5F5DC] uppercase tracking-[0.3em]">Yi Rijista</h1>
                            <p className="text-[10px] text-[#666666] font-black uppercase tracking-[0.3em]">
                                Shiga cikin makarantar
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#666666] uppercase tracking-[0.3em] ml-1">Suna</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37]/40 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4 bg-[#F5F5DC]/5 border border-[#D4AF37]/10 rounded-2xl focus:border-[#D4AF37] outline-none text-[#F5F5DC] transition-all placeholder:text-[#666666]/30 text-sm font-medium"
                                        placeholder="Suna"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#666666] uppercase tracking-[0.3em] ml-1">Imel</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37]/40 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4 bg-[#F5F5DC]/5 border border-[#D4AF37]/10 rounded-2xl focus:border-[#D4AF37] outline-none text-[#F5F5DC] transition-all placeholder:text-[#666666]/30 text-sm font-medium"
                                        placeholder="artist@hama.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#666666] uppercase tracking-[0.3em] ml-1">Kalmar sirri</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37]/40 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-14 pr-20 py-4 bg-[#F5F5DC]/5 border border-[#D4AF37]/10 rounded-2xl focus:border-[#D4AF37] outline-none text-[#F5F5DC] transition-all placeholder:text-[#666666]/30 text-sm font-medium"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-[#D4AF37]/40 hover:text-[#D4AF37] transition-all"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-2xl"
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02, boxShadow: "0 25px 50px rgba(212,175,55,0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-5 bg-[#D4AF37] text-[#1A1A1A] font-black text-[11px] uppercase tracking-[0.4em] rounded-2xl shadow-[0_20px_60px_rgba(212,175,55,0.3)] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-[#1A1A1A]/30 border-t-[#1A1A1A] rounded-full animate-spin" />
                            ) : (
                                <>
                                    Yi Rijista
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="pt-4 text-center">
                        <p className="text-[10px] text-[#666666] font-black uppercase tracking-[0.2em]">
                            Ka rigaya ka Yi rijista?{' '}
                            <Link to="/login" className="text-[#D4AF37] hover:underline">Shiga</Link>
                        </p>
                    </div>
                </div>
            </motion.div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer-fast {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .animate-shimmer-fast {
                    animation: shimmer-fast 3.5s linear infinite;
                }
                `
            }} />
        </div>
    );
};

export default Signup;
