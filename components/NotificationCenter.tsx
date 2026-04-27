import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, X, MessageSquare, Info, AlertTriangle, CheckCircle2, Link as LinkIcon, ExternalLink } from './icons/HamaUIIcons';
import { useAuth } from '../contexts/AuthContext';
import { Notification } from '../types';
import { getNotifications, markAsRead, markAllAsRead, subscribeToNotifications } from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter: React.FC = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        // Initial fetch
        const fetchNotifications = async () => {
            const data = await getNotifications(user.id);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        };

        fetchNotifications();

        // Real-time subscription
        const subscription = subscribeToNotifications(user.id, (newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user || unreadCount === 0) return;
        try {
            await markAllAsRead(user.id);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Success': return <CheckCircle2 className="text-emerald-400" size={16} />;
            case 'Warning': return <AlertTriangle className="text-hama-gold" size={16} />;
            case 'Alert': return <X className="text-red-400" size={16} />;
            case 'Message': return <MessageSquare className="text-indigo-400" size={16} />;
            default: return <Info className="text-text-muted" size={16} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 rounded-2xl border transition-all relative group ${isOpen
                    ? 'bg-white/10 border-white/20 text-text-primary'
                    : 'bg-white/5 border-white/5 text-text-muted hover:text-text-primary hover:border-white/10'
                    }`}
            >
                <Bell size={20} className={unreadCount > 0 ? 'animate-pulse' : ''} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-hama-gold text-black text-[9px] font-black flex items-center justify-center rounded-full border-2 border-bg-primary">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="fixed sm:absolute right-4 sm:right-0 left-4 sm:left-auto mt-4 w-auto sm:w-96 bg-bg-primary/80 sm:bg-bg-primary/60 backdrop-blur-2xl border border-hama-gold/10 rounded-3xl shadow-2xl z-[200] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="noise opacity-10" />
                    <div className="relative z-10">
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-primary">Intelligence</h3>
                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1">
                                    {unreadCount} Unread Notifications
                                </p>
                            </div>
                            <button
                                onClick={handleMarkAllAsRead}
                                className="p-2 text-text-muted hover:text-hama-gold transition-all"
                                title="Mark all as read"
                            >
                                <CheckCheck size={18} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-20 text-center opacity-20">
                                    <Bell size={48} className="mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest italic">Curriculum update log empty.</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                                        className={`p-5 md:p-6 border-b border-white/5 transition-all cursor-pointer group ${n.isRead ? 'opacity-50 hover:opacity-100' : 'bg-hama-gold/5'
                                            }`}
                                    >
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                                                {getIcon(n.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2 mb-1">
                                                    <h4 className="text-[11px] font-black text-text-primary uppercase tracking-tight truncate">
                                                        {n.title}
                                                    </h4>
                                                    <span className="text-[9px] font-bold text-text-muted whitespace-nowrap">
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">
                                                    {n.message}
                                                </p>
                                                {n.link && (
                                                    <a
                                                        href={n.link}
                                                        className="inline-flex items-center gap-2 mt-3 text-[10px] font-black text-hama-gold uppercase tracking-widest hover:text-text-primary transition-colors"
                                                    >
                                                        <ExternalLink size={12} />
                                                        View Protocol
                                                    </a>
                                                )}
                                            </div>
                                            {!n.isRead && (
                                                <div className="w-2 h-2 rounded-full bg-hama-gold mt-2 flex-shrink-0 shadow-[0_0_10px_rgba(242,201,76,0.5)]" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white/5 text-center">
                            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-text-primary transition-colors">
                                Archive Ledger
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
