import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  PenTool,
  BarChart3,
  Settings,
  Bell,
  Search,
  LogOut,
  Menu,
  ShieldAlert,
  Users,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import NotificationCenter from './NotificationCenter';
import { useToast } from './Toast';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  allowedRoles: UserRole[];
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();
  const { addToast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, allowedRoles: ['Admin', 'Teacher', 'Student'] },
    { name: 'Courses', path: '/courses', icon: BookOpen, allowedRoles: ['Admin', 'Teacher', 'Student'] },
    { name: 'Course Studio', path: '/create', icon: PenTool, allowedRoles: ['Admin', 'Teacher'] },
    { name: 'Users', path: '/users', icon: Users, allowedRoles: ['Admin'] },
    { name: 'Reports', path: '/analytics', icon: BarChart3, allowedRoles: ['Admin', 'Teacher'] },
    { name: 'Settings', path: '/settings', icon: Settings, allowedRoles: ['Admin'] },
  ];

  const searchInputClass = "w-64 pl-10 pr-4 py-2 text-sm bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-full focus:outline-none focus:border-[#D4AF37] transition-all text-[#F5F5DC] placeholder-[#666666]";

  return (
    <div className="flex h-screen bg-[#1A1A1A] text-[#F5F5DC] overflow-hidden selection:bg-[#D4AF37] selection:text-[#1A1A1A]">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#046307] via-[#D4AF37] to-[#046307] z-[100] origin-left shadow-[0_0_15px_rgba(4,99,7,0.5)]"
        style={{ scaleX }}
      />

      {/* Background Effects */}
      <div className="noise" />
      <motion.div
        animate={{ scale: [1, 1.4, 1], rotate: [0, 90, 0], x: [0, 50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] -left-32 w-[30rem] h-[30rem] bg-[#046307] blur-[180px] rounded-full opacity-20 pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, -45, 0], y: [0, 100, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[20%] -right-32 w-[35rem] h-[35rem] bg-[#D4AF37] blur-[200px] rounded-full opacity-10 pointer-events-none"
      />

      {/* Sidebar */}
      <>
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside className={`
          fixed md:relative inset-y-0 left-0 w-72 flex flex-col z-50 transition-transform duration-300 border-r border-[#D4AF37]/10
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:flex
        `}
        style={{ backgroundColor: 'rgba(26, 26, 26, 0.95)', backdropFilter: 'blur(24px)' }}
        >
          <div className="p-8 mb-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-4 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#D4AF37] flex items-center justify-center shadow-[0_20px_60px_rgba(212,175,55,0.4)]">
                <span className="font-black text-2xl text-[#1A1A1A] tracking-tighter">H</span>
              </div>
              <div>
                <h1 className="text-[14px] font-black text-[#F5F5DC] uppercase tracking-[0.2em] font-sans">HAMA</h1>
                <p className="text-[9px] text-[#D4AF37]/60 font-bold uppercase tracking-[0.2em] mt-0.5">Student Portal</p>
              </div>
            </motion.div>
          </div>

          {/* User Badge */}
          <div className="px-6 py-8">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4 p-4 rounded-2xl border border-[#D4AF37]/10 transition-all"
              style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)' }}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${user?.role === 'Admin' ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'bg-[#F5F5DC]/5 text-[#F5F5DC]'}`}>
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-[#F5F5DC]">{user?.name || (user?.email?.split('@')[0])}</p>
                <p className="text-[9px] text-[#666666] uppercase tracking-[0.2em] font-black">{user?.role}</p>
              </div>
              <ChevronRight size={16} className="text-[#D4AF37]/40" />
            </motion.div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 space-y-2">
            {navItems.filter(item => hasRole(item.allowedRoles)).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <motion.div
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive
                      ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-[0_20px_60px_rgba(212,175,55,0.4)]'
                      : 'text-[#A0A0A0] hover:bg-[#D4AF37]/5 hover:text-[#D4AF37]'
                      }`}
                  >
                    <Icon size={16} className={isActive ? 'text-[#1A1A1A]' : 'text-[#D4AF37]'} />
                    {item.name}
                  </motion.div>
                </NavLink>
              );
            })}
          </nav>

          <div className="p-6 border-t border-[#D4AF37]/10 mt-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-4 px-4 py-3 w-full text-[10px] font-black uppercase tracking-[0.2em] text-[#666666] hover:text-[#D4AF37] transition-colors"
            >
              <LogOut size={18} className="text-[#D4AF37]/40" />
              Sign Out
            </motion.button>
          </div>
        </aside>
      </>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header 
          className="flex items-center justify-between px-4 md:px-8 h-16 md:h-24 shrink-0 border-b border-[#D4AF37]/10"
          style={{ backgroundColor: 'rgba(26, 26, 26, 0.8)', backdropFilter: 'blur(24px)' }}
        >
          <div className="flex items-center gap-2 md:gap-4">
            <button
              className="md:hidden p-2 text-[#D4AF37] rounded-xl border border-[#D4AF37]/20"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/40" size={16} />
              <input
                type="text"
                placeholder="Bincika Darussa..."
                className={searchInputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {user?.role === 'Admin' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-[#046307]/20 text-[#046307] border border-[#046307]/30 rounded-full text-[9px] font-black uppercase tracking-widest"
              >
                <ShieldAlert size={14} /> Production Mode
              </motion.div>
            )}
            <NotificationCenter />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-12 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
