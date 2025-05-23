import React, { useState } from 'react';
import { FormNode, GraphData } from '../../types/graph';
import { FieldMapping, MappingSource } from '../../types/mappings';
import { useMappings } from '../../hooks/useMappings';
import { SourceSelectorModal } from '../modals/SourceSelectorModal';
import { MappingStatus } from './MappingStatus';
import { getFieldSchema } from '../../lib/utils/validation';

interface MappingEditorProps {
  form: FormNode;
  graphData: GraphData;
  onClose: () => void;
}

export const MappingEditor: React.FC<MappingEditorProps> = ({ 
  form, 
  graphData,
  onClose 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
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

  return (
    <div className="mapping-editor">
      <div className="mapping-editor-header">
        <h3>Mappings for {form.name}</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}
      
      <div className="mappings-list">
        {formMappingsList.map(mapping => {
          const formSchema = graphData.forms.find(f => f.id === form.id)?.field_schema;
          const targetSchema = formSchema ? getFieldSchema(formSchema.properties, [mapping.targetFieldId]) : null;
          
          let sourceSchema;
          if (mapping.source.type === 'global') {
            sourceSchema = { type: 'string' };
          } else {
            const sourceForm = graphData.forms.find(f => f.id === mapping.source.formId)?.field_schema;
            sourceSchema = sourceForm ? getFieldSchema(sourceForm.properties, [mapping.source.fieldId]) : null;
          }

          return (
            <div key={mapping.id} className="mapping-item">
              <div className="mapping-info">
                <span className="target-field">{mapping.targetFieldId}</span>
                <span className="mapping-arrow">←</span>
                <span className="source-field">{mapping.source.label}</span>
              </div>

              {targetSchema && sourceSchema && (
                <MappingStatus
                  mapping={mapping}
                  sourceSchema={sourceSchema}
                  targetSchema={targetSchema}
                />
              )}

              <button 
                onClick={() => removeMapping(form.id, mapping.id)}
                className="remove-mapping"
              >
                Remove
              </button>
            </div>
          );
        })}
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