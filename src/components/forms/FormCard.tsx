import React, { useState, useEffect } from 'react';
import { FormNode, GraphData } from '../../types/graph';
import { FormField, FormSchema } from '../../types/forms';
import { MappingEditor } from '../mappings/MappingEditor';
import { SourceSelectorModal } from '../modals/SourceSelectorModal';
import { getFieldSchema } from '../../lib/utils/validation';

interface FormCardProps {
  form: FormNode;
  graphData: GraphData;
}

export const FormCard: React.FC<FormCardProps> = ({ form, graphData }) => {
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);

  // Find the form schema from graphData
  const formSchema = graphData.forms.find(f => f.id === form.data.component_id)?.field_schema;
  
  // Debug: Log form data
  useEffect(() => {
    console.log('📋 Form Card Data:', {
      formId: form.id,
      formName: form.data.name,
      hasSchema: !!formSchema,
      fieldCount: formSchema ? Object.keys(formSchema.properties).length : 0,
      prerequisites: form.data.prerequisites
    });
  }, [form, formSchema]);
  
  if (!formSchema) {
    console.warn('⚠️ Form schema not found for:', form.id);
    return <div>Form schema not found</div>;
  }

  const renderField = (fieldId: string, schema: FormSchema['properties'][string], path: string[] = []) => {
    const currentPath = [...path, fieldId];
    const field: FormField = {
      id: fieldId,
      schema,
      path: currentPath
    };

    // Debug: Log field rendering
    console.log('🔤 Rendering field:', {
      fieldId,
      path: currentPath.join('.'),
      type: schema.type,
      hasDescription: !!schema.description,
      isNested: schema.type === 'object'
    });

    return (
      <div key={fieldId} className="form-field">
        <div className="field-header">
          <span className="field-name">{schema.title || fieldId}</span>
          <button 
            onClick={() => {
              console.log('🎯 Field selected for mapping:', field);
              setSelectedField(field);
              setIsMappingModalOpen(true);
            }}
          >
            Map Field
          </button>
        </div>
        
        {schema.description && (
          <div className="field-description">{schema.description}</div>
        )}

        {schema.type === 'object' && schema.properties && (
          <div className="nested-fields">
            {Object.entries(schema.properties).map(([nestedId, nestedSchema]) => 
              renderField(nestedId, nestedSchema, currentPath)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="form-card">
      <h3>{form.data.name}</h3>
      
      <div className="form-fields">
        {Object.entries(formSchema.properties).map(([fieldId, schema]) => 
          renderField(fieldId, schema)
        )}
      </div>

      <MappingEditor form={form} graphData={graphData} />

      {selectedField && (
        <SourceSelectorModal
          isOpen={isMappingModalOpen}
          onClose={() => {
            console.log('🚪 Closing source selector modal');
            setIsMappingModalOpen(false);
            setSelectedField(null);
          }}
          onSelect={(source) => {
            console.log('✅ Source selected:', source);
            // Handle mapping creation
            setIsMappingModalOpen(false);
            setSelectedField(null);
          }}
          sources={[]} // We'll populate this from the mapping hook
        />
      )}
    </div>
  );
}; 