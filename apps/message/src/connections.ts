import type WebSocket from 'ws';

/**
 * userId → that user's open sockets (one per device/tab).
 * In-memory, so this only works with a single message-service instance;
 * replace the internals with Redis pub/sub when scaling out, keeping the same API.
 */
const sockets = new Map<string, Set<WebSocket>>();

export function addConnection(userId: string, ws: WebSocket): void {
  let userSockets = sockets.get(userId);
  if (!userSockets) {
    userSockets = new Set();
    sockets.set(userId, userSockets);
  }
  userSockets.add(ws);
}

export function removeConnection(userId: string, ws: WebSocket): void {
  const userSockets = sockets.get(userId);
  if (!userSockets) return;
  userSockets.delete(ws);
  if (userSockets.size === 0) {
    sockets.delete(userId);
  }
}

export function isOnline(userId: string): boolean {
  return sockets.has(userId);
}
export function deliverToUser(userId: string, payload: unknown): number {
  const userSockets = sockets.get(userId);
  if (!userSockets) return 0;

  const data = JSON.stringify(payload);
  let delivered = 0;
  for (const ws of userSockets) {
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
      delivered++;
    }
  }
  return delivered;
}
