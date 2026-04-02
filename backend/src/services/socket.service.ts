import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthPayload } from '../middleware/authenticate';
import logger from '../utils/logger';

let io: SocketIOServer;

export class SocketService {
  static init(server: HttpServer): void {
    io = new SocketIOServer(server, {
      cors: {
        origin: [env.CLIENT_URL, env.ADMIN_URL, env.HR_URL],
        credentials: true,
      },
    });

    // Authentication Middleware
    io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error: Token required'));
        }

        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
        // Attach user payload to socket
        (socket as any).user = payload;
        next();
      } catch (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
    });

    // Connection Handler
    io.on('connection', (socket: Socket) => {
      const user = (socket as any).user as AuthPayload;
      logger.info(`Socket connected: ${socket.id} (user: ${user.userId}, role: ${user.role})`);

      // Join Rooms based on role
      socket.join(`user:${user.userId}`);
      
      if (user.role === 'HR' || user.role === 'ADMIN') {
        socket.join(`hr:${user.userId}`);
        if (user.site) {
          socket.join(`site:${user.site}`);
        }
      } else if (user.role === 'CANDIDATE') {
        socket.join(`candidate:${user.userId}`);
      }

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  static getIO(): SocketIOServer {
    if (!io) {
      throw new Error('Socket.io has not been initialized');
    }
    return io;
  }

  static emitToUser(userId: string, eventName: string, data: any): void {
    if (io) {
      io.to(`user:${userId}`).emit(eventName, data);
      io.to(`candidate:${userId}`).emit(eventName, data); // For backward compatibility with docs
    }
  }

  static emitToSite(site: string, eventName: string, data: any): void {
    if (io) {
      io.to(`site:${site}`).emit(eventName, data);
    }
  }

  static emitToAllHR(eventName: string, data: any): void {
    // We could either create a global 'hr:all' room, or just emit to all sites
    if (io) {
      io.to('site:Bouarada').to('site:Zaghouan').emit(eventName, data); // Both plants
    }
  }

  static emitToCandidate(userId: string, eventName: string, data: any): void {
    if (io) {
      io.to(`candidate:${userId}`).emit(eventName, data);
    }
  }

  static emitToAllCandidates(eventName: string, data: any): void {
    // Simplest way is broadcast to everyone or specifically all connected sockets
    // A better approach is having all candidates join a 'candidates:all' room
    if (io) {
      io.emit(eventName, data); // Since HR also sees 'offer:new', this is fine
    }
  }
}
