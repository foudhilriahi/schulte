"use client";
import { useEffect, useRef, useState } from "react";
import { socketService } from "@/lib/socket";
import { useAuthStore } from "@/store/auth";
import { storage, STORAGE_KEYS } from "@/lib/storage";

export function useSocket() {
  const { isAuthenticated, user } = useAuthStore();
  const connectionAttempted = useRef(false);
  const activeToken = useRef<string | null>(null);
  const [socketVersion, setSocketVersion] = useState(0);

  useEffect(() => {
    const token = storage.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);

    if (isAuthenticated && token && user) {
      if (activeToken.current && activeToken.current !== token) {
        socketService.disconnect();
        connectionAttempted.current = false;
      }

      activeToken.current = token;

      if (!connectionAttempted.current || !socketService.isConnected()) {
        console.log("Connecting WebSocket for user:", user.id);
        socketService.connect(token);
        connectionAttempted.current = true;
      }

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
    } else {
      if (connectionAttempted.current || socketService.getSocket()) {
        console.log("Disconnecting WebSocket - not authenticated");
        socketService.disconnect();
        connectionAttempted.current = false;
        activeToken.current = null;
        setSocketVersion((prev) => prev + 1);
      }
    }
  }, [isAuthenticated, user?.id]);

  return {
    socket: socketService.getSocket(),
    isConnected: socketService.isConnected(),
    socketVersion,
  };
}

export function useSocketEvent(event: string, callback: (data: any) => void) {
  const { isAuthenticated, user } = useAuthStore();
  const callbackRef = useRef(callback);
  const attachedSocketRef = useRef<ReturnType<typeof socketService.getSocket> | null>(
    null,
  );

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const handler = (data: any) => {
      callbackRef.current(data);
    };

    const attachIfReady = () => {
      const socket = socketService.getSocket();
      if (!socket || attachedSocketRef.current === socket) return;

      if (attachedSocketRef.current) {
        attachedSocketRef.current.off(event, handler);
      }

      socket.on(event, handler);
      attachedSocketRef.current = socket;
    };

    attachIfReady();
    const timer = window.setInterval(attachIfReady, 1000);

    return () => {
      window.clearInterval(timer);
      if (attachedSocketRef.current) {
        attachedSocketRef.current.off(event, handler);
        attachedSocketRef.current = null;
      }
    };
  }, [event, isAuthenticated, user?.id]);
}
