// ✅ CHECKPOINT — FIX #2: SOCKET.IO CLIENT
import { useEffect } from 'react';
import { socketService } from '../lib/socket';
import { useAuthStore } from '../store/authStore';
import { authSession } from '../lib/authSession';

export function useSocket() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      const token = authSession.getAccessToken();
      if (token) {
        socketService.connect(token);
      }
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated]);

  const socket = socketService.getSocket();

  const listen = (event: string, callback: (data: any) => void) => {
    useEffect(() => {
      if (!socket) return;
      socket.on(event, callback);
      return () => {
        socket.off(event, callback);
      };
    }, [socket, callback, event]);
  };

  return { socket, listen };
}
