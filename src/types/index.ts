export type FormNode = {
    id: string;
    name: string;
    fields: FormField[];
  };
  
  export type FormField = {
    id: string;
    label: string;
    prefill?: PrefillConfig;
  };
  
  export type PrefillConfig = {
    sourceFormId: string;
    sourceFieldId: string;
  };
  
  export type FieldType = 
    | 'string' 
    | 'number' 
    | 'boolean' 
    | 'date' 
    | 'datetime' 
    | 'object' 
    | 'array' 
    | 'file' 
    | 'image'
    | 'select'
    | 'multiselect'
    | 'radio'
    | 'checkbox'
    | 'text'
    | 'email'
    | 'url'
    | 'tel'
    | 'integer'
    | 'float';
  
  export interface Field {
    id: string;
    name: string;
    type: FieldType;
  }
  
  export interface Mapping {
    id: string;
    targetFormId: string;
    targetField: Field;
    sourceFormId: string;
    sourceField: Field;
    transformation?: {
      type: string;
      format?: string;
    };
  }
  