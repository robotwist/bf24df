import { TransformationService } from '../../src/services/transformationService';
import { Mapping } from '../../src/types';
import { FieldMapping } from '../../src/types/mappings';

describe('TransformationService', () => {
  describe('transformValue', () => {
    it('should transform string to uppercase', () => {
      const mapping: Mapping = {
        id: 'test-mapping',
        targetFormId: 'form-1',
        targetField: { id: 'field-1', name: 'Field 1', type: 'string' },
        sourceFormId: 'form-2',
        sourceField: { id: 'field-2', name: 'Field 2', type: 'string' },
        transformation: { type: 'uppercase' }
      };

      const result = TransformationService.transformValue('hello', mapping);
      expect(result).toBe('HELLO');
    });

    it('should transform string to lowercase', () => {
      const mapping: Mapping = {
        id: 'test-mapping',
        targetFormId: 'form-1',
        targetField: { id: 'field-1', name: 'Field 1', type: 'string' },
        sourceFormId: 'form-2',
        sourceField: { id: 'field-2', name: 'Field 2', type: 'string' },
        transformation: { type: 'lowercase' }
      };

      const result = TransformationService.transformValue('HELLO', mapping);
      expect(result).toBe('hello');
    });

    it('should format date according to format string', () => {
      const mapping: FieldMapping = {
        id: '1',
        targetFormId: 'form1',
        targetFieldId: 'field1',
        source: {
          type: 'direct',
          formId: 'form2',
          fieldId: 'field2',
          label: 'Field 2'
        },
        transformation: {
          type: 'date',
          format: 'YYYY-MM-DD'
        }
      };

      const result = TransformationService.transformValue('2024-03-20', mapping);
      expect(result).toBe('2024-03-20');
    });

    it('should format number according to format string', () => {
      const mapping: FieldMapping = {
        id: '1',
        targetFormId: 'form1',
        targetFieldId: 'field1',
        source: {
          type: 'direct',
          formId: 'form2',
          fieldId: 'field2',
          label: 'Field 2'
        },
        transformation: {
          type: 'numberFormat',
          format: '0.00'
        }
      };

      const result = TransformationService.transformValue(42.1234, mapping);
      expect(result).toBe('42.12');
    });
  });

  describe('getAvailableTransformations', () => {
    it('should return common transformations for string types', () => {
      const transformations = TransformationService.getAvailableTransformations('string', 'text');
      expect(transformations).toContain('uppercase');
      expect(transformations).toContain('lowercase');
      expect(transformations).toContain('trim');
    });

    it('should return date transformations for date types', () => {
      const transformations = TransformationService.getAvailableTransformations('date', 'datetime');
      expect(transformations).toContain('formatDate');
    });

    it('should return number transformations for number types', () => {
      const transformations = TransformationService.getAvailableTransformations('number', 'integer');
      expect(transformations).toContain('numberFormat');
    });

    it('should combine transformations for different types', () => {
      const transformations = TransformationService.getAvailableTransformations('string', 'date');
      expect(transformations).toContain('uppercase');
      expect(transformations).toContain('formatDate');
    });
  });

  describe('validateTransformationResult', () => {
    it('should validate string type', () => {
      expect(TransformationService.validateTransformationResult('hello', 'string')).toBe(true);
      expect(TransformationService.validateTransformationResult(123, 'string')).toBe(false);
    });

    it('should validate number type', () => {
      expect(TransformationService.validateTransformationResult(123, 'number')).toBe(true);
      expect(TransformationService.validateTransformationResult('123', 'number')).toBe(false);
    });

    it('should validate boolean type', () => {
      expect(TransformationService.validateTransformationResult(true, 'boolean')).toBe(true);
      expect(TransformationService.validateTransformationResult('true', 'boolean')).toBe(false);
    });

    it('should validate date type', () => {
      expect(TransformationService.validateTransformationResult(new Date(), 'date')).toBe(true);
      expect(TransformationService.validateTransformationResult('2024-03-20', 'date')).toBe(false);
    });
  });
}); 