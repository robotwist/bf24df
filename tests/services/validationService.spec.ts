import { ValidationService } from '../../src/services/validationService';
import { FieldType } from '../../src/types';
import { FieldMapping, Mapping } from '../../src/types/mappings';

describe('ValidationService', () => {
  describe('validateFieldTypes', () => {
    it('should validate compatible field types', () => {
      expect(ValidationService.validateFieldTypes('string', 'text')).toBe(true);
      expect(ValidationService.validateFieldTypes('number', 'integer')).toBe(true);
      expect(ValidationService.validateFieldTypes('boolean', 'checkbox')).toBe(true);
    });

    it('should reject incompatible field types', () => {
      expect(ValidationService.validateFieldTypes('string', 'number')).toBe(false);
      expect(ValidationService.validateFieldTypes('boolean', 'string')).toBe(false);
      expect(ValidationService.validateFieldTypes('date', 'number')).toBe(false);
    });
  });

  describe('validateMapping', () => {
    it('should accept a valid mapping', () => {
      const mapping: Mapping = {
        id: 'test-mapping',
        targetFormId: 'form-1',
        targetField: { id: 'field-1', name: 'Field 1', type: 'string' },
        sourceFormId: 'form-2',
        sourceField: { id: 'field-2', name: 'Field 2', type: 'string' }
      };

      const result = ValidationService.validateMapping(mapping);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject a mapping with incompatible types', () => {
      const mapping: Mapping = {
        id: 'test-mapping',
        targetFormId: 'form-1',
        targetField: { id: 'field-1', name: 'Field 1', type: 'number' },
        sourceFormId: 'form-2',
        sourceField: { id: 'field-2', name: 'Field 2', type: 'string' }
      };

      const result = ValidationService.validateMapping(mapping);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Incompatible field types: string cannot be mapped to number');
    });
  });
}); 