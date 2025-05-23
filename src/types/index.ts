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
  