import { useState, useCallback, useEffect } from 'react';
import { FormNode, GraphData } from '../types/graph';
import { FieldMapping, MappingSource, SourceType } from '../types/mappings';
import { getFieldSchema } from '../lib/utils/validation';

export const useMappings = (graphData: GraphData | null) => {
  const [formMappings, setFormMappings] = useState<Record<string, FieldMapping[]>>({});

  // Debug: Log graph data changes
  useEffect(() => {
    if (graphData) {
      console.log('🔍 Graph Data Updated:', {
        nodeCount: graphData.nodes.length,
        formCount: graphData.forms.length,
        edgeCount: graphData.edges.length
      });
    }
  }, [graphData]);

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
    const result = Array.from(dependencies);
    
    // Debug: Log dependency resolution
    console.log('🔗 Dependencies for form:', formId, {
      direct: graphData.nodes.find(n => n.id === formId)?.data.prerequisites || [],
      transitive: result
    });
    
    return result;
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
        if (form) {
          Object.entries(form.field_schema.properties).forEach(([fieldId, schema]) => {
            sources.push({
              type: 'direct',
              formId: prereqId,
              fieldId,
              label: `${prereqNode.data.name} - ${schema.title || fieldId}`
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
        if (form) {
          Object.entries(form.field_schema.properties).forEach(([fieldId, schema]) => {
            sources.push({
              type: 'transitive',
              formId: prereqId,
              fieldId,
              label: `${prereqNode.data.name} - ${schema.title || fieldId}`
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

    // Debug: Log available sources
    console.log('🎯 Available sources for form:', formId, {
      targetField: targetFieldPath.join('.'),
      sourceCount: sources.length,
      byType: {
        direct: sources.filter(s => s.type === 'direct').length,
        transitive: sources.filter(s => s.type === 'transitive').length,
        global: sources.filter(s => s.type === 'global').length
      }
    });

    return sources;
  }, [graphData, getTransitiveDependencies]);

  // Debug: Log mapping changes
  useEffect(() => {
    console.log('📝 Current mappings:', {
      formCount: Object.keys(formMappings).length,
      totalMappings: Object.values(formMappings).reduce((sum, arr) => sum + arr.length, 0)
    });
  }, [formMappings]);

  const addMapping = useCallback((formId: string, mapping: FieldMapping) => {
    setFormMappings(prev => {
      const newMappings = {
        ...prev,
        [formId]: [...(prev[formId] || []), mapping]
      };
      console.log('➕ Added mapping:', { formId, mapping });
      return newMappings;
    });
  }, []);

  const removeMapping = useCallback((formId: string, mappingId: string) => {
    setFormMappings(prev => {
      const newMappings = {
        ...prev,
        [formId]: (prev[formId] || []).filter(m => m.id !== mappingId)
      };
      console.log('➖ Removed mapping:', { formId, mappingId });
      return newMappings;
    });
  }, []);

  const updateMapping = useCallback((formId: string, mappingId: string, source: MappingSource) => {
    setFormMappings(prev => {
      const newMappings = {
        ...prev,
        [formId]: (prev[formId] || []).map(m => 
          m.id === mappingId ? { ...m, source } : m
        )
      };
      console.log('🔄 Updated mapping:', { formId, mappingId, source });
      return newMappings;
    });
  }, []);

  return {
    formMappings,
    getAvailableSources,
    addMapping,
    removeMapping,
    updateMapping
  };
}; 