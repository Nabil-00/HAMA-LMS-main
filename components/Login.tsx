import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from './icons/HamaUIIcons';
import { useToast } from './Toast';
import { useAuth } from '../contexts/AuthContext';
import BrandLogo from './ui/BrandLogo';
import { HamaCertificateIcon, HamaUserIcon } from './icons';

const Login = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const { addToast } = useToast();
   const { user, isAuthenticated, login } = useAuth();

   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState('');

   React.useEffect(() => {
      if (isAuthenticated && !isLoading) {
         const params = new URLSearchParams(location.search);
         const hashQuery = window.location.hash.includes('?')
            ? window.location.hash.slice(window.location.hash.indexOf('?') + 1)
            : window.location.hash.replace('#', '');
         const hashParams = new URLSearchParams(hashQuery);
         const redirectTo = params.get('redirect') || hashParams.get('redirect');

         if (redirectTo && redirectTo.startsWith('/')) {
            navigate(redirectTo, { replace: true });
         } else {
            navigate('/dashboard', { replace: true });
         }
      }
   }, [isAuthenticated, navigate, isLoading, location.search]);

   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      try {
         await login(email, password);
         addToast('Barka da zuwa', 'success');
      } catch (e: any) {
         setError('An ki ba da izini. Tabbatar da bayananka.');
         setIsLoading(false);
      }
   };

   const itemVariants = {
      hidden: { opacity: 0, y: 30, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
   };

   return (
      <div
         className="min-h-screen w-full flex text-[#F5F5DC] selection:bg-[#D4AF37] selection:text-[#1A1A1A] overflow-hidden relative"
         style={{ background: 'linear-gradient(160deg, #1c1a0f 0%, #0e0d08 50%, #0a0a08 100%)' }}
      >
         <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
            style={{ zIndex: 0 }}
         >
            <div
               style={{
                  position: 'absolute',
                  width: '420px',
                  height: '420px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(212,175,55,0.13) 0%, rgba(212,175,55,0.04) 50%, transparent 80%)',
               }}
            />
            <img
               src="/hamonogram.png"
               alt=""
               style={{
                  width: '320px',
                  height: '320px',
                  objectFit: 'contain',
                  opacity: 0.1,
                  filter: 'grayscale(30%) sepia(60%) hue-rotate(5deg) brightness(1.4)',
                  userSelect: 'none',
               }}
            />
         </div>

         <div className="relative z-10 w-full flex">
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
            <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/20 via-[#1A1A1A]/60 to-[#1A1A1A]" />
            <div className="absolute inset-0 bg-[#046307]/20 mix-blend-overlay" />

            <div className="relative z-10 max-w-xl">
               <motion.div variants={itemVariants} className="flex items-center justify-center gap-6 mb-12">
                  <div className="h-[1px] w-12 bg-[#D4AF37]/50"></div>
                   <span className="text-[#D4AF37] font-black tracking-[0.8em] text-[11px] uppercase">
                      HAMA Academy
                   </span>
                  <div className="h-[1px] w-12 bg-[#D4AF37]/50"></div>
               </motion.div>

                <motion.h1 variants={itemVariants} className="text-6xl font-black text-[#F5F5DC] mb-8 tracking-tight leading-tight serif text-center">
                   Shiga cikin <br />
                   <span className="bg-gradient-to-r from-[#D4AF37] via-[#F5F5DC] to-[#D4AF37] bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer-fast">
                      Gida
                   </span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-xl text-[#F5F5DC]/60 max-w-lg mx-auto leading-[1.3]">
                   Koyi yin kiɗa daga malaman kiɗa na Arewa.
                </motion.p>

                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-8 mt-16">
                  <div className="flex items-center gap-4 text-[#666666]">
                      <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                         <HamaCertificateIcon size={20} variant="gold" aria-hidden />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Tabbatacce</span>
                   </div>
                   <div className="flex items-center gap-4 text-[#666666]">
                      <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                         <HamaUserIcon size={20} variant="gold" aria-hidden />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Duniya</span>
                   </div>
                </motion.div>
            </div>
         </motion.div>

         {/* Right Side - Login Form */}
         <motion.div 
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative z-20"
         >
            <div className="w-full max-w-md space-y-12">
               <div className="text-center space-y-8">
                  <div className="flex flex-col items-center mb-6">
                     <BrandLogo
                        variant="icon"
                        size="lg"
                        clickable
                        href="/"
                        alt="HAMA Monogram"
                        className="brightness-150 contrast-110"
                     />
                  </div>
                  
                    <div className="space-y-3">
                       <h1 className="text-3xl font-black text-[#D4AF37] uppercase tracking-[0.24em]">HAMA Academy</h1>
                       <p className="text-xs text-[#A0A0A0] font-black uppercase tracking-[0.35em] max-w-[280px] mx-auto">
                          Login
                       </p>
                    </div>
               </div>

               <form onSubmit={handleLogin} className="space-y-8">
                  <div className="space-y-6">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-[#666666] uppercase tracking-[0.3em] ml-1">Email</label>
                         <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37]/40 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                            <input
                               type="email"
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               className="w-full pl-14 pr-6 py-5 bg-[#F5F5DC]/5 border border-[#D4AF37]/10 rounded-2xl focus:border-[#D4AF37] outline-none text-[#F5F5DC] transition-all placeholder:text-[#666666]/30 text-sm font-medium"
                               placeholder="artist@hama.com"
                               required
                            />
                         </div>
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-[#666666] uppercase tracking-[0.3em] ml-1">Password</label>
                        <div className="relative group">
                           <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37]/40 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                           <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-14 pr-20 py-5 bg-[#F5F5DC]/5 border border-[#D4AF37]/10 rounded-2xl focus:border-[#D4AF37] outline-none text-[#F5F5DC] transition-all placeholder:text-[#666666]/30 text-sm font-medium"
                              placeholder="••••••••"
                              required
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
                            Shiga
                            <ArrowRight size={18} />
                         </>
                      )}
                  </motion.button>
               </form>

                <div className="pt-6">
                   <Link 
                      to="/signup"
                      className="block w-full py-5 text-center border border-[#D4AF37]/20 text-[#D4AF37] rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#D4AF37]/10 transition-all"
                   >
                      Yi Rijista
                   </Link>
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
      </div>
   );
};

export default Login;
