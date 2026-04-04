// ✅ PRODUCTION-READY SOCKET.IO CLIENT
import { io, Socket } from 'socket.io-client';

// Use correct backend URL with fallback
const URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isConnecting = false;

  connect(token: string) {
    // Don't reconnect if already connected or connecting
    if (this.socket?.connected || this.isConnecting) {
      console.log('✅ Socket already connected or connecting');
      return;
    }
    
    this.isConnecting = true;
    
    // Disconnect old socket if exists
    if (this.socket) {
      this.socket.disconnect();
    }
    
    console.log('🔄 Connecting to WebSocket...', URL);
    
    this.socket = io(URL, {
      auth: { token },
      withCredentials: true,
      transports: ['polling', 'websocket'], // Start with polling, upgrade to websocket
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000,
      forceNew: true, // Force new connection
    });

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      console.log('✅ WebSocket Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnecting = false;
      console.log('🔴 WebSocket Disconnected:', reason);
      
      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect' || reason === 'transport close') {
        setTimeout(() => {
          if (token && !this.socket?.connected) {
            console.log('🔄 Auto-reconnecting...');
            this.connect(token);
          }
        }, 3000);
      }
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      this.isConnecting = false;
      console.error('❌ WebSocket Connection Error:', error.message);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached. Will retry in 30 seconds...');
        setTimeout(() => {
          this.reconnectAttempts = 0;
          if (token) this.connect(token);
        }, 30000);
      }
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket Error:', error);
    });

    // Add authentication error handler
    this.socket.on('auth_error', (error) => {
      console.error('❌ WebSocket Auth Error:', error);
      this.disconnect();
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
      this.isConnecting = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
