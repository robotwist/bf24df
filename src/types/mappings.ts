import { FormNode } from './graph';

export type SourceType = 'direct' | 'transitive' | 'global';

export interface MappingSource {
  type: SourceType;
  formId?: string;  // Required for direct/transitive, not for global
  fieldId: string;
  label: string;
}

export interface FieldMapping {
  id: string;
  targetFormId: string;
  targetFieldId: string;
  source: MappingSource;
}

export interface FormMappings {
  formId: string;
  mappings: FieldMapping[];
}

// Helper type for the mapping editor state
export interface MappingEditorState {
  selectedForm: FormNode | null;
  availableSources: MappingSource[];
  currentMappings: FieldMapping[];
  isModalOpen: boolean;
  selectedTargetField: string | null;
} 