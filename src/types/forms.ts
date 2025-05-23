export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';

export interface FieldSchema {
  type: FieldType;
  title?: string;
  description?: string;
  required?: boolean;
  enum?: any[];
  properties?: Record<string, FieldSchema>;
  items?: FieldSchema;
}

export interface FormField {
  id: string;
  schema: FieldSchema;
  path: string[];
}

export interface FormSchema {
  type: 'object';
  properties: Record<string, FieldSchema>;
  required?: string[];
} 