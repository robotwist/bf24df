type EventHandler = (...args: any[]) => void;

class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, EventHandler[]> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  public off(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) return;
    
    const handlers = this.handlers.get(event)!;
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  public emit(event: string, ...args: any[]): void {
    if (!this.handlers.has(event)) return;
    
    this.handlers.get(event)!.forEach(handler => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  public clear(): void {
    this.handlers.clear();
  }
}

export const eventBus = EventBus.getInstance();

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