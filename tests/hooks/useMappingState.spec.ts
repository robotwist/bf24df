import { renderHook, act } from '@testing-library/react-hooks';
import { useMappingState } from '../../src/hooks/useMappingState';
import { FieldMapping } from '../../src/types/mappings';

describe('useMappingState', () => {
  const mockFormId = 'test-form';
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useMappingState({ formId: mockFormId, onError: mockOnError }));

    expect(result.current.state.currentMappings).toHaveLength(0);
    expect(result.current.state.history.past).toHaveLength(0);
    expect(result.current.state.history.future).toHaveLength(0);
  });

  it('should add a mapping', () => {
    const { result } = renderHook(() => useMappingState({ formId: mockFormId, onError: mockOnError }));

    const newMapping: FieldMapping = {
      id: 'test-mapping',
      targetFormId: 'form-1',
      targetFieldId: 'field-1',
      source: {
        type: 'direct',
        formId: 'form-2',
        fieldId: 'field-2',
        label: 'Test Field'
      }
    };

    act(() => {
      result.current.addMapping(newMapping);
    });

    expect(result.current.state.currentMappings).toHaveLength(1);
    expect(result.current.state.currentMappings[0]).toEqual(newMapping);
    expect(result.current.state.history.past).toHaveLength(1);
    expect(result.current.state.history.future).toHaveLength(0);
  });

  it('should remove a mapping', () => {
    const { result } = renderHook(() => useMappingState({ formId: mockFormId, onError: mockOnError }));

    const mapping: FieldMapping = {
      id: 'test-mapping',
      targetFormId: 'form-1',
      targetFieldId: 'field-1',
      source: {
        type: 'direct',
        formId: 'form-2',
        fieldId: 'field-2',
        label: 'Test Field'
      }
    };

    act(() => {
      result.current.addMapping(mapping);
      result.current.removeMapping(mapping.id);
    });

    expect(result.current.state.currentMappings).toHaveLength(0);
    expect(result.current.state.history.past).toHaveLength(2);
    expect(result.current.state.history.future).toHaveLength(0);
  });

  it('should handle undo operation', () => {
    const { result } = renderHook(() => useMappingState({ formId: mockFormId, onError: mockOnError }));

    const mapping: FieldMapping = {
      id: 'test-mapping',
      targetFormId: 'form-1',
      targetFieldId: 'field-1',
      source: {
        type: 'direct',
        formId: 'form-2',
        fieldId: 'field-2',
        label: 'Test Field'
      }
    };

    act(() => {
      result.current.addMapping(mapping);
      result.current.undo();
    });

    expect(result.current.state.currentMappings).toHaveLength(0);
    expect(result.current.state.history.past).toHaveLength(0);
    expect(result.current.state.history.future).toHaveLength(1);
  });

  it('should handle redo operation', () => {
    const { result } = renderHook(() => useMappingState({ formId: mockFormId, onError: mockOnError }));

    const mapping: FieldMapping = {
      id: 'test-mapping',
      targetFormId: 'form-1',
      targetFieldId: 'field-1',
      source: {
        type: 'direct',
        formId: 'form-2',
        fieldId: 'field-2',
        label: 'Test Field'
      }
    };

    act(() => {
      result.current.addMapping(mapping);
      result.current.undo();
      result.current.redo();
    });

    expect(result.current.state.currentMappings).toHaveLength(1);
    expect(result.current.state.currentMappings[0]).toEqual(mapping);
    expect(result.current.state.history.past).toHaveLength(1);
    expect(result.current.state.history.future).toHaveLength(0);
  });

  it('should call onError when an error occurs', () => {
    const mockError = new Error('Test error');
    const { result } = renderHook(() => useMappingState({ 
      formId: mockFormId, 
      onError: mockOnError 
    }));

    act(() => {
      result.current.state.onError?.(mockError);
    });

    expect(mockOnError).toHaveBeenCalledWith(mockError);
  });
}); 