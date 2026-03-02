import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck, Globe } from 'lucide-react';
import { useToast } from './Toast';
import { useAuth } from '../contexts/AuthContext';

const Signup = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { user, isAuthenticated, signUp, signInWithGoogle } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate('/');
        }
    }, [isAuthenticated, navigate, isLoading]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await signUp(email, password, name);
            addToast('Account created successfully!', 'success');
            navigate('/');
        } catch (e: any) {
            setError(e.message || 'Signup failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-bg-primary text-text-primary selection:bg-hama-gold selection:text-black relative overflow-hidden">
            <div className="noise" />
            <div className="aura" style={{ top: '-10%', right: '-10%' }} />
            <div className="aura" style={{ bottom: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(242, 201, 76, 0.05) 0%, transparent 70%)' }} />

            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-20 border-r border-hama-gold/10">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 grayscale"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-primary/95 to-hama-gold/5"></div>

                <div className="relative z-10 max-w-xl text-center">
                    <h1 className="text-6xl font-bold text-text-primary mb-8 tracking-tight leading-tight serif">
                        Join the <span className="text-hama-gold">HAMA</span> Movement.
                    </h1>
                    <p className="text-text-secondary text-xl leading-relaxed mb-12 font-light">
                        Start your journey in Saharan sound and institutional excellence.
                    </p>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative z-20">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="text-center space-y-4">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-hama-gold/20 blur-3xl rounded-full" />
                            <img src="/hama_logo.png" alt="HAMA Academy" className="w-20 h-20 object-contain mx-auto relative z-10 drop-shadow-[0_0_20px_rgba(242,201,76,0.3)]" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-text-primary uppercase tracking-[0.3em] font-sans">Create Account</h1>
                            <p className="text-xs text-text-muted font-bold uppercase tracking-[0.4em]">Become a member of HAMA.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => signInWithGoogle()}
                            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest group"
                        >
                            <Globe className="text-hama-gold group-hover:rotate-12 transition-transform" size={18} />
                            Continue with Google
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black text-text-muted">
                                <span className="bg-bg-primary px-4">Or use email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-text-muted uppercase tracking-[0.3em] ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-hama-gold transition-colors" size={18} />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-hama-gold outline-none text-text-primary transition-all text-sm font-medium"
                                            placeholder="Ahmed Moussa"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-text-muted uppercase tracking-[0.3em] ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-hama-gold transition-colors" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-hama-gold outline-none text-text-primary transition-all text-sm font-medium"
                                            placeholder="artist@hama.academy"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-text-muted uppercase tracking-[0.3em] ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-hama-gold transition-colors" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-hama-gold outline-none text-text-primary transition-all text-sm font-medium"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-hama-gold transition-all"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest rounded-2xl">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-5 bg-hama-gold text-white font-black text-xs uppercase tracking-[0.4em] rounded-2xl shadow-xl shadow-hama-gold/10 hover:shadow-hama-gold/40 hover:bg-[#FADC7A] hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 group relative overflow-hidden pulse-glow"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <span className="relative z-10 flex items-center gap-3">
                                        Join Academy
                                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
                                    </span>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-xs text-text-muted font-bold tracking-widest uppercase mt-8">
                            Already a member?{' '}
                            <Link to="/login" className="text-hama-gold hover:underline transition-all">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
