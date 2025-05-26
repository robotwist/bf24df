import React, { useState, useEffect } from 'react';
import { FormNode, GraphData, Form as GraphForm } from '../../types/graph';
import { FieldType as ActualFieldType, Mapping as ServiceMapping, Field as ServiceField } from '../../types';
import { FieldMapping, MappingSource } from '../../types/mappings';
import { useMappings } from '../../hooks/useMappings';
import { ValidationService } from '../../services/validationService';
import { TransformationService } from '../../services/transformationService';
import { toTitleCase, formatFieldType } from '../../utils/formattingUtils';
import styles from '../../styles/MappingEditor.module.css';
import toastStyles from '../../styles/Toast.module.css';
import { useMappingState } from '../../hooks/useMappingState';
import { useToasts } from '../../hooks/useToasts';
import Toast from '../common/Toast';
import { Tooltip } from '../../components/common/Tooltip';
import { InfoIcon } from '../common/InfoIcon';

interface MappingEditorProps {
  formNode: FormNode;
  graphData: GraphData;
  onClose: () => void;
}

type MockDataType = {
  [key: string]: string | number | boolean | object | string[];
};

const MOCK_DATA: MockDataType = {
  string_field: 'Sample Text',
  number_field: 42,
  boolean_field: true,
  date_field: '2024-03-20',
  text_field: 'Long form text content',
  integer_field: 100,
  datetime_field: '2024-03-20T15:30:00Z',
  phone_field: '1234567890',
  email_field: 'test@example.com',
  // Generic type fallbacks
  'string': 'Default String Value',
  'number': 12345,
  'boolean': false,
  'date': '2023-01-15',
  'datetime': '2023-01-15T12:30:00Z',
  'object': { key: 'value' },
  'array': ['item1', 'item2'],
  'file': 'samplefile.pdf',
  'image': 'sampleimage.png',
  'select': 'OptionA',
  'multiselect': ['OptionA', 'OptionB'],
  'radio': 'Choice1',
  'checkbox': true,
  'url': 'https://example.com/path',
  'tel': '555-0199',
  'integer': 987,
  'float': 65.43
};

