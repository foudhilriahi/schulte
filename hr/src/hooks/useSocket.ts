// ✅ CHECKPOINT — FIX #2: SOCKET.IO CLIENT
import { useEffect, useRef, useState } from "react";
import { socketService } from '../lib/socket';
import { useAuthStore } from '../store/authStore';
import { authSession } from '../lib/authSession';

export function useSocket() {
  const { isAuthenticated, user } = useAuthStore();
  const activeToken = useRef<string | null>(null);
  const [socketVersion, setSocketVersion] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const token = authSession.getAccessToken();
      if (token) {
        if (activeToken.current && activeToken.current !== token) {
          socketService.disconnect();
        }
        activeToken.current = token;
        socketService.connect(token);

        const socket = socketService.getSocket();
        if (!socket) return;

        const notifySocketChange = () => setSocketVersion((prev) => prev + 1);
        socket.on("connect", notifySocketChange);
        socket.on("disconnect", notifySocketChange);
        socket.on("reconnect", notifySocketChange);
        notifySocketChange();

        return () => {
          socket.off("connect", notifySocketChange);
          socket.off("disconnect", notifySocketChange);
          socket.off("reconnect", notifySocketChange);
        };
      }
    } else {
      socketService.disconnect();
      activeToken.current = null;
      setSocketVersion((prev) => prev + 1);
    }
  }, [isAuthenticated, user?.id]);

  const socket = socketService.getSocket();
  const isConnected = Boolean(socket?.connected);

  return { socket, isConnected, socketVersion };
}
