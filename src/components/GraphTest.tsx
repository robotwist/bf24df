import React, { useState, useEffect } from 'react';
import { useGraphData } from '../hooks/useGraphData';
import { GraphData, FormNode } from '../types/graph';
import { MappingEditor } from './mappings/MappingEditor';
import styles from '../styles/FormStructure.module.css';

const FormStructure: React.FC = () => {
  const { data, loading, error } = useGraphData('mockorg', 'mockblueprint');
  const [selectedForm, setSelectedForm] = useState<FormNode | null>(null);

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
    <div className={styles.stats}>
      <div className={styles.statCard}>
        <h4>Forms</h4>
        <span className={styles.statValue}>{graphData.nodes.length}</span>
      </div>
      <div className={styles.statCard}>
        <h4>Dependencies</h4>
        <span className={styles.statValue}>{graphData.edges.length}</span>
      </div>
      <div className={styles.statCard}>
        <h4>Total Fields</h4>
        <span className={styles.statValue}>
          {graphData.nodes.reduce((acc, node) => 
            acc + Object.keys(node.data.input_mapping).length, 0
          )}
        </span>
      </div>
    </div>
  );

  const renderFormList = (graphData: GraphData) => (
    <div className={styles.formList}>
      <h3>Forms</h3>
      <div className={styles.formGrid}>
        {graphData.nodes.map(node => (
          <div key={node.id} className={styles.formCard}>
            <div className={styles.formHeader}>
              <h4>{node.data.name}</h4>
              <span className={styles.fieldCount}>
                {Object.keys(node.data.input_mapping).length} fields
              </span>
            </div>
            <div className={styles.formDependencies}>
              {node.data.prerequisites.length > 0 ? (
                <div className={styles.dependencyList}>
                  <span className={styles.dependencyLabel}>Depends on:</span>
                  {node.data.prerequisites.map((prereqId: string) => {
                    const prereq = graphData.nodes.find(n => n.id === prereqId);
                    return (
                      <span key={prereqId} className={styles.dependency}>
                        {prereq?.data.name || prereqId}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className={styles.noDependencies}>No dependencies</span>
              )}
            </div>
            <button 
              className={styles.editButton}
              onClick={() => handleEditMappings(node)}
            >
              Edit Mappings
            </button>
          </div>
        ))}
      </div>
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
      {renderFormList(data)}
      
      {selectedForm && data && (
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