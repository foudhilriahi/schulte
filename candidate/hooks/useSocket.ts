"use client";
import { useEffect, useRef } from "react";
import { socketService } from "@/lib/socket";
import { useAuthStore } from "@/store/auth";
import { storage, STORAGE_KEYS } from "@/lib/storage";

export function useSocket() {
  const { isAuthenticated, user } = useAuthStore();
  const connectionAttempted = useRef(false);

  useEffect(() => {
    const token = storage.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
    
    if (isAuthenticated && token && user) {
      // Only connect if we haven't attempted yet or if user changed
      if (!connectionAttempted.current || !socketService.isConnected()) {
        console.log('🔄 Connecting WebSocket for user:', user.id);
        socketService.connect(token);
        connectionAttempted.current = true;
      }
    } else {
      // Disconnect if not authenticated
      if (connectionAttempted.current) {
        console.log('🔌 Disconnecting WebSocket - not authenticated');
        socketService.disconnect();
        connectionAttempted.current = false;
      }
    }

    // Cleanup on unmount - keep connection alive
    return () => {
      // Don't disconnect on unmount, only when user logs out
    };
  }, [isAuthenticated, user?.id]); // Reconnect if user changes

  return { socket: socketService.getSocket(), isConnected: socketService.isConnected() };
}

export function useSocketEvent(event: string, callback: (data: any) => void) {
  const { isAuthenticated } = useAuthStore();
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    // Wrapper to use latest callback
    const handler = (data: any) => {
      callbackRef.current(data);
    };

    // Attach listener
    socket.on(event, handler);

    // Cleanup
    return () => {
      socket.off(event, handler);
    };
  }, [event, isAuthenticated]);
}
