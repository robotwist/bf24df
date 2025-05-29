import { useState, useEffect } from 'react';
import { FormGraph, FormMappingSet } from '../types/forms';
import { AvantosService } from '../services/AvantosService';

export function useFormMappings(avantosService: AvantosService) {
  const [formGraph, setFormGraph] = useState<FormGraph | null>(null);
  const [mappings, setMappings] = useState<FormMappingSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFormGraph() {
      try {
        const graph = await avantosService.fetchFormGraph();
        setFormGraph(graph);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load form graph');
      } finally {
        setLoading(false);
      }
    }

    loadFormGraph();
  }, [avantosService]);

  const addMapping = (mappingSet: FormMappingSet) => {
    setMappings(prev => [...prev, mappingSet]);
  };

  const updateMapping = (index: number, mappingSet: FormMappingSet) => {
    setMappings(prev => {
      const newMappings = [...prev];
      newMappings[index] = mappingSet;
      return newMappings;
    });
  };

  const removeMapping = (index: number) => {
    setMappings(prev => prev.filter((_, i) => i !== index));
  };

  return {
    formGraph,
    mappings,
    loading,
    error,
    addMapping,
    updateMapping,
    removeMapping
  };
} 