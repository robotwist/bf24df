import { renderHook, act } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';
import { useMappingState } from '../../src/hooks/useMappingState';
import { MappingEditorState } from '../../src/types/mappings';
import { mappingService } from '../../src/lib/services/mappingService';

// Mock the mappingService
jest.mock('../../src/lib/services/mappingService', () => ({
  mappingService: {
    loadMappings: jest.fn().mockResolvedValue([]),
    saveMappings: jest.fn().mockResolvedValue(undefined)
  }
}));

describe('useMappingState', () => {
  const mockInitialState: MappingEditorState = {
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
  };

  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation for each test
    (mappingService.loadMappings as jest.Mock).mockResolvedValue([]);
    (mappingService.saveMappings as jest.Mock).mockResolvedValue(undefined);
  });

  it('should initialize with default state', async () => {
    const { result } = renderHook(() => useMappingState({ formId: 'test-form' }));
    
    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.state).toEqual(mockInitialState);
    });
  });

  it('should add a mapping', async () => {
    const { result } = renderHook(() => useMappingState({ formId: 'test-form' }));

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.state.currentMappings).toEqual([]);
    });

    const newMapping = {
      id: '1',
      targetFormId: 'form1',
      targetFieldId: 'field1',
      source: {
        type: 'direct',
        formId: 'form2',
        fieldId: 'field2',
        label: 'Field 2'
      }
    };

    await act(async () => {
      result.current.addMapping(newMapping);
    });

    await waitFor(() => {
      expect(result.current.state.currentMappings).toEqual([newMapping]);
      expect(result.current.state.history.past).toHaveLength(1);
      expect(result.current.state.history.present).toEqual([newMapping]);
      expect(result.current.state.history.future).toHaveLength(0);
    });
  });

  it('should remove a mapping', async () => {
    const { result } = renderHook(() => useMappingState({ formId: 'test-form' }));

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.state.currentMappings).toEqual([]);
    });

    const mapping = {
      id: '1',
      targetFormId: 'form1',
      targetFieldId: 'field1',
      source: {
        type: 'direct',
        formId: 'form2',
        fieldId: 'field2',
        label: 'Field 2'
      }
    };

    await act(async () => {
      result.current.addMapping(mapping);
    });

    await waitFor(() => {
      expect(result.current.state.currentMappings).toEqual([mapping]);
    });

    await act(async () => {
      result.current.removeMapping('1');
    });

    await waitFor(() => {
      expect(result.current.state.currentMappings).toHaveLength(0);
      expect(result.current.state.history.past).toHaveLength(2);
      expect(result.current.state.history.present).toHaveLength(0);
      expect(result.current.state.history.future).toHaveLength(0);
    });
  });

  it('should update a mapping', async () => {
    const { result } = renderHook(() => useMappingState({ formId: 'test-form' }));

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.state.currentMappings).toEqual([]);
    });

    const mapping = {
      id: '1',
      targetFormId: 'form1',
      targetFieldId: 'field1',
      source: {
        type: 'direct',
        formId: 'form2',
        fieldId: 'field2',
        label: 'Field 2'
      }
    };

    await act(async () => {
      result.current.addMapping(mapping);
    });

    await waitFor(() => {
      expect(result.current.state.currentMappings).toEqual([mapping]);
    });

    await act(async () => {
      result.current.updateMapping('1', { targetFieldId: 'field3' });
    });

    await waitFor(() => {
      expect(result.current.state.currentMappings[0].targetFieldId).toBe('field3');
      expect(result.current.state.history.past).toHaveLength(2);
      expect(result.current.state.history.present[0].targetFieldId).toBe('field3');
      expect(result.current.state.history.future).toHaveLength(0);
    });
  });

  it('should handle undo/redo', async () => {
    const { result } = renderHook(() => useMappingState({ formId: 'test-form' }));

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.state.currentMappings).toEqual([]);
    });

    const mapping1 = {
      id: '1',
      targetFormId: 'form1',
      targetFieldId: 'field1',
      source: {
        type: 'direct',
        formId: 'form2',
        fieldId: 'field2',
        label: 'Field 2'
      }
    };

    const mapping2 = {
      id: '2',
      targetFormId: 'form1',
      targetFieldId: 'field3',
      source: {
        type: 'direct',
        formId: 'form2',
        fieldId: 'field4',
        label: 'Field 4'
      }
    };

    await act(async () => {
      result.current.addMapping(mapping1);
    });

    await waitFor(() => {
      expect(result.current.state.currentMappings).toEqual([mapping1]);
    });

    await act(async () => {
      result.current.addMapping(mapping2);
    });

    await waitFor(() => {
      expect(result.current.state.currentMappings).toEqual([mapping1, mapping2]);
    });

    await act(async () => {
      result.current.undo();
    });

    await waitFor(() => {
      expect(result.current.state.currentMappings).toEqual([mapping1]);
      expect(result.current.state.history.past).toHaveLength(1);
      expect(result.current.state.history.present).toEqual([mapping1]);
      expect(result.current.state.history.future).toHaveLength(1);
    });

    await act(async () => {
      result.current.redo();
    });

    await waitFor(() => {
      expect(result.current.state.currentMappings).toEqual([mapping1, mapping2]);
      expect(result.current.state.history.past).toHaveLength(2);
      expect(result.current.state.history.present).toEqual([mapping1, mapping2]);
      expect(result.current.state.history.future).toHaveLength(0);
    });
  });

  it('should handle errors', async () => {
    const { result } = renderHook(() => useMappingState({ 
      formId: 'test-form',
      onError: mockOnError 
    }));

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.state.currentMappings).toEqual([]);
    });

    // Mock the saveMappings to throw an error
    (mappingService.saveMappings as jest.Mock).mockRejectedValueOnce(new Error('Save failed'));

    await act(async () => {
      result.current.addMapping({
        id: '1',
        targetFormId: 'form1',
        targetFieldId: 'field1',
        source: {
          type: 'direct',
          formId: 'form2',
          fieldId: 'field2',
          label: 'Field 2'
        }
      });
    });

    // Wait for the error to be handled
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
      expect(mockOnError.mock.calls[0][0].message).toBe('Save failed');
    });
  });
}); 