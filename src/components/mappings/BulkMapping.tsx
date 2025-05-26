import React, { useState } from 'react';
import { FormNode, GraphData } from '../../types/graph';
import { FieldMapping } from '../../types/mappings';
import { useMappings } from '../../hooks/useMappings';
import { ValidationService } from '../../services/validationService';
import { TransformationService } from '../../services/transformationService';
import { toTitleCase, formatFieldType } from '../../utils/formattingUtils';
import styles from '../../styles/BulkMapping.module.css';

interface BulkMappingProps {
  formNode: FormNode;
  graphData: GraphData;
  onClose: () => void;
}

interface MappingTemplate {
  id: string;
  name: string;
  description: string;
  mappings: {
    sourceField: string;
    targetField: string;
    transformation?: {
      type: string;
      format?: string;
    };
  }[];
}

const DEFAULT_TEMPLATES: MappingTemplate[] = [
  {
    id: 'contact-info',
    name: 'Contact Information',
    description: 'Maps common contact fields like name, email, phone',
    mappings: [
      { sourceField: 'firstName', targetField: 'first_name' },
      { sourceField: 'lastName', targetField: 'last_name' },
      { sourceField: 'email', targetField: 'email_address' },
      { sourceField: 'phone', targetField: 'phone_number' }
    ]
  },
  {
    id: 'address',
    name: 'Address Fields',
    description: 'Maps address-related fields',
    mappings: [
      { sourceField: 'street', targetField: 'address_line_1' },
      { sourceField: 'city', targetField: 'city' },
      { sourceField: 'state', targetField: 'state' },
      { sourceField: 'zip', targetField: 'postal_code' }
    ]
  }
];

