import React, { useState, useEffect } from 'react';
import { useGraphData } from '../hooks/useGraphData';
import { GraphData, FormNode } from '../types/graph';
import { MappingEditor } from './mappings/MappingEditor';

const GraphTest: React.FC = () => {
  const { data, loading, error } = useGraphData('mockorg', 'mockblueprint');
  const [selectedForm, setSelectedForm] = useState<FormNode | null>(null);

  useEffect(() => {
    console.log('GraphTest state:', { loading, error, hasData: !!data });
  }, [loading, error, data]);

  const handleEditMappings = (form: FormNode) => {
    console.log('Edit Mappings clicked for form:', form);
    setSelectedForm(form);
  };

  const handleCloseMappingEditor = () => {
    setSelectedForm(null);
  };

  const renderGraphStats = (graphData: GraphData) => {
    console.log('Rendering graph stats with data:', graphData);
    return (
      <div className="graph-stats">
        <h3>Graph Structure</h3>
        <ul>
          <li>Nodes: {graphData.nodes.length}</li>
          <li>Forms: {graphData.forms.length}</li>
          <li>Edges: {graphData.edges.length}</li>
        </ul>
      </div>
    );
  };

  const renderFormList = (graphData: GraphData) => (
    <div className="form-list">
      <h3>Forms</h3>
      <ul>
        {graphData.forms.map(form => (
          <li key={form.id} className="form-item">
            <strong>{form.name}</strong>
            <span>Fields: {Object.keys(form.field_schema.properties).length}</span>
            <button 
              className="edit-mappings"
              onClick={() => handleEditMappings(form)}
            >
              Edit Mappings
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderDependencyGraph = (graphData: GraphData) => (
    <div className="dependency-graph">
      <h3>Dependencies</h3>
      <ul>
        {graphData.nodes.map(node => (
          <li key={node.id}>
            <strong>{node.data.name}</strong>
            {node.data.prerequisites.length > 0 ? (
              <ul>
                {node.data.prerequisites.map(prereqId => {
                  const prereq = graphData.nodes.find(n => n.id === prereqId);
                  return (
                    <li key={prereqId}>
                      ← {prereq?.data.name || prereqId}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <span> (No dependencies)</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  if (loading) {
    console.log('Rendering loading state');
    return <div className="loading">Loading graph data...</div>;
  }
  if (error) {
    console.log('Rendering error state:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    } else {
      console.error('Error details (non-Error object):', error);
    }
    return <div className="error">Error: {error.message || String(error)}</div>;
  }
  if (!data) {
    console.log('Rendering no data state');
    return <div className="no-data">No data available</div>;
  }

  console.log('Rendering full component with data');
  return (
    <div className="graph-test">
      <h2>Graph Data Test</h2>
      {renderGraphStats(data)}
      {renderFormList(data)}
      {renderDependencyGraph(data)}
      
      {selectedForm && data && (
        <div className="mapping-editor-container">
          <MappingEditor 
            form={selectedForm} 
            graphData={data}
            onClose={handleCloseMappingEditor}
          />
        </div>
      )}
      
      <div className="raw-data">
        <h3>Raw Data</h3>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
};

export default GraphTest; 