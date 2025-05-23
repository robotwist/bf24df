import React, { useState, useEffect } from 'react';
import { FormNode, GraphData } from '../../types/graph';
import { FieldMapping, MappingSource } from '../../types/mappings';
import { useMappings } from '../../hooks/useMappings';
import { SourceSelectorModal } from '../modals/SourceSelectorModal';
import { MappingStatus } from './MappingStatus';
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
const MOCK_DATA: Record<string, any> = {
  string_field: 'Sample Text',
  number_field: 42,
  boolean_field: true,
  date_field: '2024-03-20',
  text_field: 'Long form text content',
  integer_field: 100,
  datetime_field: '2024-03-20T15:30:00Z'
};

const transformValue = (value: any, sourceType: string, targetType: string): any => {
  if (sourceType === targetType) return value;

  try {
    switch (targetType) {
      case 'number':
      case 'integer':
        return Number(value);
      case 'boolean':
        return Boolean(value);
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

export const MappingEditor: React.FC<MappingEditorProps> = ({ 
  form, 
  graphData,
  onClose 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    raw: any;
    transformed: any;
  } | null>(null);
  
  const {
    formMappings,
    getAvailableSources,
    addMapping,
    removeMapping,
    updateMapping
  } = useMappings(graphData);

  const handleAddMapping = (fieldId: string) => {
    setSelectedField(fieldId);
    setIsModalOpen(true);
    setError(null);
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
        setError(err instanceof Error ? err.message : 'Failed to create mapping');
      }
    }
  };

  const formMappingsList = formMappings[form.id] || [];
  const availableSources = selectedField ? getAvailableSources(form.id, [selectedField]) : [];

  const getFieldType = (fieldName: string, formId: string): string => {
    const form = graphData.nodes.find(n => n.id === formId);
    if (!form) return 'string';
    return form.data.input_mapping[fieldName]?.type || 'string';
  };

  const validateFieldTypes = (sourceField: string, targetField: string) => {
    const sourceType = getFieldType(sourceField, selectedSource);
    const targetType = getFieldType(targetField, form.id);
    
    const sourceTypeInfo = FIELD_TYPES[sourceType];
    const targetTypeInfo = FIELD_TYPES[targetType];

    if (!sourceTypeInfo || !targetTypeInfo) {
      setValidationError('Unknown field type');
      return false;
    }

    if (!sourceTypeInfo.compatibleTypes.includes(targetType)) {
      setValidationError(`Incompatible field types: ${sourceType} cannot be mapped to ${targetType}`);
      return false;
    }

    setValidationError(null);
    return true;
  };

  const updatePreview = (sourceField: string, targetField: string) => {
    const sourceType = getFieldType(sourceField, selectedSource);
    const targetType = getFieldType(targetField, form.id);
    
    const rawValue = MOCK_DATA[sourceField] || 'No preview available';
    const transformedValue = transformValue(rawValue, sourceType, targetType);

    setPreviewData({
      raw: rawValue,
      transformed: transformedValue
    });
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSource(e.target.value);
    setValidationError(null);
    setPreviewData(null);
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTarget(e.target.value);
    if (selectedSource) {
      validateFieldTypes(selectedSource, e.target.value);
      updatePreview(selectedSource, e.target.value);
    }
  };

  return (
    <div className={styles.mappingEditor}>
      <div className={styles.header}>
        <h2>Edit Mappings for {form.data.name}</h2>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>

      <div className={styles.content}>
        <div className={styles.mappingForm}>
          <div className={styles.formGroup}>
            <label>Source Form</label>
            <select 
              value={selectedSource} 
              onChange={handleSourceChange}
              data-testid="source-form"
            >
              <option value="">Select a form...</option>
              {getAvailableSources(form.id, []).map(source => (
                <option key={source.formId} value={source.formId}>
                  {source.formId}
                </option>
              ))}
            </select>
          </div>

          {selectedSource && (
            <div className={styles.formGroup}>
              <label>Source Field</label>
              <select 
                value={selectedTarget} 
                onChange={handleTargetChange}
                data-testid="source-field"
              >
                <option value="">Select a field...</option>
                {getAvailableSources(form.id, [selectedTarget]).map(field => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
          )}

          {previewData && (
            <div className={styles.previewSection}>
              <h3>Data Preview</h3>
              <div className={styles.previewContent}>
                <div className={styles.previewItem}>
                  <label>Raw Value:</label>
                  <pre>{JSON.stringify(previewData.raw, null, 2)}</pre>
                </div>
                <div className={styles.previewItem}>
                  <label>Transformed Value:</label>
                  <pre>{JSON.stringify(previewData.transformed, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}

          {validationError && (
            <div className={styles.mappingError} data-testid="mapping-error">
              {validationError}
            </div>
          )}

          <div className={styles.actions}>
            <button 
              className={styles.saveButton}
              disabled={!!validationError || !selectedSource || !selectedTarget}
              onClick={() => {
                if (selectedSource && selectedTarget) {
                  handleAddMapping(selectedTarget);
                }
              }}
            >
              Save Mapping
            </button>
          </div>
        </div>
      </div>

      <SourceSelectorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedField(null);
          setError(null);
        }}
        onSelect={handleSourceSelect}
        sources={availableSources}
      />
    </div>
  );
}; 