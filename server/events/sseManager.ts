import { Response } from 'express';

export type EventType = 
  | 'transaction:new' 
  | 'transaction:risk' 
  | 'alert:new' 
  | 'alert:updated' 
  | 'dashboard:update' 
  | 'investigation:updated' 
  | 'simulator:status'
  | 'ping';

export interface SSEMessage {
  event: EventType;
  data: any;
  timestamp: string;
}

class SSEManager {
  private clients: Set<Response> = new Set();
  private keepAliveTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Keep alive ping every 25 seconds
    this.keepAliveTimer = setInterval(() => {
      this.broadcast('ping', { time: Date.now() });
    }, 25000);
  }

  public addClient(res: Response): void {
    this.clients.add(res);

    // Initial connection greeting
    res.write(`data: ${JSON.stringify({ event: 'connected', clientsCount: this.clients.size })}\n\n`);

    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  public broadcast(event: EventType, data: any): void {
    const payload: SSEMessage = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;

    for (const client of this.clients) {
      try {
        client.write(message);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }
}

export const sseManager = new SSEManager();