export const BulkMapping: React.FC<BulkMappingProps> = ({ formNode, graphData, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMappings, setCustomMappings] = useState<FieldMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mappingStatus, setMappingStatus] = useState<{[key: string]: 'pending' | 'ready' | 'applied'}>(
    Object.fromEntries(customMappings.map(m => [m.id, 'pending']))
  );

  const { addMapping } = useMappings(graphData);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      // Convert template mappings to FieldMapping format
      const mappings = template.mappings.map(mapping => ({
        id: crypto.randomUUID(),
        targetFormId: formNode.data.component_id,
        targetFieldId: mapping.targetField,
        source: {
          type: 'direct',
          formId: '', // Will be set by user
          fieldId: mapping.sourceField,
          label: mapping.sourceField
        },
        transformation: mapping.transformation
      }));
      setCustomMappings(mappings);
    }
  };

  const handleSourceFormSelect = (mappingId: string, sourceFormId: string) => {
    setCustomMappings(prev => prev.map(mapping => 
      mapping.id === mappingId
        ? {
            ...mapping,
            source: {
              ...mapping.source,
              formId: sourceFormId,
              label: `${graphData.nodes.find(n => n.id === sourceFormId)?.data.name || 'Unknown Form'} - ${mapping.source.fieldId}`
            }
          }
        : mapping
    ));
    setMappingStatus(prev => ({
      ...prev,
      [mappingId]: sourceFormId ? 'ready' : 'pending'
    }));
  };

  // Get valid source forms based on prerequisites
  const getValidSourceForms = () => {
    // Get direct prerequisites
    const directPrereqs = formNode.data.prerequisites;
    
    // Get transitive prerequisites
    const transitivePrereqs = new Set<string>();
    const visited = new Set<string>();
    
    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = graphData.nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      node.data.prerequisites.forEach(prereqId => {
        if (!directPrereqs.includes(prereqId)) {
          transitivePrereqs.add(prereqId);
        }
        traverse(prereqId);
      });
    };
    
    directPrereqs.forEach(traverse);
    
    return [
      ...directPrereqs.map(id => ({
        id,
        name: graphData.nodes.find(n => n.id === id)?.data.name || 'Unknown Form',
        type: 'direct'
      })),
      ...Array.from(transitivePrereqs).map(id => ({
        id,
        name: graphData.nodes.find(n => n.id === id)?.data.name || 'Unknown Form',
        type: 'transitive'
      }))
    ];
  };

  const handleApplyMappings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate all mappings
      for (const mapping of customMappings) {
        const validationResult = ValidationService.validateMapping({
          id: mapping.id,
          targetFormId: mapping.targetFormId,
          targetField: {
            id: mapping.targetFieldId,
            name: toTitleCase(mapping.targetFieldId),
            type: 'string'
          },
          sourceFormId: mapping.source.formId || '',
          sourceField: {
            id: mapping.source.fieldId,
            name: toTitleCase(mapping.source.fieldId),
            type: 'string'
          },
          transformation: mapping.transformation
        });

        if (!validationResult.isValid) {
          throw new Error(`Validation failed for mapping ${mapping.targetFieldId}: ${validationResult.errors.join(', ')}`);
        }
      }

      // Apply all mappings
      for (const mapping of customMappings) {
        await addMapping(mapping.targetFormId, mapping);
        setMappingStatus(prev => ({
          ...prev,
          [mapping.id]: 'applied'
        }));
      }

      // Show success message
      setError('Mappings applied successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply mappings');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMappingSummary = () => {
    const readyCount = Object.values(mappingStatus).filter(s => s === 'ready').length;
    const appliedCount = Object.values(mappingStatus).filter(s => s === 'applied').length;
    const totalCount = customMappings.length;

    return (
      <div className={styles.mappingSummary}>
        <h3>Mapping Summary</h3>
        <div className={styles.summaryStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Mappings:</span>
            <span className={styles.statValue}>{totalCount}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Ready to Apply:</span>
            <span className={styles.statValue}>{readyCount}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Applied:</span>
            <span className={styles.statValue}>{appliedCount}</span>
          </div>
        </div>
        <div className={styles.mappingFlow}>
          {customMappings.map(mapping => {
            const sourceForm = graphData.nodes.find(n => n.id === mapping.source.formId);
            const status = mappingStatus[mapping.id];
            
            return (
              <div key={mapping.id} className={`${styles.flowItem} ${styles[status]}`}>
                <div className={styles.flowSource}>
                  {sourceForm ? (
                    <>
                      <span className={styles.formName}>{sourceForm.data.name}</span>
                      <span className={styles.fieldName}>{mapping.source.fieldId}</span>
                    </>
                  ) : (
                    <span className={styles.placeholder}>Select source form</span>
                  )}
                </div>
                <div className={styles.flowArrow}>→</div>
                <div className={styles.flowTarget}>
                  <span className={styles.formName}>{formNode.data.name}</span>
                  <span className={styles.fieldName}>{mapping.targetFieldId}</span>
                </div>
                <div className={styles.flowStatus}>
                  {status === 'pending' && 'Pending'}
                  {status === 'ready' && 'Ready'}
                  {status === 'applied' && 'Applied'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.bulkMapping}>
      <div className={styles.header}>
        <h2>Bulk Field Mapping</h2>
        <button onClick={onClose} className={styles.closeButton}>&times;</button>
      </div>

      <div className={styles.content}>
        <div className={styles.templateSection}>
          <h3>Choose a Template</h3>
          <div className={styles.templateGrid}>
            {DEFAULT_TEMPLATES.map(template => (
              <button
                key={template.id}
                className={`${styles.templateButton} ${selectedTemplate === template.id ? styles.selected : ''}`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <h4>{template.name}</h4>
                <p>{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {selectedTemplate && (
          <>
            <div className={styles.mappingsSection}>
              <h3>Review Mappings</h3>
              <div className={styles.mappingsList}>
                {customMappings.map(mapping => (
                  <div key={mapping.id} className={styles.mappingItem}>
                    <div className={styles.mappingInfo}>
                      <span className={styles.targetField}>
                        {toTitleCase(mapping.targetFieldId)}
                      </span>
                      <span className={styles.mappingArrow}>←</span>
                      <span className={styles.sourceField}>
                        {toTitleCase(mapping.source.fieldId)}
                      </span>
                    </div>
                    <select
                      value={mapping.source.formId}
                      onChange={(e) => handleSourceFormSelect(mapping.id, e.target.value)}
                      className={styles.select}
                    >
                      <option value="">Select Source Form</option>
                      {getValidSourceForms().map(form => (
                        <option key={form.id} value={form.id}>
                          {form.name} ({form.type === 'direct' ? 'Direct' : 'Transitive'})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {renderMappingSummary()}
          </>
        )}

        {error && (
          <div className={`${styles.message} ${error.includes('successfully') ? styles.success : styles.error}`}>
            {error}
          </div>
        )}

        <div className={styles.actions}>
          <button
            onClick={handleApplyMappings}
            disabled={isLoading || !selectedTemplate || customMappings.some(m => !m.source.formId)}
            className={styles.applyButton}
          >
            {isLoading ? 'Applying...' : 'Apply Mappings'}
          </button>
        </div>
      </div>
    </div>
  );
}; 