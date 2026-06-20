import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from './env.js';
import { verifyAccessToken } from '../utils/token.js';

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      const payload = verifyAccessToken(token);
      socket.data.user = payload;
      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.data.user.sub}`);
    socket.join(`tenant:${socket.data.user.tenantId}`);
  });

  return io;
}
