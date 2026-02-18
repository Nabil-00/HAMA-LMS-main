import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck, Globe, UserCog, GraduationCap, School } from 'lucide-react';
import { useToast } from './Toast';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const Login = () => {
   const navigate = useNavigate();
   const { addToast } = useToast();
   const { login } = useAuth();

   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState('');



   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      try {
         await login(email, password);
         addToast('Protocol Synchronized: Access Granted', 'success');
         navigate('/');
      } catch (e: any) {
         setError('Authentication failed. Check your studio credentials.');
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen w-full flex bg-bg-primary text-text-primary selection:bg-hama-gold selection:text-black relative overflow-hidden">
         {/* Visual background layers */}
         <div className="noise" />
         <div className="aura" style={{ top: '-10%', right: '-10%' }} />
         <div className="aura" style={{ bottom: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(242, 201, 76, 0.05) 0%, transparent 70%)' }} />

         {/* Left Side - Visual / Brand Heritage */}
         <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-20 border-r border-hama-gold/10">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 grayscale"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-primary/95 to-hama-gold/5"></div>

            <div className="relative z-10 max-w-xl">

               <h1 className="text-6xl font-bold text-text-primary mb-8 tracking-tight leading-tight serif">
                  Master the <span className="text-hama-gold">Modern Art</span> of Hausa Music.
               </h1>
               <p className="text-text-secondary text-xl leading-relaxed mb-12 font-light">
                  Professional-grade training in songwriting, production, and mastery from Nigeria's top artists.
               </p>

               <div className="grid grid-cols-2 gap-8">
                  <div className="flex items-center gap-4 text-text-muted">
                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                        <ShieldCheck className="text-hama-gold" size={20} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Verified Academy</span>
                  </div>
                  <div className="flex items-center gap-4 text-text-muted">
                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                        <Globe className="text-hama-gold" size={20} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Industry Standard</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Side - Login Form */}
         <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative z-20">
            <div className="w-full max-w-md space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
               <div className="text-center space-y-8">
                  <div className="relative inline-block">
                     <div className="absolute inset-0 bg-hama-gold/20 blur-3xl rounded-full" />
                     <img src="/hama_logo.png" alt="HAMA Academy" className="w-40 h-40 object-contain mx-auto relative z-10 drop-shadow-[0_0_30px_rgba(242,201,76,0.3)] animate-pulse duration-[4000ms]" />
                  </div>
                  <div className="space-y-3">
                     <h1 className="text-3xl font-black text-text-primary uppercase tracking-[0.3em] font-sans">Access Portal</h1>
                     <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.4em] max-w-[280px] mx-auto leading-relaxed">
                        Connect your consciousness to the HAMA curriculum.
                     </p>
                  </div>
               </div>

               <form onSubmit={handleLogin} className="space-y-8">



                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-1">Email Address</label>
                        <div className="relative group">
                           <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-hama-gold transition-colors" size={18} />
                           <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-hama-gold outline-none text-text-primary transition-all placeholder:text-white/10 text-sm font-medium"
                              placeholder="artist@hama.academy"
                              required
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                           <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Studio Password</label>
                        </div>
                        <div className="relative group">
                           <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-hama-gold transition-colors" size={18} />
                           <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-12 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-hama-gold outline-none text-text-primary transition-all placeholder:text-white/10 text-sm font-medium"
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
                     <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={16} />
                        {error}
                     </div>
                  )}

                  <button
                     type="submit"
                     disabled={isLoading}
                     className="w-full py-5 bg-hama-gold text-white font-black text-xs uppercase tracking-[0.4em] rounded-2xl shadow-xl shadow-hama-gold/10 hover:shadow-hama-gold/40 hover:bg-[#FADC7A] hover:text-black hover:scale-[1.01] transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                     {isLoading ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                     ) : (
                        <span className="relative z-10 flex items-center gap-3">
                           Sign In
                           <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
                        </span>
                     )}
                  </button>
               </form>
            </div>
         </div>
      </div>
   );
};

export default Login;