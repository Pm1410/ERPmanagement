import { io, Socket } from 'socket.io-client';
import { tokenStore } from './api-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token: tokenStore.getAccess() },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });
  }
  return socket;
}

export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    // Update token before reconnecting (may have refreshed)
    s.auth = { token: tokenStore.getAccess() };
    s.connect();
  }
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function joinClassRoom(classId: string, sectionId: string): void {
  getSocket().emit('join:class', { classId, sectionId });
}

// ── Typed event listeners ──────────────────────────────────────
type NoticePayload = { id: string; title: string; body: string; priority: string; category: string };
type MessagePayload = { id: string; senderId: string; body: string; createdAt: string };
type GrievancePayload = { id: string; status: string; ticketNumber: string };
type BusPayload = { routeId: string; lat: number; lng: number };
type AttendancePayload = { classId: string; sectionId: string; summary: Record<string, number> };

export const socketEvents = {
  onNotice: (cb: (data: NoticePayload) => void) => {
    getSocket().on('notice:new', cb);
    return () => getSocket().off('notice:new', cb);
  },
  onMessage: (cb: (data: MessagePayload) => void) => {
    getSocket().on('message:received', cb);
    return () => getSocket().off('message:received', cb);
  },
  onGrievanceUpdated: (cb: (data: GrievancePayload) => void) => {
    getSocket().on('grievance:updated', cb);
    return () => getSocket().off('grievance:updated', cb);
  },
  onBusLocation: (cb: (data: BusPayload) => void) => {
    getSocket().on('bus:location', cb);
    return () => getSocket().off('bus:location', cb);
  },
  onAttendanceMarked: (cb: (data: AttendancePayload) => void) => {
    getSocket().on('attendance:marked', cb);
    return () => getSocket().off('attendance:marked', cb);
  },
};
