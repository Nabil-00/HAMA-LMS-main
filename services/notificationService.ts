import { supabase } from '../supabaseClient';
import { Notification } from '../types';

export const getNotifications = async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }

    if (!data) return [];

    return (data as any[]).map(n => ({
        id: n.id,
        userId: n.user_id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.is_read,
        link: n.link,
        createdAt: n.created_at
    })) as Notification[];
};

export const markAsRead = async (notificationId: string): Promise<void> => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    if (error) throw error;
};

export const markAllAsRead = async (userId: string): Promise<void> => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) throw error;
};

export const subscribeToNotifications = (userId: string, onNewNotification: (notification: Notification) => void) => {
    return supabase
        .channel(`public:notifications:user_id=eq.${userId}`)
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
            (payload: any) => {
                const n = payload.new as any;
                onNewNotification({
                    id: n.id,
                    userId: n.user_id,
                    title: n.title,
                    message: n.message,
                    type: n.type,
                    isRead: n.is_read,
                    link: n.link,
                    createdAt: n.created_at
                });
            }
        )
        .subscribe();
};

export const createNotification = async (notification: Partial<Notification>): Promise<void> => {
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: notification.userId,
            title: notification.title,
            message: notification.message,
            type: notification.type || 'Info',
            link: notification.link,
            is_read: false
        });

    if (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};
