// ✅ CHECKPOINT — FIX #2: SOCKET.IO CLIENT
import { io, Socket } from 'socket.io-client';
import { authSession } from '@/lib/authSession';

const URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

class SocketService {
  private socket: Socket | null = null;
  private currentToken: string | null = null;

  connect(token: string) {
    if (this.socket?.connected && this.currentToken === token) return;
    
    // Disconnect old socket if new token
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this.currentToken = token;

    this.socket = io(URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('🔗 WebSocket Connected (HR):', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('🔴 WebSocket Disconnected (HR)');
    });

    this.socket.on('connect_error', (err: any) => {
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
