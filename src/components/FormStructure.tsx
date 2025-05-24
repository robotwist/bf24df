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

  const renderFormDetails = (form: FormNode) => (
    <div className={styles.formDetails} data-testid="form-details">
      <h3>{form.data.name}</h3>
      <div className={styles.formInfo}>
        <div className={styles.infoSection}>
          <h4>Fields</h4>
          <ul>
            {Object.entries(form.data.input_mapping).map(([key, value]) => (
              <li key={key}>
                <span className={styles.fieldName}>{key}</span>
                <span className={styles.fieldType}>{typeof value}</span>
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
                  <li key={prereqId}>
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
      >
        Edit Mappings
      </button>
    </div>
  );

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
              <p>Select a form to view details and edit mappings</p>
            </div>
          )}
        </div>
      </div>
      
      {isMappingEditorOpen && selectedForm && data && (
        <div className={styles.mappingEditorContainer}>
          <MappingEditor 
            form={selectedForm} 
            graphData={data}
            onClose={handleCloseMappingEditor}
          />
        </div>
      )}
    </div>
  );
};

export default FormStructure; 