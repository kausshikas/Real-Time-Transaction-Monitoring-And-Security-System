export type SSECallback = (event: string, data: any) => void;

class EventBus {
  private eventSource: EventSource | null = null;
  private listeners: Set<SSECallback> = new Set();
  private isConnecting: boolean = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  public connect(): void {
    if (this.eventSource || this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.eventSource = new EventSource('/api/events');

      this.eventSource.onopen = () => {
        this.isConnecting = false;
        // console.log('[SSE] Live connection opened.');
      };

      // Custom event types
      const eventTypes = [
        'transaction:new',
        'transaction:risk',
        'alert:new',
        'alert:updated',
        'dashboard:update',
        'investigation:updated',
        'simulator:status',
        'ping'
      ];

      eventTypes.forEach(eventType => {
        this.eventSource?.addEventListener(eventType, (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            this.notify(eventType, parsed.data);
          } catch (err) {
            console.error('[SSE] Failed to parse event data:', err);
          }
        });
      });

      this.eventSource.onerror = () => {
        this.isConnecting = false;
        this.disconnect();
        // Auto-reconnect after 3 seconds
        if (!this.reconnectTimeout) {
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connect();
          }, 3000);
        }
      };
    } catch (err) {
      this.isConnecting = false;
    }
  }

  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  public subscribe(callback: SSECallback): () => void {
    this.listeners.add(callback);
    this.connect();
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(event: string, data: any): void {
    this.listeners.forEach(fn => {
      try {
        fn(event, data);
      } catch (err) {
        console.error('[SSE Listener Error]', err);
      }
    });
  }
}

export const eventBus = new EventBus();