export const MappingEditor: React.FC<MappingEditorProps> = ({ 
  formNode,
  graphData,
  onClose 
}) => {
  // State declarations
  const [selectedSourceFormId, setSelectedSourceFormId] = useState<string>('');
  const [selectedSourceFieldId, setSelectedSourceFieldId] = useState<string>('');
  const [selectedTargetFieldId, setSelectedTargetFieldId] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{ source: string; transformed: string; transformationType: string; } | null>(null);
  const [sourceFields, setSourceFields] = useState<ServiceField[]>([]);
  const [targetFields, setTargetFields] = useState<ServiceField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransformationType, setSelectedTransformationType] = useState<string>('');
  const [transformationFormat, setTransformationFormat] = useState<string>('');
  const [availableTransformations, setAvailableTransformations] = useState<string[]>([]);
  
  // Custom hooks
  const {
    state: mappingState,
    addMapping,
    removeMapping,
    undo,
    redo
  } = useMappingState({
    formId: formNode?.id || '',
    onError: (err) => {
      addToast(err.message || 'An error occurred with mapping state.', 'error');
    }
  });

  const { getAvailableSources } = useMappings(graphData);
  const { toasts, addToast, removeToast } = useToasts();

  const getFormById = (formId: string): GraphForm | undefined => {
    return graphData.forms.find(f => f.id === formId);
  };

  const getFieldDetail = (fieldName: string, formId: string): ServiceField | undefined => {
    const currentForm = getFormById(formId);
    if (!currentForm?.field_schema?.properties) return undefined;
    const fieldSchema = currentForm.field_schema.properties[fieldName];
    if (!fieldSchema) return undefined;
    
    const displayName = fieldSchema.title ? toTitleCase(fieldSchema.title) : toTitleCase(fieldName);
    
    return {
      id: fieldName,
      name: displayName,
      type: (fieldSchema.type || 'string') as ActualFieldType,
    };
  };

  // Update target fields when formNode or graphData changes
  useEffect(() => {
    if (!formNode?.data?.component_id) return;
    
    const targetFormId = formNode.data.component_id;
    const currentTargetForm = getFormById(targetFormId);
    if (currentTargetForm?.field_schema?.properties) {
      const fields = Object.keys(currentTargetForm.field_schema.properties).map(fieldName => 
        getFieldDetail(fieldName, targetFormId)
      ).filter(f => f !== undefined) as ServiceField[];
      setTargetFields(fields);
    } else {
      setTargetFields([]);
    }
  }, [formNode, graphData.forms]);

  // Update preview when relevant states change
  useEffect(() => {
    if (!formNode?.data?.component_id) return;
    updatePreview();
  }, [selectedSourceFieldId, selectedTargetFieldId, selectedTransformationType, transformationFormat, selectedSourceFormId]);

  // Get available sources for the current form and target field
  const availableMappingSources = getAvailableSources(
    formNode.id,
    selectedTargetFieldId ? [selectedTargetFieldId] : []
  );

  // Get available transformations for the selected fields
  useEffect(() => {
    if (selectedSourceFieldId && selectedTargetFieldId) {
      const sourceField = getFieldDetail(selectedSourceFieldId, selectedSourceFormId);
      const targetField = getFieldDetail(selectedTargetFieldId, formNode.data.component_id);
      
      if (sourceField && targetField) {
        const transformations = TransformationService.getAvailableTransformations(
          sourceField.type,
          targetField.type
        );
        setAvailableTransformations(transformations);
      }
    }
  }, [selectedSourceFieldId, selectedTargetFieldId, selectedSourceFormId]);

  // If formNode is undefined, render a placeholder
  if (!formNode) {
    console.error('MappingEditor: formNode is undefined');
    return (
      <div className={styles.mappingEditor} data-testid="mapping-editor">
        <div className={styles.errorBanner}>
          <p>Error: Form data is not available</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const handleAddMapping = async () => {
    if (!selectedSourceFormId || !selectedSourceFieldId || !selectedTargetFieldId) {
      addToast("Please select source form, source field, and target field.", "error");
      return;
    }
    setIsLoading(true);

    try {
      const sourceField = getFieldDetail(selectedSourceFieldId, selectedSourceFormId);
      const targetField = getFieldDetail(selectedTargetFieldId, formNode.data.component_id);

      if (!sourceField || !targetField) {
        addToast("Could not find field schema for source or target.", "error");
        setIsLoading(false);
        return;
      }
      
      const mappingForValidation: ServiceMapping = {
        id: crypto.randomUUID(),
        targetFormId: formNode.data.component_id,
        targetField: targetField,
        sourceFormId: selectedSourceFormId,
        sourceField: sourceField,
      };

      const validationResult = ValidationService.validateMapping(mappingForValidation);

      if (!validationResult.isValid) {
        addToast(`Validation failed: ${validationResult.errors.join(', ')}`, "error");
        setIsLoading(false);
        return;
      }

      let transformationDetails;
      if (selectedTransformationType) {
        transformationDetails = {
          type: selectedTransformationType,
          format: transformationFormat || undefined,
        };
      }

      const fieldMappingToAdd: FieldMapping = {
        id: mappingForValidation.id,
        targetFormId: formNode.data.component_id,
        targetFieldId: selectedTargetFieldId,
        source: {
          type: 'direct',
          formId: selectedSourceFormId,
          fieldId: selectedSourceFieldId,
          label: `${getFormById(selectedSourceFormId)?.name || selectedSourceFormId} - ${sourceField.name}`
        },
        transformation: transformationDetails,
      };

      addMapping(fieldMappingToAdd);
      addToast("Mapping added successfully!", "success");
      setSelectedSourceFormId('');
      setSelectedSourceFieldId('');
      setSelectedTargetFieldId('');
      setPreviewData(null);
      setSourceFields([]);
      setSelectedTransformationType('');
      setTransformationFormat('');
      setAvailableTransformations([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add mapping';
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreview = () => {
    if (!selectedSourceFormId || !selectedSourceFieldId || !selectedTargetFieldId) {
      setPreviewData(null);
      return;
    }
    
    const sourceField = getFieldDetail(selectedSourceFieldId, selectedSourceFormId);
    const targetField = getFieldDetail(selectedTargetFieldId, formNode.data.component_id);

    if(!sourceField || !targetField) {
        setPreviewData(null);
        return;
    }

    // Ensure types are compatible before showing transformation preview
    const typesCompatible = ValidationService.validateFieldTypes(sourceField.type, targetField.type);
    if (!typesCompatible) {
        setPreviewData(null); 
        return;
    }
    
    const mockValue = MOCK_DATA[sourceField.id] || MOCK_DATA[sourceField.type as string] || `Sample ${sourceField.type}`;
    
    let transformedValue = mockValue; 
    let transformationAppliedMessage = "None";

    if (selectedTransformationType) {
        const mappingForTransform: ServiceMapping = {
            id: 'preview', 
            targetFormId: formNode.data.component_id, 
            targetField: targetField,
            sourceFormId: selectedSourceFormId,
            sourceField: sourceField,
            transformation: {
                type: selectedTransformationType,
                format: transformationFormat || undefined,
            }
        };
        try {
            transformedValue = TransformationService.transformValue(mockValue, mappingForTransform);
            transformationAppliedMessage = selectedTransformationType;
            if (transformationFormat) {
                transformationAppliedMessage += ` (Format: ${transformationFormat})`;
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
              transformedValue = `Error: ${e.message}`;
            } else {
              transformedValue = `Error: An unknown transformation error occurred`;
            }
            addToast(transformedValue, 'error');
            transformationAppliedMessage = `Error with ${selectedTransformationType}`;
            console.error("Transformation preview error:", e);
        }
    }
    
    setPreviewData({
      source: String(mockValue), // Ensure source is string for display
      transformed: String(transformedValue), // Ensure transformed is string
      transformationType: transformationAppliedMessage,
    });
  };

  const handleSourceFormChange = (sourceFormId: string) => {
    setSelectedSourceFormId(sourceFormId);
    setSelectedSourceFieldId(''); 
    setValidationError(null);
    setPreviewData(null);
    setAvailableTransformations([]);
    setSelectedTransformationType('');
    setTransformationFormat('');

    if (sourceFormId) {
      const sourceForm = getFormById(sourceFormId);
      if (sourceForm?.field_schema?.properties) {
        const fields = Object.keys(sourceForm.field_schema.properties).map(fieldName => 
          getFieldDetail(fieldName, sourceFormId)
        ).filter(f => f !== undefined) as ServiceField[];
        setSourceFields(fields);
      } else {
        setSourceFields([]);
      }
    } else {
      setSourceFields([]);
    }
    updatePreview(); // Call preview after state changes
  };

  const handleSourceFieldChange = (fieldId: string) => {
    setSelectedSourceFieldId(fieldId);
    setValidationError(null);
    // Reset transformation state as source field changed
    setAvailableTransformations([]);
    setSelectedTransformationType('');
    setTransformationFormat('');
    if (fieldId && selectedTargetFieldId && selectedSourceFormId) {
      validateFieldSelection(fieldId, selectedTargetFieldId, selectedSourceFormId);
      // updatePreview is called inside validateFieldSelection if types are compatible or after transformation changes
    } else {
      setPreviewData(null);
    }
    updatePreview(); // Call preview after state changes
  };

  const handleTargetFieldChange = (fieldId: string) => {
    setSelectedTargetFieldId(fieldId);
    setValidationError(null);
    // Reset transformation state as target field changed
    setAvailableTransformations([]);
    setSelectedTransformationType('');
    setTransformationFormat('');
    if (selectedSourceFieldId && fieldId && selectedSourceFormId) {
      validateFieldSelection(selectedSourceFieldId, fieldId, selectedSourceFormId);
      // updatePreview is called inside validateFieldSelection if types are compatible or after transformation changes
    } else {
      setPreviewData(null);
    }
    updatePreview(); // Call preview after state changes
  };

  const handleTransformationTypeChange = (type: string) => {
    setSelectedTransformationType(type);
    setTransformationFormat(''); // Reset format when type changes
    // updatePreview will be called because selectedTransformationType changed,
    // and useEffect watching it will trigger updatePreview.
    // For direct call:
    updatePreview();
  };

  const handleTransformationFormatChange = (format: string) => {
    setTransformationFormat(format);
    // updatePreview will be called because transformationFormat changed
    // For direct call:
    updatePreview();
  };
  
  const validateFieldSelection = (currentSourceFieldId: string, currentTargetFieldId: string, currentSourceFormIdVal: string) => {
    if(!currentSourceFieldId || !currentTargetFieldId || !currentSourceFormIdVal) {
        setAvailableTransformations([]);
        setSelectedTransformationType('');
        setTransformationFormat('');
        setPreviewData(null); // Clear preview if fields are not fully selected
        return;
    }

    const sourceField = getFieldDetail(currentSourceFieldId, currentSourceFormIdVal);
    const targetField = getFieldDetail(currentTargetFieldId, formNode.data.component_id);

    if (sourceField && targetField) {
      const typesCompatible = ValidationService.validateFieldTypes(sourceField.type, targetField.type);
      if (!typesCompatible) {
        const incompatibleMsg = `Incompatible field types: ${sourceField.name} (${sourceField.type}) cannot be mapped to ${targetField.name} (${targetField.type})`;
        setValidationError(incompatibleMsg);
        addToast(incompatibleMsg, "error");
        setAvailableTransformations([]);
        setSelectedTransformationType('');
      } else {
        setValidationError(null);
        // Fetch and set available transformations
        const transformations = TransformationService.getAvailableTransformations(sourceField.type, targetField.type);
        setAvailableTransformations(transformations);
        setSelectedTransformationType(''); // Reset selection when fields change
        setTransformationFormat('');
      }
    } else {
        const schemaErrorMsg = "Could not retrieve field schema for validation.";
        setValidationError(schemaErrorMsg);
        addToast(schemaErrorMsg, "error");
        setAvailableTransformations([]);
        setSelectedTransformationType('');
    }
    // updatePreview(); // updatePreview is now called via useEffect or direct calls in handlers
  };

  return (
    <div className={styles.mappingEditor} data-testid="mapping-editor">
      <div className={toastStyles.toastContainer}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onDismiss={removeToast}
          />
        ))}
      </div>

      <div className={styles.header}>
        <h2>Map Fields for {formNode.data.name}</h2>
        <button onClick={onClose} className={styles.closeButton}>&times;</button>
      </div>

      {validationError && (
        <div className={styles.errorBanner} data-testid="validation-error-message">
          <p>Validation Error: {validationError}</p>
          <button onClick={() => setValidationError(null)}>Dismiss</button>
        </div>
      )}

      <div className={styles.formSection}>
        <div className={styles.formGroup}>
          <div className="flex items-center gap-2">
            <label htmlFor="sourceForm" className="block text-sm font-medium text-gray-700">
              Source Form
            </label>
            <Tooltip content="Select the form that contains the source field you want to map from">
              <InfoIcon tooltipContent="Select the form that contains the source field you want to map from" />
            </Tooltip>
          </div>
          <select 
            id="sourceForm" 
            value={selectedSourceFormId} 
            onChange={(e) => handleSourceFormChange(e.target.value)}
            data-testid="source-form-select"
            className={styles.select}
          >
            <option value="">Select Source Form</option>
            {availableMappingSources
              .filter(source => source.type === 'direct' || source.type === 'transitive')
              .reduce((unique, source) => {
                if (!unique.some(s => s.formId === source.formId)) {
                  unique.push(source);
                }
                return unique;
              }, [] as MappingSource[])
              .map(source => {
                const form = getFormById(source.formId || '');
                return (
                  <option key={source.formId} value={source.formId}>
                    {form?.name || source.formId} ({source.type === 'direct' ? 'Direct' : 'Transitive'})
                  </option>
                );
              })}
          </select>
        </div>

        {selectedSourceFormId && (
          <div className={styles.formGroup}>
            <div className="flex items-center gap-2">
              <label htmlFor="sourceField" className="block text-sm font-medium text-gray-700">
                Source Field
              </label>
              <Tooltip content="Select the field from the source form that you want to map">
                <InfoIcon tooltipContent="Select the field from the source form that you want to map" />
              </Tooltip>
            </div>
            <select 
              id="sourceField" 
              value={selectedSourceFieldId} 
              onChange={(e) => handleSourceFieldChange(e.target.value)}
              data-testid="source-field-select"
              disabled={!sourceFields.length}
            >
              <option value="">Select Source Field</option>
              {sourceFields.map(field => {
                // field.name is already title-cased by getFieldDetail
                // We need the original schema to pass to formatFieldType
                const sourceForm = getFormById(selectedSourceFormId);
                const fieldSchema = sourceForm?.field_schema?.properties[field.id];
                const displayType = fieldSchema ? formatFieldType(fieldSchema) : toTitleCase(field.type);
                return (
                  <option key={field.id} value={field.id}>
                    {field.name} ({displayType})
                  </option>
                );
              })}
            </select>
            {!sourceFields.length && selectedSourceFormId && <small>No fields available or form schema not found.</small>}
          </div>
        )}

        <div className={styles.formGroup}>
          <div className="flex items-center gap-2">
            <label htmlFor="targetField" className="block text-sm font-medium text-gray-700">
              Target Field
            </label>
            <Tooltip content="Select the field in the current form that you want to map to">
              <InfoIcon tooltipContent="Select the field in the current form that you want to map to" />
            </Tooltip>
          </div>
          <select 
            id="targetField" 
            value={selectedTargetFieldId} 
            onChange={(e) => handleTargetFieldChange(e.target.value)}
            data-testid="target-field-select"
            disabled={!targetFields.length}
          >
            <option value="">Select Target Field</option>
            {targetFields.map(field => {
              // field.name is already title-cased by getFieldDetail
              const targetForm = getFormById(formNode.data.component_id);
              const fieldSchema = targetForm?.field_schema?.properties[field.id];
              const displayType = fieldSchema ? formatFieldType(fieldSchema) : toTitleCase(field.type);
              return (
                <option key={field.id} value={field.id}>
                  {field.name} ({displayType})
                </option>
              );
            })}
          </select>
          {!targetFields.length && <small>No fields available in target form.</small>}
        </div>

        {selectedSourceFieldId && selectedTargetFieldId && availableTransformations.length > 0 && !validationError && (
          <div className={styles.transformationSection}>
            <div className={styles.formGroup}>
              <div className="flex items-center gap-2">
                <label htmlFor="transformation" className="block text-sm font-medium text-gray-700">
                  Transformation
                </label>
                <Tooltip content="Select a transformation to apply to the source value before mapping">
                  <InfoIcon tooltipContent="Select a transformation to apply to the source value before mapping" />
                </Tooltip>
              </div>
              <select
                id="transformationType"
                value={selectedTransformationType}
                onChange={(e) => handleTransformationTypeChange(e.target.value)}
                data-testid="transformation-type-select"
              >
                <option value="">None</option>
                {availableTransformations.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            {/* Heuristic: Show format field if type includes 'Format', 'Date', or 'Number' and is selected. 
                Ideally, TransformationService would provide a method like `doesTransformationRequireFormat(type)`. */}
            {selectedTransformationType && 
             (selectedTransformationType.toLowerCase().includes('format') || 
              selectedTransformationType.toLowerCase().includes('date') ||
              selectedTransformationType.toLowerCase().includes('number') ||
              selectedTransformationType.toLowerCase().includes('case')) && ( 
              <div className={styles.formGroup}>
                <label htmlFor="transformationFormat">Format/Options:</label>
                <input
                  type="text"
                  id="transformationFormat"
                  value={transformationFormat}
                  onChange={(e) => handleTransformationFormatChange(e.target.value)}
                  placeholder={
                    selectedTransformationType.toLowerCase().includes('date') ? "e.g., YYYY-MM-DD" :
                    selectedTransformationType.toLowerCase().includes('number') ? "e.g., 2 (decimal places)" :
                    selectedTransformationType.toLowerCase().includes('case') ? "e.g., upper, lower, title" :
                    "Enter format string/options"
                  }
                  data-testid="transformation-format-input"
                />
              </div>
            )}
          </div>
        )}
        
        <button 
          onClick={handleAddMapping} 
          disabled={isLoading || !selectedSourceFieldId || !selectedTargetFieldId || !!validationError}
          className={`${styles.addButton} ${isLoading ? styles.loading : ''}`}
          data-testid="add-mapping-button"
        >
          {isLoading ? (
            <>
              <span className={styles.spinner}></span>
              Processing...
            </>
          ) : (
            'Add Mapping'
          )}
        </button>
      </div>

      {previewData && (
        <div className={styles.previewSection}>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-900">Preview</h3>
            <Tooltip content="See how your mapping will transform the data">
              <InfoIcon tooltipContent="See how your mapping will transform the data" />
            </Tooltip>
          </div>
          <p><strong>Source Value:</strong> {previewData.source}</p>
          <p><strong>Transformation Applied:</strong> {previewData.transformationType}</p>
          <p><strong>Resulting Value:</strong> {previewData.transformed}</p>
        </div>
      )}

      <div className={styles.mappingsList}>
        <h3>Current Mappings:</h3>
        {mappingState.currentMappings.length === 0 ? (
          <p>No mappings defined yet.</p>
        ) : (
          <ul>
            {mappingState.currentMappings.map(mapping => {
              // Get full field details for display names and types
              const sourceFieldOriginalDetail = getFieldDetail(mapping.source.fieldId, mapping.source.formId || '');
              const targetFieldOriginalDetail = getFieldDetail(mapping.targetFieldId, mapping.targetFormId);

              const sourceForm = getFormById(mapping.source.formId || '');
              const sourceFieldSchema = sourceForm?.field_schema?.properties[mapping.source.fieldId];
              const sourceDisplayType = sourceFieldSchema ? formatFieldType(sourceFieldSchema) : sourceFieldOriginalDetail ? toTitleCase(sourceFieldOriginalDetail.type) : 'Unknown Type';

              const targetForm = getFormById(mapping.targetFormId);
              const targetFieldSchema = targetForm?.field_schema?.properties[mapping.targetFieldId];
              const targetDisplayType = targetFieldSchema ? formatFieldType(targetFieldSchema) : targetFieldOriginalDetail ? toTitleCase(targetFieldOriginalDetail.type) : 'Unknown Type';

              const sourceFieldName = sourceFieldOriginalDetail?.name || toTitleCase(mapping.source.fieldId);
              const targetFieldName = targetFieldOriginalDetail?.name || toTitleCase(mapping.targetFieldId);
              
              const sourceFormName = mapping.source.formId ? (getFormById(mapping.source.formId)?.name || toTitleCase(mapping.source.formId)) : 'Global';
              const targetFormName = getFormById(mapping.targetFormId)?.name || toTitleCase(mapping.targetFormId);

              return (
                <li key={mapping.id} data-testid="mapping-item">
                  <span>
                    {sourceFieldName} ({sourceDisplayType} from {toTitleCase(sourceFormName)}) &rarr; {targetFieldName} ({targetDisplayType} from {toTitleCase(targetFormName)})
                    {mapping.transformation && ` (Transform: ${toTitleCase(mapping.transformation.type)}${mapping.transformation.format ? ` [${mapping.transformation.format}]` : ''})`}
                  </span>
                  <button onClick={() => removeMapping(mapping.id)} className={styles.removeButton}>Remove</button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      <div className={styles.footerControls}>
        <button onClick={undo} disabled={!mappingState.history.past.length || isLoading} data-testid="undo-button">Undo</button>
        <button onClick={redo} disabled={!mappingState.history.future.length || isLoading} data-testid="redo-button">Redo</button>
      </div>
      
    </div>
  );
}; 