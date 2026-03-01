import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  Moon,
  Sun,
  ShieldAlert,
  Users
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, allowedRoles: ['Admin', 'Teacher', 'Student'] },
    { name: 'Catalog', path: '/courses', icon: BookOpen, allowedRoles: ['Admin', 'Teacher', 'Student'] },
    { name: 'Course Studio', path: '/create', icon: PenTool, allowedRoles: ['Admin', 'Teacher'] },
    { name: 'Users', path: '/users', icon: Users, allowedRoles: ['Admin'] },
    { name: 'Reports', path: '/analytics', icon: BarChart3, allowedRoles: ['Admin', 'Teacher'] },
    { name: 'Settings', path: '/settings', icon: Settings, allowedRoles: ['Admin'] },
  ];

  const searchInputClass = "w-64 pl-10 pr-4 py-2 text-sm bg-white/5 border border-hama-gold/10 rounded-full focus:outline-none focus:border-hama-gold transition-all text-text-primary placeholder-text-muted";

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden selection:bg-hama-gold selection:text-black">
      {/* Visual background layers */}
      <div className="noise" />
      <div className="aura" style={{ top: '-10%', right: '-10%' }} />
      <div className="aura" style={{ bottom: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(242, 201, 76, 0.05) 0%, transparent 70%)' }} />

      {/* Sidebar - Desktop & Mobile overlay */}
      <>
        {/* Backdrop for mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside className={`
          fixed md:relative inset-y-0 left-0 w-72 flex flex-col glass border-r border-hama-gold/10 z-50 transition-transform duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:flex
        `}>
          <div className="p-8 mb-4">
            <div className="flex items-center gap-4 group">
              <img src="/hama_logo.png" alt="HAMA Academy" className="w-14 h-14 object-contain shadow-2xl rounded-xl" />
              <div>
                <h1 className="text-[14px] font-black text-text-primary uppercase tracking-[0.2em] font-sans">HAMA Academy</h1>
                <p className="text-[9px] text-hama-gold/60 font-bold uppercase tracking-[0.2em] mt-0.5">Student Portal</p>
              </div>
            </div>
          </div>

          {/* User Profile Badge */}
          <div className="px-6 py-8">
            <div className="flex items-center gap-4 p-4 bento-card border-hama-gold/10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${user?.role === 'Admin' ? 'bg-hama-gold text-black' :
                user?.role === 'Teacher' ? 'bg-white/10 text-text-primary' :
                  'bg-white/5 text-text-secondary'
                }`}>
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate serif text-text-primary">{user?.name || (user?.email?.split('@')[0])}</p>
                <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-black">{user?.role === 'Teacher' ? 'Instructor' : user?.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 space-y-1.5">
            {navItems.filter(item => hasRole(item.allowedRoles)).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${isActive
                    ? 'bg-hama-gold text-black shadow-lg shadow-hama-gold/10'
                    : 'text-text-secondary hover:bg-white/5 hover:text-hama-gold'
                    }`}
                >
                  <Icon size={16} className={isActive ? 'text-black' : 'text-hama-gold'} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-6 border-t border-white/5 mt-auto">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-4 px-4 py-3 w-full text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted hover:text-text-primary transition-colors"
            >
              <LogOut size={18} className="text-white/20" />
              Sign Out
            </button>
          </div>
        </aside>
      </>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-8 h-16 md:h-24 glass border-b border-hama-gold/10 shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              className="md:hidden p-2 text-hama-gold bg-hama-gold/5 rounded-xl border border-hama-gold/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input
                type="text"
                placeholder="Search Courses..."
                className={searchInputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {user?.role === 'Admin' && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-hama-gold/10 text-hama-gold border border-hama-gold/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                <ShieldAlert size={14} /> Production Mode
              </div>
            )}

            <NotificationCenter />
          </div>
        </header>

        {/* Scrollable Content */}
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