import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../store/notification.store';
import { useAuthStore } from '@/auth/store/auth.store';

/**
 * Hook para usar notificaciones con Socket.IO
 * Se conecta automáticamente cuando el usuario está autenticado
 */
export const useNotifications = () => {
  const {
    notifications,
    unreadCount,
    connected,
    connectionError,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification,
    removeNotification,
  } = useNotificationStore();

  const { isAuthenticated } = useAuthStore();
  const hasConnectedRef = useRef(false);

  // Conectar cuando el usuario esté autenticado
  useEffect(() => {
    // Solo conectar si está autenticado y no se ha conectado antes
    if (isAuthenticated && !hasConnectedRef.current) {
      connect();
      hasConnectedRef.current = true;
    } else if (!isAuthenticated) {
      // Si se desautentica, desconectar
      if (hasConnectedRef.current) {
        disconnect();
        hasConnectedRef.current = false;
      }
    }

    // Cleanup al desmontar
    return () => {
      // Solo desconectar si el componente se desmonta y el usuario ya no está autenticado
      if (!isAuthenticated && hasConnectedRef.current) {
        disconnect();
        hasConnectedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Solo depender de isAuthenticated para evitar reconexiones innecesarias

  return {
    notifications,
    unreadCount,
    connected,
    connectionError,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification, // Para notificaciones manuales si es necesario
    removeNotification,
  };
};









