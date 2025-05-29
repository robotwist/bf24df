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
  name: string;
  type: string;
  required: boolean;
  validation?: {
    type: string;
    rules: Record<string, unknown>;
  };
}

export interface FormNode {
  id: string;
  type: string;
  label: string;
  fields: FormField[];
}

export interface FormEdge {
  source: string;
  target: string;
  type: string;
}

export interface FormGraph {
  nodes: FormNode[];
  edges: FormEdge[];
}

export interface FormMapping {
  sourceField: string;
  targetField: string;
  transformation?: {
    type: string;
    rules: Record<string, unknown>;
  };
}

export interface FormMappingSet {
  sourceForm: string;
  targetForm: string;
  mappings: FormMapping[];
}

export interface FormSchema {
  type: 'object';
  properties: Record<string, FieldSchema>;
  required?: string[];
} 