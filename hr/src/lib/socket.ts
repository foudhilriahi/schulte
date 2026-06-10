// ✅ CHECKPOINT — FIX #2: SOCKET.IO CLIENT
import { io, Socket } from 'socket.io-client';
import { authSession } from '@/lib/authSession';

const URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

class SocketService {
  private socket: Socket | null = null;
  private currentToken: string | null = null;
  private isConnecting = false;

  connect(token: string) {
    if (this.socket && this.currentToken === token) {
      if (this.socket.connected || this.isConnecting) return;
      this.isConnecting = true;
      this.socket.connect();
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.currentToken = token;
    this.isConnecting = true;

    this.socket = io(URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.isConnecting = false;
      console.log('🔗 WebSocket Connected (HR):', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      this.isConnecting = false;
      console.log('🔴 WebSocket Disconnected (HR)');
    });

    this.socket.on('connect_error', (err: any) => {
      this.isConnecting = false;
      const message = String(err?.message || '');
      console.error('❌ WebSocket connect error (HR):', message);

      // Any auth socket mismatch clears only this tab session.
      if (message.includes('Authentication error')) {
        authSession.clear();
        window.location.href = '/login';
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentToken = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
