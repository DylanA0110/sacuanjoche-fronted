import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/socket.config';
import { useAuthStore } from '@/auth/store/auth.store';
import type { AdminNotificationPayload } from '../types/notifications';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  originalPayload?: AdminNotificationPayload; // Guardar payload original
}

interface NotificationState {
  // Estado del socket
  socket: Socket | null;
  connected: boolean;
  socketId: string | null;
  connectionError: string | null;

  // Notificaciones
  notifications: Notification[];
  unreadCount: number;

  // Acciones del socket
  connect: () => void;
  disconnect: () => void;

  // Acciones de notificaciones
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
}

// Mapear tipos del backend a tipos del frontend
const mapNotificationType = (tipo: AdminNotificationPayload['tipo']): NotificationType => {
  switch (tipo) {
    case 'nuevo_pedido_web':
      return 'success';
    default:
      return 'info';
  }
};

// Mapear tipos del backend a títulos y mensajes
const mapNotificationContent = (
  tipo: AdminNotificationPayload['tipo'],
  idRegistro: number | string,
  data: AdminNotificationPayload['data'],
  nombreCliente?: string
): { title: string; message: string; link?: string } => {
  const cliente = nombreCliente || 'Cliente';

  switch (tipo) {
    case 'nuevo_pedido_web':
      return {
        title: 'Nuevo Pedido Web',
        message: `Se ha recibido un nuevo pedido web${data?.numeroPedido ? ` #${data.numeroPedido}` : ''}${nombreCliente ? ` de ${cliente}` : ''}`,
        link: idRegistro ? `/admin/pedidos` : '/admin/pedidos',
      };
    default:
      return {
        title: 'Nueva Notificación',
        message: 'Tienes una nueva notificación',
      };
  }
};

// Clave para localStorage
const NOTIFICATIONS_STORAGE_KEY = 'sacuanjoche_notifications';

// Cargar notificaciones desde localStorage
const loadNotificationsFromStorage = (): Notification[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // Convertir timestamps de string a Date
    return parsed.map((n: any) => ({
      ...n,
      timestamp: new Date(n.timestamp),
    }));
  } catch (error) {
    return [];
  }
};

// Guardar notificaciones en localStorage
const saveNotificationsToStorage = (notifications: Notification[]) => {
  try {
    localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(notifications)
    );
  } catch (error) {
    // Error al guardar en localStorage - continuar de todas formas
  }
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => {
      let socketInstance: Socket | null = null;
      let audioInstance: HTMLAudioElement | null = null;

      // Cargar notificaciones iniciales desde localStorage
      const initialNotifications = loadNotificationsFromStorage();
      const initialUnreadCount = initialNotifications.filter((n) => !n.read).length;

      // Inicializar audio para sonido de notificación
      const initAudio = () => {
        if (!audioInstance && typeof window !== 'undefined') {
          try {
            audioInstance = new Audio('/sounds/notification.mp3');
            audioInstance.volume = 0.5;
            audioInstance.loop = false;
            // Pre-cargar el audio
            audioInstance.load();
          } catch (error) {
            // Si no existe el archivo, no hacer nada
          }
        }
        return audioInstance;
      };

      // Reproducir el sonido de notificación
      const playNotificationSound = () => {
        try {
          const audio = initAudio();
          if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
              // Si falla, simplemente no reproducir nada
            });
          }
        } catch (error) {
          // Si hay un error, no reproducir nada
        }
      };

      return {
        // Estado inicial (cargado desde localStorage)
        socket: null,
        connected: false,
        socketId: null,
        connectionError: null,
        notifications: initialNotifications,
        unreadCount: initialUnreadCount,

        // Conectar socket
        connect: () => {
          // Si ya hay una conexión, no crear otra
          if (socketInstance?.connected) {
            return;
          }

          // Si hay una instancia desconectada, limpiarla
          if (socketInstance) {
            socketInstance.disconnect();
            socketInstance.removeAllListeners();
          }

          // Obtener token del auth store
          const token = localStorage.getItem('token');

          // Crear nueva conexión
          const socket = io(SOCKET_URL, {
            auth: token ? { token } : undefined,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
            timeout: 20000,
          });

          socketInstance = socket;

          // Event listeners
          socket.on('connect', () => {
            set({
              connected: true,
              socketId: socket.id ?? null,
              connectionError: null,
              socket: socket,
            });
          });

          socket.on('disconnect', () => {
            set({
              connected: false,
              socketId: null,
            });
          });

          socket.on('connect_error', (error) => {
            const errorMessage = error?.message ?? String(error);
            set({ connectionError: errorMessage, connected: false });
          });

          // Escuchar notificaciones del admin (namespace /admin)
          socket.on('adminNotification', (payload: AdminNotificationPayload) => {
            const { title, message, link } = mapNotificationContent(
              payload.tipo,
              payload.id_registro,
              payload.data,
              payload.nombre_cliente
            );

            get().addNotification({
              type: mapNotificationType(payload.tipo),
              title,
              message,
              link,
              originalPayload: payload,
            });
          });

          set({ socket });
        },

        // Desconectar socket
        disconnect: () => {
          if (socketInstance) {
            socketInstance.disconnect();
            socketInstance.removeAllListeners();
            socketInstance = null;
          }
          set({
            socket: null,
            connected: false,
            socketId: null,
            connectionError: null,
          });
        },

        // Agregar notificación
        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: `notification-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            read: false,
          };

          set((state) => {
            const updated = [newNotification, ...state.notifications].slice(0, 50); // Mantener solo las últimas 50
            // Guardar en localStorage
            saveNotificationsToStorage(updated);
            return {
              notifications: updated,
              unreadCount: updated.filter((n) => !n.read).length,
            };
          });

          // Reproducir sonido
          playNotificationSound();

          // Emitir evento personalizado para toast
          window.dispatchEvent(new CustomEvent('newNotification', { detail: newNotification }));
        },

        // Marcar como leída
        markAsRead: (id) => {
          set((state) => {
            const updated = state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            );
            // Guardar en localStorage
            saveNotificationsToStorage(updated);
            return {
              notifications: updated,
              unreadCount: updated.filter((n) => !n.read).length,
            };
          });
        },

        // Marcar todas como leídas
        markAllAsRead: () => {
          set((state) => {
            const updated = state.notifications.map((n) => ({ ...n, read: true }));
            // Guardar en localStorage
            saveNotificationsToStorage(updated);
            return {
              notifications: updated,
              unreadCount: 0,
            };
          });
        },

        // Limpiar todas
        clearAll: () => {
          const empty: Notification[] = [];
          // Limpiar localStorage
          saveNotificationsToStorage(empty);
          set({
            notifications: empty,
            unreadCount: 0,
          });
        },

        // Eliminar notificación
        removeNotification: (id) => {
          set((state) => {
            const updated = state.notifications.filter((n) => n.id !== id);
            // Guardar en localStorage
            saveNotificationsToStorage(updated);
            return {
              notifications: updated,
              unreadCount: updated.filter((n) => !n.read).length,
            };
          });
        },
      };
    },
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);






