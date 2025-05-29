import { EventHandler, EventType } from '../../types/events';

class EventBus {
  private handlers: Map<EventType, Set<EventHandler>>;

  constructor() {
    this.handlers = new Map();
  }

  subscribe(eventType: EventType, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)?.add(handler);
  }

  unsubscribe(eventType: EventType, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }

  publish(eventType: EventType, data: unknown): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

export default EventBus;

// Event types
export enum Events {
  FHIR_RESOURCE_CREATED = 'fhir:resource:created',
  FHIR_RESOURCE_UPDATED = 'fhir:resource:updated',
  FHIR_RESOURCE_DELETED = 'fhir:resource:deleted',
  WORKFLOW_STARTED = 'workflow:started',
  WORKFLOW_COMPLETED = 'workflow:completed',
  WORKFLOW_ERROR = 'workflow:error',
  HL7_MESSAGE_RECEIVED = 'hl7:message:received',
  HL7_MESSAGE_PROCESSED = 'hl7:message:processed',
  AUTH_STATE_CHANGED = 'auth:state:changed',
} 