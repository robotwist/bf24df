import React, { useState /*, useEffect */ } from 'react';
import { FormNode, GraphData } from '../../types/graph';
import { FieldMapping, MappingSource } from '../../types/mappings';
import { useMappings } from '../../hooks/useMappings';
import { SourceSelectorModal } from '../modals/SourceSelectorModal';
// import { MappingStatus } from './MappingStatus';
import { getFieldSchema } from '../../lib/utils/validation';
import styles from '../../styles/MappingEditor.module.css';

interface MappingEditorProps {
  form: FormNode;
  graphData: GraphData;
  onClose: () => void;
}

interface FieldType {
  type: string;
  compatibleTypes: string[];
}

const FIELD_TYPES: Record<string, FieldType> = {
  string: { type: 'string', compatibleTypes: ['string', 'text'] },
  number: { type: 'number', compatibleTypes: ['number', 'integer'] },
  boolean: { type: 'boolean', compatibleTypes: ['boolean'] },
  date: { type: 'date', compatibleTypes: ['date', 'datetime'] },
  text: { type: 'text', compatibleTypes: ['string', 'text'] },
  integer: { type: 'integer', compatibleTypes: ['number', 'integer'] },
  datetime: { type: 'datetime', compatibleTypes: ['date', 'datetime'] }
};

// Mock data for preview
const MOCK_DATA: Record<string, string> = {
  string_field: 'Sample Text',
  number_field: '42',
  boolean_field: 'true',
  date_field: '2024-03-20',
  text_field: 'Long form text content',
  integer_field: '100',
  datetime_field: '2024-03-20T15:30:00Z',
  phone_field: '1234567890',
  email_field: 'test@example.com'
};

const transformValue = (value: string, sourceType: string, targetType: string): string => {
  if (sourceType === targetType) return value;

  try {
    switch (targetType) {
      case 'number':
      case 'integer':
        return String(Number(value));
      case 'boolean':
        return String(Boolean(value));
      case 'date':
        return new Date(value).toISOString().split('T')[0];
      case 'datetime':
        return new Date(value).toISOString();
      case 'string':
      case 'text':
        return String(value);
      default:
        return value;
    }
  } catch (error) {
    console.error('Error transforming value:', error);
    return value;
  }
};

// Healthcare field mapping templates
const HEALTHCARE_TEMPLATES = {
  patient: {
    name: 'Patient Information',
    fields: [
      { source: 'first_name', target: 'patient_first_name', type: 'string' },
      { source: 'last_name', target: 'patient_last_name', type: 'string' },
      { source: 'date_of_birth', target: 'patient_dob', type: 'date' },
      { source: 'gender', target: 'patient_gender', type: 'string' }
    ]
  },
  contact: {
    name: 'Contact Information',
    fields: [
      { source: 'phone', target: 'contact_phone', type: 'string' },
      { source: 'email', target: 'contact_email', type: 'string' },
      { source: 'address', target: 'contact_address', type: 'text' }
    ]
  },
  medical: {
    name: 'Medical History',
    fields: [
      { source: 'allergies', target: 'patient_allergies', type: 'text' },
      { source: 'conditions', target: 'patient_conditions', type: 'text' },
      { source: 'medications', target: 'patient_medications', type: 'text' }
    ]
  }
};

// Commented out unused constants and functions
// const HEALTHCARE_VALIDATIONS: Record<string, ValidationRule> = { ... };
// const FIELD_VALIDATIONS: Record<string, string[]> = { ... };
// const applyTransformation = (value: string, transform: string, params: Record<string, string>): string => { ... };
// const TRANSFORMATIONS: Record<string, TransformFunction> = { ... };

// const getAvailableTransformations = (sourceType: string, targetType: string): string[] => {
//   const transformations: string[] = [];
//   if (sourceType === 'string' || targetType === 'string') {
//     transformations.push('uppercase', 'lowercase', 'capitalize', 'trim');
//   }
//   if (sourceType === 'number' || targetType === 'number') {
//     transformations.push('round', 'floor', 'ceil');
//   }
//   if (sourceType === 'date' || targetType === 'date' || 
//       sourceType === 'datetime' || targetType === 'datetime') {
//     transformations.push('formatDate', 'formatDateTime');
//   }
//   if (sourceType === 'string') {
//     transformations.push('format_phone', 'format_ssn');
//   }
//   return transformations;
// };

