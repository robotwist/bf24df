import React, { useState, useEffect } from 'react';
import { useGraphData } from '../hooks/useGraphData';
import { GraphData, FormNode } from '../types/graph';
import { MappingEditor } from './mappings/MappingEditor';
import styles from '../styles/FormStructure.module.css';

const FormStructure: React.FC = () => {
  const { data, loading, error } = useGraphData('mockorg', 'mockblueprint');
  const [selectedForm, setSelectedForm] = useState<FormNode | null>(null);
  const [hoveredForm, setHoveredForm] = useState<string | null>(null);
  const [isMappingEditorOpen, setIsMappingEditorOpen] = useState(false);

  useEffect(() => {
    console.log('FormStructure state:', { loading, error, hasData: !!data });
  }, [loading, error, data]);

  const handleEditMappings = (form: FormNode) => {
    console.log('Edit Mappings clicked for form:', form);
    setSelectedForm(form);
  };

  const handleCloseMappingEditor = () => {
    setSelectedForm(null);
  };

  const renderGraphStats = (graphData: GraphData) => (
    <div className={styles.stats} data-testid="stats">
      <div className={styles.statCard}>
        <h4>Forms:</h4>
        <span className={styles.statValue}>{graphData.nodes.length}</span>
      </div>
      <div className={styles.statCard}>
        <h4>Dependencies:</h4>
        <span className={styles.statValue}>{graphData.edges.length}</span>
      </div>
      <div className={styles.statCard}>
        <h4>Total Fields:</h4>
        <span className={styles.statValue}>
          {graphData.nodes.reduce((acc, node) => 
            acc + Object.keys(node.data.input_mapping).length, 0
          )}
        </span>
      </div>
    </div>
  );

  const renderDAG = (graphData: GraphData) => (
    <div className={styles.dagContainer}>
      <h3>Form Dependencies</h3>
      <div className={styles.dag}>
        {graphData.nodes.map(node => (
          <div 
            key={node.id}
            className={`${styles.dagNode} ${
              selectedForm?.id === node.id ? styles.selected : ''
            } ${hoveredForm === node.id ? styles.hovered : ''}`}
            onClick={() => setSelectedForm(node)}
            onMouseEnter={() => setHoveredForm(node.id)}
            onMouseLeave={() => setHoveredForm(null)}
            data-testid="dag-node"
          >
            <div className={styles.nodeContent}>
              <h4>{node.data.name}</h4>
              <span className={styles.fieldCount}>
                {Object.keys(node.data.input_mapping).length} fields
              </span>
            </div>
            {node.data.prerequisites.length > 0 && (
              <div className={styles.dependencies}>
                {node.data.prerequisites.map(prereqId => {
                  const prereq = graphData.nodes.find(n => n.id === prereqId);
                  return (
                    <div 
                      key={prereqId}
                      className={`${styles.dependency} ${
                        hoveredForm === prereqId ? styles.hovered : ''
                      }`}
                    >
                      ← {prereq?.data.name || prereqId}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderFormDetails = (form: FormNode) => {
    // Find the form schema from the forms array
    const formSchema = data?.forms.find(f => f.id === form.data.component_id);
    
    return (
      <div className={styles.formDetails} data-testid="form-details">
        <h3 data-testid="form-name">{formSchema?.name || form.data.name}</h3>
        <p data-testid="form-description">{formSchema?.description || form.data.description}</p>
        <div className={styles.formInfo}>
          <div className={styles.infoSection}>
            <h4>Fields</h4>
            <ul>
              {formSchema?.field_schema?.properties && Object.entries(formSchema.field_schema.properties).map(([key, value]) => (
                <li key={key} data-testid="form-field">
                  <span className={styles.fieldName} data-testid="field-name">{key}</span>
                  <span className={styles.fieldType} data-testid="field-type">{value.type}</span>
                  <div className={styles.fieldProperties} data-testid="field-properties">
                    {value && typeof value === 'object' && Object.entries(value).map(([propKey, propValue]) => {
                      // Skip null values and format arrays/objects
                      if (propValue === null) return null;
                      const displayValue = Array.isArray(propValue) 
                        ? JSON.stringify(propValue)
                        : typeof propValue === 'object'
                          ? JSON.stringify(propValue)
                          : String(propValue);
                      return (
                        <span key={propKey} data-testid="field-property">
                          {propKey}: {displayValue}
                        </span>
                      );
                    })}
                  </div>
                  <div className={styles.validationRules} data-testid="validation-rules">
                    {formSchema.field_schema.required?.includes(key) && (
                      <span className={styles.validationRule} data-testid="validation-rule">required: true</span>
                    )}
                    {value.format && (
                      <span className={styles.validationRule} data-testid="validation-rule">format: {value.format}</span>
                    )}
                    {value.pattern && (
                      <span className={styles.validationRule} data-testid="validation-rule">pattern: {value.pattern}</span>
                    )}
                    {value.minLength && (
                      <span className={styles.validationRule} data-testid="validation-rule">minLength: {value.minLength}</span>
                    )}
                    {value.maxLength && (
                      <span className={styles.validationRule} data-testid="validation-rule">maxLength: {value.maxLength}</span>
                    )}
                    {value.minimum && (
                      <span className={styles.validationRule} data-testid="validation-rule">minimum: {value.minimum}</span>
                    )}
                    {value.maximum && (
                      <span className={styles.validationRule} data-testid="validation-rule">maximum: {value.maximum}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.infoSection}>
            <h4>Dependencies</h4>
            {form.data.prerequisites.length > 0 ? (
              <ul>
                {form.data.prerequisites.map(prereqId => {
                  const prereq = data?.nodes.find(n => n.id === prereqId);
                  return (
                    <li key={prereqId} data-testid="form-dependency">
                      {prereq?.data.name || prereqId}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No dependencies</p>
            )}
          </div>
        </div>
        <button 
          className={styles.editButton}
          onClick={() => setIsMappingEditorOpen(true)}
          data-testid="edit-mappings-button"
        >
          Edit Mappings
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading form structure...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h3>Error Loading Forms</h3>
        <p>{error instanceof Error ? error.message : String(error)}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.noData}>
        <h3>No Forms Available</h3>
        <p>There are no forms configured in this blueprint.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Form Structure</h1>
        <p className={styles.subtitle}>
          View and manage form dependencies and field mappings
        </p>
      </header>

      {renderGraphStats(data)}
      
      <div className={styles.mainContent}>
        <div className={styles.leftPanel}>
          {renderDAG(data)}
        </div>
        <div className={styles.rightPanel}>
          {selectedForm ? (
            renderFormDetails(selectedForm)
          ) : (
            <div className={styles.noSelection}>
              <p>Select a form to view details</p>
            </div>
          )}
        </div>
      </div>

      {isMappingEditorOpen && selectedForm && (
        <div className={styles.modal} data-testid="mapping-modal">
          <div className={styles.modalContent}>
            <button 
              className={styles.closeButton}
              onClick={() => setIsMappingEditorOpen(false)}
              data-testid="close-button"
            >
              ×
            </button>
            <MappingEditor
              formNode={selectedForm}
              graphData={data}
              onClose={() => setIsMappingEditorOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FormStructure; 