import React from 'react';
import { IoNotificationsOutline, IoCheckmarkDone, IoClose } from 'react-icons/io5';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Separator } from '@/shared/components/ui/separator';
import { cn } from '@/shared/lib/utils';
import { useNavigate } from 'react-router';
import type { Notification, NotificationType } from '../store/notification.store';
import { toast } from 'sonner';

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  connected: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemoveNotification?: (id: string) => void;
}

const notificationIcons: Record<NotificationType, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

const notificationColors: Record<NotificationType, string> = {
  info: 'bg-blue-50 border-blue-200',
  success: 'bg-green-50 border-green-200',
  warning: 'bg-amber-50 border-amber-200',
  error: 'bg-red-50 border-red-200',
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'ahora';
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  unreadCount,
  connected,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemoveNotification,
}) => {
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 rounded-full p-0 hover:bg-gray-100"
        >
          <IoNotificationsOutline className="h-4 w-4 text-gray-700" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-red-500 text-white border-0">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          {!connected && (
            <span
              className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-500 rounded-full border border-white"
              title="Desconectado"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[85vw] max-w-[20rem] sm:w-80 p-0"
        align="end"
        sideOffset={12}
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-gray-100 text-gray-700 border-gray-200">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="h-7 text-[11px] px-2"
            >
              <IoCheckmarkDone className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        <div className="h-[240px] sm:h-[320px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <IoNotificationsOutline className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-xs text-gray-500">
                No tienes notificaciones
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-2.5 transition-colors hover:bg-gray-50 group relative',
                    !notification.read && 'bg-blue-50/50',
                    notification.link && 'cursor-pointer'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-2.5">
                    <div
                      className={cn(
                        'shrink-0 h-7 w-7 rounded-full flex items-center justify-center border text-base',
                        notificationColors[notification.type]
                      )}
                    >
                      {notificationIcons[notification.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5 mb-0.5">
                        <p
                          className={cn(
                            'text-xs font-medium line-clamp-1',
                            !notification.read && 'text-gray-900 font-semibold'
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-1.5 w-1.5 rounded-full bg-[#50C878] shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 line-clamp-2 mb-1">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                    {onRemoveNotification && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveNotification(notification.id);
                        }}
                      >
                        <IoClose className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-[11px] h-7"
                onClick={() => {
                  navigate('/admin/pedidos');
                }}
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}

        {!connected && (
          <>
            <Separator />
            <div className="p-2 bg-yellow-50">
              <p className="text-xs text-yellow-700 text-center">
                Desconectado del servidor
              </p>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