const areTypesCompatible = (sourceType: string, targetType: string): boolean => {
  const sourceTypeInfo = FIELD_TYPES[sourceType];
  const targetTypeInfo = FIELD_TYPES[targetType];
  
  if (!sourceTypeInfo || !targetTypeInfo) {
    return false;
  }
  
  // Check both ways - source can be mapped to target AND target can accept source
  return sourceTypeInfo.compatibleTypes.includes(targetType) && 
         targetTypeInfo.compatibleTypes.includes(sourceType);
};

export const MappingEditor: React.FC<MappingEditorProps> = ({ 
  form, 
  graphData,
  onClose 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  // const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedSourceField, setSelectedSourceField] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // const [isTemplateApplying, setIsTemplateApplying] = useState(false);
  const [previewData, setPreviewData] = useState<{
    source: string;
    transformed: string;
    target: string;
  } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedTransformation, setSelectedTransformation] = useState<string>('');
  const [transformationParams, setTransformationParams] = useState<Record<string, string>>({});
  // const [validationRules, setValidationRules] = useState<string[]>([]);
  const [mappingStatus, setMappingStatus] = useState<string | null>(null);
  const [sourceFields, setSourceFields] = useState<string[]>([]);
  
  const {
    formMappings,
    getAvailableSources,
    addMapping,
    removeMapping
    // updateMapping
  } = useMappings(graphData);

  const handleAddMapping = async () => {
    try {
      setIsSaving(true);
      setValidationError(null);

      if (selectedSource && selectedTarget) {
        const source: MappingSource = {
          type: 'direct',
          formId: selectedSource,
          fieldId: selectedSource,
          label: `${selectedSource} - ${selectedSource}`
        };

        const newMapping: FieldMapping = {
          id: `${form.id}-${selectedTarget}-${Date.now()}`,
          targetFormId: form.id,
          targetFieldId: selectedTarget,
          source
        };

        await addMapping(form.id, newMapping);
        setSelectedSource('');
        setSelectedTarget('');
        setSelectedTransformation('');
        setTransformationParams({});
        setMappingStatus('Mapping saved');
      }
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to add mapping');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSourceSelect = (source: MappingSource) => {
    if (selectedField) {
      try {
        // Get source and target schemas
        const formSchema = graphData.forms.find(f => f.id === form.id)?.field_schema;
        if (!formSchema) throw new Error('Form schema not found');

        const targetSchema = getFieldSchema(formSchema.properties, [selectedField]);
        if (!targetSchema) throw new Error('Target field schema not found');

        let sourceSchema;
        if (source.type === 'global') {
          // Mock global field schemas
          sourceSchema = { type: 'string' };
        } else {
          const sourceForm = graphData.forms.find(f => f.id === source.formId)?.field_schema;
          if (!sourceForm) throw new Error('Source form schema not found');
          sourceSchema = getFieldSchema(sourceForm.properties, [source.fieldId]);
          if (!sourceSchema) throw new Error('Source field schema not found');
        }

        const newMapping: FieldMapping = {
          id: `${form.id}-${selectedField}-${Date.now()}`,
          targetFormId: form.id,
          targetFieldId: selectedField,
          source
        };

        addMapping(form.id, newMapping);
        setIsModalOpen(false);
        setSelectedField(null);
      } catch (err) {
        setValidationError(err instanceof Error ? err.message : 'Failed to create mapping');
      }
    }
  };

  const formMappingsList = formMappings[form.id] || [];
  const availableSources = selectedField ? getAvailableSources(form.id, [selectedField]) : [];

  const getFieldType = (fieldName: string, formId: string): string => {
    const form = graphData.nodes.find(n => n.id === formId);
    if (!form) return 'string';
    const type = form.data.input_mapping[fieldName]?.type;
    return type || 'string';
  };

  const validateField = (field: string, value: string) => {
    const fieldType = getFieldType(field, form.id);
    if (!fieldType) {
      setValidationError('Unknown field type');
      return false;
    }

    // Check field type compatibility
    const sourceType = getFieldType(selectedSource || '', selectedSource || '');
    const targetType = getFieldType(selectedTarget || '', form.id);
    
    if (sourceType && targetType && !areTypesCompatible(sourceType, targetType)) {
      setValidationError(`Incompatible field types: ${sourceType} cannot be mapped to ${targetType}`);
      return false;
    }

    // Validate based on field type
    if (fieldType === 'phone') {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(value)) {
        setValidationError('Invalid phone number format');
        return false;
      }
    } else if (fieldType === 'ssn') {
      const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
      if (!ssnRegex.test(value)) {
        setValidationError('Invalid SSN format');
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const updatePreview = (sourceValue: string, targetField: string) => {
    if (!sourceValue || !targetField) {
      setPreviewData(null);
      return;
    }

    try {
      const transformedValue = sourceValue;

      if (selectedTransformation) {
        // const transform = TRANSFORMATIONS[selectedTransformation];
        // if (transform) {
        //   transformedValue = transform(sourceValue);
        // }
      }

      // Validate the transformed value
      validateField(targetField, transformedValue.toString());

      setPreviewData({
        source: sourceValue,
        transformed: transformedValue,
        target: targetField
      });
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to generate preview');
      setPreviewData(null);
    }
  };

  const handleSourceChange = (source: string) => {
    setSelectedSource(source);
    setSelectedSourceField('');
    setValidationError(null);
    setPreviewData(null);

    // Update source fields based on selected source
    const fields = getAvailableFields(source);
    setSourceFields(fields);
  };

  const handleSourceFieldChange = (field: string) => {
    setSelectedSourceField(field);
    setPreviewData(null);

    // Only validate if we have both source and target
    if (selectedTarget) {
      const sourceSchema = graphData.forms.find(f => f.id === selectedSource)?.field_schema?.properties || {};
      const targetSchema = graphData.forms.find(f => f.id === form.id)?.field_schema?.properties || {};
      const sourceType = getFieldSchema(sourceSchema, [field])?.type || 'string';
      const targetType = getFieldSchema(targetSchema, [selectedTarget])?.type || 'string';

      if (!areTypesCompatible(sourceType, targetType)) {
        setValidationError(`Incompatible field types: ${sourceType} cannot be mapped to ${targetType}`);
        return;
      }
    }

    // Only clear error if validation passes
    setValidationError(null);

    // Update preview if we have both fields
    if (selectedTarget) {
      const sourceSchema = graphData.forms.find(f => f.id === selectedSource)?.field_schema?.properties || {};
      const targetSchema = graphData.forms.find(f => f.id === form.id)?.field_schema?.properties || {};
      const sourceType = getFieldSchema(sourceSchema, [field])?.type || 'string';
      const targetType = getFieldSchema(targetSchema, [selectedTarget])?.type || 'string';
      const mockValue = MOCK_DATA[field] || 'Sample Value';
      const transformedValue = String(transformValue(mockValue, sourceType, targetType));
      setPreviewData({
        source: mockValue,
        transformed: transformedValue,
        target: transformedValue
      });
    }
  };

  const getAvailableFields = (formId: string): string[] => {
    if (!formId) return [];
    const sources: MappingSource[] = getAvailableSources(form.id, []);
    return sources
      .filter((source) => source.formId === formId)
      .map((source) => source.fieldId);
  };

  const handleTargetChange = (target: string) => {
    setSelectedTarget(target);
    setPreviewData(null);

    // Only validate if we have both source and target
    if (selectedSourceField) {
      const sourceSchema = graphData.forms.find(f => f.id === selectedSource)?.field_schema?.properties || {};
      const targetSchema = graphData.forms.find(f => f.id === form.id)?.field_schema?.properties || {};
      const sourceType = getFieldSchema(sourceSchema, [selectedSourceField])?.type || 'string';
      const targetType = getFieldSchema(targetSchema, [target])?.type || 'string';

      if (!areTypesCompatible(sourceType, targetType)) {
        setValidationError(`Incompatible field types: ${sourceType} cannot be mapped to ${targetType}`);
        return;
      }
    }

    // Only clear error if validation passes
    setValidationError(null);

    // Update preview if we have both fields
    if (selectedSourceField) {
      const sourceSchema = graphData.forms.find(f => f.id === selectedSource)?.field_schema?.properties || {};
      const targetSchema = graphData.forms.find(f => f.id === form.id)?.field_schema?.properties || {};
      const sourceType = getFieldSchema(sourceSchema, [selectedSourceField])?.type || 'string';
      const targetType = getFieldSchema(targetSchema, [target])?.type || 'string';
      const mockValue = MOCK_DATA[selectedSourceField] || 'Sample Value';
      const transformedValue = String(transformValue(mockValue, sourceType, targetType));
      setPreviewData({
        source: mockValue,
        transformed: transformedValue,
        target: transformedValue
      });
    }
  };

  const handleTemplateSelect = async (templateKey: string) => {
    setIsSaving(true);
    setValidationError(null);
    try {
      const template = HEALTHCARE_TEMPLATES[templateKey as keyof typeof HEALTHCARE_TEMPLATES];
      
      if (template) {
        // Apply all field mappings from the template
        const mappingPromises = template.fields.map(async (field) => {
          const source: MappingSource = {
            type: 'direct',
            formId: selectedSource,
            fieldId: field.source,
            label: `${field.source} (${template.name})`
          };

          const newMapping: FieldMapping = {
            id: `${form.id}-${field.target}-${Date.now()}`,
            targetFormId: form.id,
            targetFieldId: field.target,
            source
          };

          await addMapping(form.id, newMapping);
        });

        // Wait for all mappings to be created
        await Promise.all(mappingPromises);
        setSelectedTemplate(templateKey);
      }
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to apply template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMapping = async (mappingId: string) => {
    try {
      setIsLoading(true);
      await removeMapping(form.id, mappingId);
      setMappingStatus('Mapping removed');
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to remove mapping');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.mappingEditor} data-testid="mapping-editor">
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2>Edit Mappings for {form.data.name}</h2>
          <p className={styles.subtitle}>Map fields from source forms to target fields</p>
        </div>
        <button 
          className={styles.closeButton} 
          onClick={onClose} 
          data-testid="close-button"
          aria-label="Close mapping editor"
        >
          ×
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.mappingForm}>
          {/* Template Selection */}
          <div className={styles.templateSection}>
            <div className={styles.sectionHeader}>
              <h3>Healthcare Field Templates</h3>
              <p className={styles.sectionDescription}>
                Quickly apply predefined field mappings for common healthcare scenarios
              </p>
            </div>
            <div className={styles.templateGrid}>
              {Object.entries(HEALTHCARE_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  className={`${styles.templateButton} ${
                    selectedTemplate === key ? styles.selected : ''
                  }`}
                  onClick={() => handleTemplateSelect(key)}
                  disabled={!selectedSource}
                  data-testid={`template-${key}`}
                >
                  <div className={styles.templateContent}>
                    <h4>{template.name}</h4>
                    <p>{template.fields.length} fields</p>
                    <ul className={styles.templateFields}>
                      {template.fields.slice(0, 3).map((field, index) => (
                        <li key={index}>{field.source} → {field.target}</li>
                      ))}
                      {template.fields.length > 3 && (
                        <li className={styles.moreFields}>+{template.fields.length - 3} more fields</li>
                      )}
                    </ul>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.mappingSection}>
            <div className={styles.sectionHeader}>
              <h3>Create New Mapping</h3>
              <p className={styles.sectionDescription}>
                Select source and target fields to create a new mapping
              </p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="source-form">Source Form</label>
              <select 
                id="source-form"
                value={selectedSource} 
                onChange={(e) => handleSourceChange(e.target.value)}
                data-testid="source-form"
              >
                <option value="">Select a form...</option>
                {getAvailableSources(form.id, []).map((source, index) => (
                  <option key={`source-form-${source.formId}-${index}`} value={source.formId}>
                    {source.formId}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="source-field">Source Field</label>
              <select
                id="source-field"
                value={selectedSourceField}
                onChange={(e) => handleSourceFieldChange(e.target.value)}
                data-testid="source-field"
                disabled={!selectedSource}
              >
                <option value="">Select a source field</option>
                {sourceFields.map(field => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>

            {validationError && (
              <div 
                className={styles.error} 
                data-testid="validation-error" 
                role="alert"
              >
                <div className={styles.errorIcon}>⚠️</div>
                <div className={styles.errorContent}>
                  <strong>Validation Error</strong>
                  <p>{validationError}</p>
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="target-field">Target Field</label>
              <select 
                id="target-field"
                value={selectedTarget} 
                onChange={(e) => handleTargetChange(e.target.value)}
                data-testid="target-field"
              >
                <option value="">Select a field...</option>
                {Object.entries(graphData.forms.find(f => f.id === form.data.component_id)?.field_schema.properties || {}).map(([fieldId, field], index) => (
                  <option key={`target-field-${fieldId}-${index}`} value={fieldId}>
                    {field.title || fieldId}
                  </option>
                ))}
              </select>
            </div>

            {previewData && (
              <div className={styles.previewSection} data-testid="preview-section">
                <div className={styles.sectionHeader}>
                  <h4>Data Preview</h4>
                  <p className={styles.sectionDescription}>
                    Preview how the data will be transformed
                  </p>
                </div>
                <div className={styles.previewContent}>
                  <div className={styles.previewItem} data-testid="preview-item">
                    <strong>Source Value</strong>
                    <pre>{previewData.source}</pre>
                  </div>
                  <div className={styles.previewItem} data-testid="preview-item">
                    <strong>Transformed Value</strong>
                    <pre>{previewData.transformed}</pre>
                  </div>
                </div>
              </div>
            )}

            {selectedSource && selectedTarget && (
              <div className={styles.formGroup}>
                <label htmlFor="transformation">Transformation</label>
                <select 
                  id="transformation"
                  value={selectedTransformation} 
                  onChange={(e) => {
                    setSelectedTransformation(e.target.value);
                    updatePreview(selectedSourceField, selectedTarget);
                  }}
                  data-testid="transformation-select"
                >
                  <option value="">No transformation</option>
                </select>
              </div>
            )}

            <div className={styles.actions}>
              <button 
                className={styles.saveButton}
                disabled={!!validationError || !selectedSource || !selectedTarget || isSaving}
                onClick={handleAddMapping}
                data-testid="save-button"
              >
                {isSaving ? (
                  <span className={styles.loadingSpinner}>⌛</span>
                ) : (
                  'Save Mapping'
                )}
              </button>
            </div>
          </div>

          {/* Mapping List Section */}
          <div className={styles.mappingList} data-testid="mapping-list">
            <div className={styles.sectionHeader}>
              <h3>Current Mappings</h3>
              <p className={styles.sectionDescription}>
                {formMappingsList.length} mapping{formMappingsList.length !== 1 ? 's' : ''} defined
              </p>
            </div>
            
            {isLoading ? (
              <div className={styles.loading}>
                <span className={styles.loadingSpinner}>⌛</span>
                Loading mappings...
              </div>
            ) : formMappingsList.length === 0 ? (
              <div className={styles.noMappings}>
                <p>No mappings defined yet</p>
                <p className={styles.hint}>Select source and target fields above to create your first mapping</p>
              </div>
            ) : (
              formMappingsList.map((mapping) => (
                <div 
                  key={mapping.id} 
                  className={styles.mappingItem}
                  data-testid="mapping-item"
                >
                  <div className={styles.mappingInfo}>
                    <div className={styles.mappingFields}>
                      <span className={styles.targetField}>{mapping.targetFieldId}</span>
                      <span className={styles.mappingArrow}>→</span>
                      <span className={styles.sourceField}>
                        {mapping.source.label || mapping.source.fieldId}
                      </span>
                    </div>
                    <div className={styles.mappingType}>
                      {getFieldType(String(mapping.source.fieldId), String(mapping.source.formId))} → {getFieldType(String(mapping.targetFieldId), String(form.id))}
                    </div>
                  </div>
                  <button
                    className={styles.removeMapping}
                    onClick={() => handleRemoveMapping(mapping.id)}
                    data-testid="remove-mapping"
                    disabled={isLoading}
                    aria-label={`Remove mapping for ${mapping.targetFieldId}`}
                  >
                    {isLoading ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Mapping Status */}
          {mappingStatus && (
            <div className={styles.mappingStatus} data-testid="mapping-status">
              <div className={styles.statusIcon}>✓</div>
              <div className={styles.statusMessage}>{mappingStatus}</div>
            </div>
          )}
        </div>
      </div>

      <SourceSelectorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedField(null);
          setValidationError(null);
        }}
        onSelect={handleSourceSelect}
        sources={availableSources}
      />
    </div>
  );
}; 