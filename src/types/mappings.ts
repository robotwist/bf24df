import { FormNode } from './graph';

/**
 * Represents the type of mapping source
 * @typedef {'direct' | 'transitive' | 'global'} SourceType
 */
export type SourceType = 'direct' | 'transitive' | 'global';

/**
 * Represents a source field that can be mapped to a target field
 * @interface MappingSource
 */
export interface MappingSource {
  /** The type of source (direct dependency, transitive dependency, or global) */
  type: SourceType;
  /** The ID of the source form (required for direct/transitive, not for global) */
  formId?: string;
  /** The ID of the source field */
  fieldId: string;
  /** A human-readable label for the source */
  label: string;
}

/**
 * Represents a mapping between a source field and a target field
 * @interface FieldMapping
 */
export interface FieldMapping {
  /** Unique identifier for the mapping */
  id: string;
  /** ID of the form containing the target field */
  targetFormId: string;
  /** ID of the target field */
  targetFieldId: string;
  /** The source field information */
  source: MappingSource;
  /** Optional transformation to apply to the source value */
  transformation?: {
    type: string;
    format?: string;
  };
}

/**
 * Represents all mappings for a specific form
 * @interface FormMappings
 */
export interface FormMappings {
  /** ID of the form */
  formId: string;
  /** Array of field mappings for this form */
  mappings: FieldMapping[];
}

/**
 * Represents the state of the mapping editor
 * @interface MappingEditorState
 */
export interface MappingEditorState {
  /** The currently selected form */
  selectedForm: FormNode | null;
  /** Available source fields that can be mapped */
  availableSources: MappingSource[];
  /** Current mappings for the selected form */
  currentMappings: FieldMapping[];
  /** Whether the mapping editor modal is open */
  isModalOpen: boolean;
  /** The currently selected target field */
  selectedTargetField: string | null;
  /** History of mapping changes for undo/redo */
  history: {
    past: FieldMapping[][];
    present: FieldMapping[];
    future: FieldMapping[][];
  };
} 