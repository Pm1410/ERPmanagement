import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
  cors: {
    origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    credentials: true,
  },
  namespace: '/',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);
  private connectedClients = new Map<string, { userId: string; role: string; institutionId: string }>();

  constructor(private readonly jwtService: JwtService) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      this.connectedClients.set(client.id, {
        userId: payload.sub,
        role: payload.role,
        institutionId: payload.institutionId,
      });

      // Join institution room and role room
      client.join(`institution:${payload.institutionId}`);
      client.join(`role:${payload.role}:${payload.institutionId}`);
      client.join(`user:${payload.sub}`);

      this.logger.log(`Client connected: ${client.id} (${payload.role})`);
    } catch {
      this.logger.warn(`Unauthorized WS connection attempt: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ── Subscribe to a class room ──────────────────────────────
  @SubscribeMessage('join:class')
  handleJoinClass(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { classId: string; sectionId: string },
  ) {
    client.join(`class:${data.classId}:${data.sectionId}`);
    return { event: 'joined', room: `class:${data.classId}:${data.sectionId}` };
  }

  // ── Event listeners (from service layer via EventEmitter2) ─
  @OnEvent('notice:new')
  handleNewNotice(payload: { notice: any; institutionId: string }) {
    this.server
      .to(`institution:${payload.institutionId}`)
      .emit('notice:new', payload.notice);
  }

  @OnEvent('attendance:marked')
  handleAttendanceMarked(payload: { classId: string; sectionId: string; summary: any }) {
    this.server
      .to(`class:${payload.classId}:${payload.sectionId}`)
      .emit('attendance:marked', payload.summary);
  }

  @OnEvent('message:received')
  handleMessageReceived(payload: { message: any }) {
    const { message } = payload;
    this.server.to(`user:${message.recipientId}`).emit('message:received', message);
  }

  @OnEvent('grievance:updated')
  handleGrievanceUpdated(payload: { grievance: any }) {
    const { grievance } = payload;
    if (grievance.submittedById) {
      this.server
        .to(`user:${grievance.submittedById}`)
        .emit('grievance:updated', grievance);
    }
  }

  @OnEvent('bus:location')
  handleBusLocation(payload: { routeId: string; lat: number; lng: number; institutionId: string }) {
    this.server
      .to(`institution:${payload.institutionId}`)
      .emit('bus:location', { routeId: payload.routeId, lat: payload.lat, lng: payload.lng });
  }

  // ── Helper to emit from anywhere ──────────────────────────
  emitToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToInstitution(institutionId: string, event: string, data: unknown) {
    this.server.to(`institution:${institutionId}`).emit(event, data);
  }

  emitToRole(role: string, institutionId: string, event: string, data: unknown) {
    this.server.to(`role:${role}:${institutionId}`).emit(event, data);
  }
}
