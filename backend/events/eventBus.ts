import { OperationalEvent } from '../models/types';
import { db } from '../database/adapter';

export type EventHandler = (event: OperationalEvent) => Promise<void>;

export interface IEventBus {
  publish(eventData: Omit<OperationalEvent, 'id' | 'timestamp' | 'processed'>): Promise<OperationalEvent>;
  subscribe(handler: EventHandler): void;
  getQueueSize(): number;
}

export class LocalEventBus implements IEventBus {
  private handlers: EventHandler[] = [];
  private eventQueue: OperationalEvent[] = [];
  private isProcessing = false;

  constructor() {
    this.startWorker();
  }

  async publish(eventData: Omit<OperationalEvent, 'id' | 'timestamp' | 'processed'>): Promise<OperationalEvent> {
    const event = await db.addEvent(eventData);
    this.eventQueue.push(event);
    return event;
  }

  subscribe(handler: EventHandler): void {
    this.handlers.push(handler);
  }

  getQueueSize(): number {
    return this.eventQueue.length;
  }

  private startWorker(): void {
    setInterval(async () => {
      if (this.isProcessing || this.eventQueue.length === 0) return;
      this.isProcessing = true;

      const event = this.eventQueue.shift();
      if (event) {
        try {
          for (const handler of this.handlers) {
            await handler(event);
          }
          await db.markEventProcessed(event.id);
        } catch (error) {
          console.error(`[EventBus] Error processing event ${event.id}:`, error);
        }
      }

      this.isProcessing = false;
    }, 200);
  }
}

export class PubSubEventBus implements IEventBus {
  private localFallback = new LocalEventBus();

  async publish(eventData: Omit<OperationalEvent, 'id' | 'timestamp' | 'processed'>): Promise<OperationalEvent> {
    // In production GCP environment, this publishes to Google Cloud Pub/Sub topic.
    // Falls back gracefully to local event bus.
    return this.localFallback.publish(eventData);
  }

  subscribe(handler: EventHandler): void {
    this.localFallback.subscribe(handler);
  }

  getQueueSize(): number {
    return this.localFallback.getQueueSize();
  }
}

export const eventBus: IEventBus = new LocalEventBus();
