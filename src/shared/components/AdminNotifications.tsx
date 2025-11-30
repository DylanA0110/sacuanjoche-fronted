import React, { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationCenter } from './NotificationCenter';
import { toast } from 'sonner';
import type { Notification } from '../store/notification.store';

export const AdminNotifications: React.FC = () => {
  const {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  // Escuchar nuevas notificaciones para mostrar toast
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent<Notification>) => {
      const notification = event.detail;
      
      toast.info(notification.title, {
        description: notification.message,
        duration: 5000,
        action: notification.link
          ? {
              label: 'Ver',
              onClick: () => {
                if (notification.link) {
                  window.location.href = notification.link;
                }
              },
            }
          : undefined,
      });
    };

    window.addEventListener('newNotification', handleNewNotification as EventListener);
    
    return () => {
      window.removeEventListener('newNotification', handleNewNotification as EventListener);
    };
  }, []);

  return (
    <NotificationCenter
      notifications={notifications}
      unreadCount={unreadCount}
      connected={connected}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onRemoveNotification={removeNotification}
    />
  );
};

