export interface Position {
  x: number;
  y: number;
}

export interface SLADuration {
  number: number;
  unit: string;
}

export interface FormData {
  id: string;
  component_key: string;
  component_type: string;
  component_id: string;
  name: string;
  prerequisites: string[];
  permitted_roles: string[];
  input_mapping: Record<string, any>;
  sla_duration: SLADuration;
  approval_required: boolean;
  approval_roles: string[];
}

export interface FormNode {
  id: string;
  type: 'form';
  position: Position;
  data: FormData;
}

export interface Edge {
  source: string;
  target: string;
}

export interface GraphData {
  $schema: string;
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  category: string;
  nodes: FormNode[];
  edges: Edge[];
  forms: Form[];
}

export interface Form {
  id: string;
  name: string;
  description: string;
  is_reusable: boolean;
  field_schema: {
    type: string;
    properties: Record<string, any>;
  };
} 