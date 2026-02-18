import React from 'react';
import { Bell, Check, Trash2, Info, AlertTriangle, MessageSquare, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification, NotificationType } from '../types';

interface NotificationDropdownProps {
    notifications: Notification[];
    onMarkRead: (id: string) => void;
    onMarkAllRead: () => void;
    onClose: () => void;
}

const getIcon = (type: NotificationType) => {
    switch (type) {
        case 'Alert': return <AlertTriangle size={16} className="text-red-500" />;
        case 'Success': return <CheckCircle2 size={16} className="text-hama-success" />;
        case 'Message': return <MessageSquare size={16} className="text-blue-400" />;
        case 'Warning': return <AlertTriangle size={16} className="text-hama-gold" />;
        default: return <Info size={16} className="text-hama-gold" />;
    }
};

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
    notifications,
    onMarkRead,
    onMarkAllRead,
    onClose
}) => {
    return (
        <div className="absolute top-16 right-0 w-96 glass-elevated rounded-3xl border border-hama-gold/20 shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden backdrop-blur-3xl bg-bg-primary/90">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold serif text-text-primary">Intelligence</h3>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">Live Notifications</p>
                </div>
                <button
                    onClick={onMarkAllRead}
                    className="p-2 hover:bg-white/5 rounded-xl text-hama-gold/60 hover:text-hama-gold transition-all"
                    title="Mark all as read"
                >
                    <Check size={18} />
                </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <Bell size={20} className="text-white/20" />
                        </div>
                        <p className="text-sm text-text-muted font-medium italic">No new signals detected.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => !n.isRead && onMarkRead(n.id)}
                                className={`p-5 flex gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer relative group ${!n.isRead ? 'bg-hama-gold/[0.02]' : ''}`}
                            >
                                {!n.isRead && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-hama-gold rounded-r-full" />
                                )}

                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${!n.isRead ? 'bg-hama-gold/10 border-hama-gold/20' : 'bg-white/5 border-white/5'}`}>
                                    {getIcon(n.type)}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`text-sm font-bold ${!n.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>{n.title}</h4>
                                        <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest leading-none mt-1">
                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">{n.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-4 border-t border-white/5 bg-white/2 text-center">
                    <button
                        onClick={onClose}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-hama-gold transition-colors"
                    >
                        Acknowledge & Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
