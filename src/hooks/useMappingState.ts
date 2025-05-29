import { useState, useCallback, useRef, useEffect } from 'react';
import { FieldMapping, FormNode, MappingSource } from '../types/mappings';
import { mappingService } from '../lib/services/mappingService';

// Define MappingEditorState and export it
export interface MappingEditorHistory {
  past: FieldMapping[][];
  present: FieldMapping[];
  future: FieldMapping[][];
}
export interface MappingEditorState {
  selectedForm: FormNode | null;
  availableSources: MappingSource[];
  currentMappings: FieldMapping[];
  isModalOpen: boolean;
  selectedTargetField: string | null;
  history: MappingEditorHistory;
}

interface UseMappingStateProps {
  formId: string;
  onError?: (error: Error) => void;
}

export const useMappingState = ({ formId, onError }: UseMappingStateProps) => {
  const [state, setState] = useState<MappingEditorState>({
    selectedForm: null,
    availableSources: [],
    currentMappings: [],
    isModalOpen: false,
    selectedTargetField: null,
    history: {
      past: [],
      present: [],
      future: []
    }
  });

  const isInitialMount = useRef(true);

  useEffect(() => {
    const loadInitialMappings = async () => {
      try {
        const loadedMappings = await mappingService.loadMappings(formId);
        setState(prev => ({
          ...prev,
          currentMappings: loadedMappings,
          history: {
            past: [],
            present: loadedMappings,
            future: []
          }
        }));
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('Failed to load mappings'));
      }
    };

    if (isInitialMount.current) {
      loadInitialMappings();
      isInitialMount.current = false;
    }
  }, [formId, onError]);

  useEffect(() => {
    if (!isInitialMount.current) {
      const saveMappings = async () => {
        try {
          await mappingService.saveMappings(formId, state.currentMappings);
        } catch (error) {
          onError?.(error instanceof Error ? error : new Error('Failed to save mappings'));
        }
      };
      saveMappings();
    }
  }, [formId, state.currentMappings, onError]);

  const addMapping = useCallback((mapping: FieldMapping) => {
    setState(prev => {
      const newPresent = [...prev.currentMappings, mapping];
      return {
        ...prev,
        currentMappings: newPresent,
        history: {
          past: [...prev.history.past, prev.currentMappings],
          present: newPresent,
          future: []
        }
      };
    });
  }, []);

  const removeMapping = useCallback((mappingId: string) => {
    setState(prev => {
      const newPresent = prev.currentMappings.filter(m => m.id !== mappingId);
      return {
        ...prev,
        currentMappings: newPresent,
        history: {
          past: [...prev.history.past, prev.currentMappings],
          present: newPresent,
          future: []
        }
      };
    });
  }, []);

  const updateMapping = useCallback((mappingId: string, updates: Partial<FieldMapping>) => {
    setState(prev => {
      const newPresent = prev.currentMappings.map(m =>
        m.id === mappingId ? { ...m, ...updates } : m
      );
      return {
        ...prev,
        currentMappings: newPresent,
        history: {
          past: [...prev.history.past, prev.currentMappings],
          present: newPresent,
          future: []
        }
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.history.past.length === 0) return prev;
      const newPresent = prev.history.past[prev.history.past.length - 1];
      const newPast = prev.history.past.slice(0, -1);
      return {
        ...prev,
        currentMappings: newPresent,
        history: {
          past: newPast,
          present: newPresent,
          future: [prev.currentMappings, ...prev.history.future]
        }
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.history.future.length === 0) return prev;
      const newPresent = prev.history.future[0];
      const newFuture = prev.history.future.slice(1);
      return {
        ...prev,
        currentMappings: newPresent,
        history: {
          past: [...prev.history.past, prev.currentMappings],
          present: newPresent,
          future: newFuture
        }
      };
    });
  }, []);

  return {
    state,
    addMapping,
    removeMapping,
    updateMapping,
    undo,
    redo
  };
}; 