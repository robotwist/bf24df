import { useState, useCallback, useEffect } from 'react';
import { GraphData } from '../types/graph';
import { FieldMapping, MappingSource } from '../types/mappings';

export const useMappings = (graphData: GraphData | null) => {
  const [formMappings, setFormMappings] = useState<Record<string, FieldMapping[]>>({});

  const getTransitiveDependencies = useCallback((formId: string): string[] => {
    if (!graphData) return [];

    const visited = new Set<string>();
    const dependencies = new Set<string>();

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = graphData.nodes.find(n => n.id === nodeId);
      if (!node) return;

      node.data.prerequisites.forEach(prereqId => {
        dependencies.add(prereqId);
        traverse(prereqId);
      });
    };

    traverse(formId);
    return Array.from(dependencies);
  }, [graphData]);

  const getAvailableSources = useCallback((formId: string, targetFieldPath: string[]): MappingSource[] => {
    if (!graphData) return [];

    const sources: MappingSource[] = [];
    const formNode = graphData.nodes.find(node => node.id === formId);
    
    if (!formNode) return sources;

    // Get all dependencies (direct and transitive)
    const allDependencies = getTransitiveDependencies(formId);
    
    // Sort dependencies by distance (direct first, then transitive)
    const directDeps = formNode.data.prerequisites;
    const transitiveDeps = allDependencies.filter(dep => !directDeps.includes(dep));

    // Add direct dependencies first
    directDeps.forEach(prereqId => {
      const prereqNode = graphData.nodes.find(node => node.id === prereqId);
      if (prereqNode) {
        const form = graphData.forms.find(f => f.id === prereqNode.data.component_id);
        if (form?.field_schema?.properties) {
          Object.entries(form.field_schema.properties).forEach(([fieldId, schema]) => {
            sources.push({
              type: 'direct',
              formId: prereqId,
              fieldId,
              label: `${prereqNode.data.name || 'Unknown Form'} - ${schema.title || fieldId}`
            });
          });
        }
      }
    });

    // Add transitive dependencies
    transitiveDeps.forEach(prereqId => {
      const prereqNode = graphData.nodes.find(node => node.id === prereqId);
      if (prereqNode) {
        const form = graphData.forms.find(f => f.id === prereqNode.data.component_id);
        if (form?.field_schema?.properties) {
          Object.entries(form.field_schema.properties).forEach(([fieldId, schema]) => {
            sources.push({
              type: 'transitive',
              formId: prereqId,
              fieldId,
              label: `${prereqNode.data.name || 'Unknown Form'} - ${schema.title || fieldId}`
            });
          });
        }
      }
    });

    // Add global sources
    sources.push({
      type: 'global',
      fieldId: 'user.name',
      label: 'User Name'
    });
    sources.push({
      type: 'global',
      fieldId: 'user.email',
      label: 'User Email'
    });

    return sources;
  }, [graphData, getTransitiveDependencies]);

  const addMapping = useCallback((formId: string, mapping: FieldMapping) => {
    setFormMappings(prev => ({
      ...prev,
      [formId]: [...(prev[formId] || []), mapping]
    }));
  }, []);

  const removeMapping = useCallback((formId: string, mappingId: string) => {
    setFormMappings(prev => ({
      ...prev,
      [formId]: (prev[formId] || []).filter(m => m.id !== mappingId)
    }));
  }, []);

  const updateMapping = useCallback((formId: string, mappingId: string, source: MappingSource) => {
    setFormMappings(prev => ({
      ...prev,
      [formId]: (prev[formId] || []).map(m => 
        m.id === mappingId ? { ...m, source } : m
      )
    }));
  }, []);

  return {
    formMappings,
    getAvailableSources,
    addMapping,
    removeMapping,
    updateMapping
  };
}; 