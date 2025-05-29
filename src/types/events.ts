export type EventType = 
  | 'form:created'
  | 'form:updated'
  | 'form:deleted'
  | 'mapping:created'
  | 'mapping:updated'
  | 'mapping:deleted'
  | 'validation:started'
  | 'validation:completed'
  | 'validation:failed'
  | 'transformation:started'
  | 'transformation:completed'
  | 'transformation:failed';

export type EventHandler = (data: unknown) => void; 