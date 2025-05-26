import { FieldType, Mapping } from '../types';

export class ValidationService {
  /**
   * Validates if two field types are compatible for mapping
   */
  static validateFieldTypes(sourceType: FieldType, targetType: FieldType): boolean {
    const typeCompatibility: Record<FieldType, FieldType[]> = {
      string: ['string', 'text', 'email', 'url', 'tel'],
      number: ['number', 'integer', 'float'],
      boolean: ['boolean', 'checkbox'],
      date: ['date', 'datetime'],
      object: ['object'],
      array: ['array'],
      file: ['file', 'image'],
      select: ['select', 'multiselect'],
      radio: ['radio'],
      checkbox: ['checkbox', 'boolean'],
      text: ['text', 'string'],
      email: ['email', 'string'],
      url: ['url', 'string'],
      tel: ['tel', 'string'],
      integer: ['integer', 'number'],
      float: ['float', 'number'],
      datetime: ['datetime', 'date'],
      image: ['image', 'file'],
      multiselect: ['multiselect', 'select', 'array']
    };

    return typeCompatibility[sourceType]?.includes(targetType) || false;
  }

  /**
   * Validates a transformation format
   */
  static validateTransformation(mapping: Mapping): { isValid: boolean; error?: string } {
    if (!mapping.transformation) {
      return { isValid: true };
    }

    const { type, format } = mapping.transformation;

    switch (type) {
      case 'uppercase':
      case 'lowercase':
      case 'trim':
        return { isValid: true };

      case 'formatDate':
        if (!format) {
          return { isValid: false, error: 'Date format is required' };
        }
        // Basic date format validation
        const validFormat = /^[yMdHhmsz\s\-:/.]+$/.test(format);
        return {
          isValid: validFormat,
          error: validFormat ? undefined : 'Invalid date format'
        };

      case 'numberFormat':
        if (!format) {
          return { isValid: false, error: 'Number format is required' };
        }
        // Basic number format validation
        const validNumberFormat = /^[0-9,.#]+$/.test(format);
        return {
          isValid: validNumberFormat,
          error: validNumberFormat ? undefined : 'Invalid number format'
        };

      case 'custom':
        if (!format) {
          return { isValid: false, error: 'Custom transformation code is required' };
        }
        try {
          // Basic validation of custom transformation code
          new Function('value', format);
          return { isValid: true };
        } catch (error) {
          return {
            isValid: false,
            error: 'Invalid custom transformation code'
          };
        }

      default:
        return { isValid: false, error: 'Invalid transformation type' };
    }
  }

  /**
   * Validates a complete mapping
   */
  static validateMapping(mapping: Mapping): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields
    if (!mapping.sourceField) {
      errors.push('Source field is required');
    }
    if (!mapping.targetField) {
      errors.push('Target field is required');
    }

    // Validate field types if both fields are present
    if (mapping.sourceField && mapping.targetField) {
      const typesCompatible = this.validateFieldTypes(
        mapping.sourceField.type,
        mapping.targetField.type
      );
      if (!typesCompatible) {
        errors.push(`Incompatible field types: ${mapping.sourceField.type} cannot be mapped to ${mapping.targetField.type}`);
      }
    }

    // Validate transformation if present
    if (mapping.transformation) {
      const transformationValidation = this.validateTransformation(mapping);
      if (!transformationValidation.isValid) {
        errors.push(transformationValidation.error || 'Invalid transformation');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a preview value against the mapping
   */
  static validatePreviewValue(value: any, mapping: Mapping): { isValid: boolean; error?: string } {
    if (!mapping.transformation) {
      return { isValid: true };
    }

    const { type, format } = mapping.transformation;

    switch (type) {
      case 'formatDate':
        try {
          new Date(value);
          return { isValid: true };
        } catch {
          return { isValid: false, error: 'Invalid date value' };
        }

      case 'numberFormat':
        const num = Number(value);
        if (isNaN(num)) {
          return { isValid: false, error: 'Invalid number value' };
        }
        return { isValid: true };

      case 'custom':
        try {
          const transformFn = new Function('value', format);
          transformFn(value);
          return { isValid: true };
        } catch (error) {
          return { isValid: false, error: 'Invalid transformation result' };
        }

      default:
        return { isValid: true };
    }
  }
} 