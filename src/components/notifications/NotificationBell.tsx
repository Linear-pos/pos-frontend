import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AppNotification } from '../../features/notifications/api/notification.api';
import { notificationAPI } from '../../features/notifications/api/notification.api';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    const user = useAuthStore((state) => state.user);

    const fetchNotifications = async () => {
        try {
            const data = await notificationAPI.getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        if (!user?.id) return;
        
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');
        socket.emit('subscribe:notifications', user.id);
        
        socket.on('notification:new', (notification: AppNotification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            socket.disconnect();
        };
    }, [user?.id]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleNotificationClick = (notification: AppNotification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-2">
                    <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button variant="ghost" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary" onClick={handleMarkAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="px-8 py-24 text-center text-sm text-muted-foreground">
                        You're all caught up!
                    </div>
                ) : (
                    <div className="flex flex-col gap-1 p-1">
                        {notifications.map((notification) => (
                            <DropdownMenuItem 
                                key={notification.id}
                                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.isRead ? 'bg-muted/50' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="font-medium text-sm">{notification.title}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
