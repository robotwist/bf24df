import { FieldType, FieldMapping } from '../types/forms';

type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

type ValidationRule = {
  type: 'required' | 'format' | 'range' | 'custom';
  message: string;
  validate: (value: unknown) => boolean;
};

const validationRules: Record<FieldType, ValidationRule[]> = {
  text: [
    {
      type: 'required',
      message: 'Field is required',
      validate: (value: unknown) => value !== undefined && value !== null && value !== '',
    },
  ],
  number: [
    {
      type: 'required',
      message: 'Field is required',
      validate: (value: unknown) => value !== undefined && value !== null,
    },
    {
      type: 'format',
      message: 'Must be a valid number',
      validate: (value: unknown) => typeof value === 'number' || !isNaN(Number(value)),
    },
  ],
  date: [
    {
      type: 'required',
      message: 'Field is required',
      validate: (value: unknown) => value !== undefined && value !== null,
    },
    {
      type: 'format',
      message: 'Must be a valid date',
      validate: (value: unknown) => {
        if (typeof value === 'string') {
          const date = new Date(value);
          return !isNaN(date.getTime());
        }
        return false;
      },
    },
  ],
  boolean: [
    {
      type: 'required',
      message: 'Field is required',
      validate: (value: unknown) => value !== undefined && value !== null,
    },
    {
      type: 'format',
      message: 'Must be a boolean value',
      validate: (value: unknown) => typeof value === 'boolean',
    },
  ],
};

export class ValidationService {
  validateField(value: unknown, type: FieldType): ValidationResult {
    const rules = validationRules[type] || [];
    const errors: string[] = [];

    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateMapping(mapping: FieldMapping): ValidationResult {
    const errors: string[] = [];

    if (!mapping.sourceField) {
      errors.push('Source field is required');
    }

    if (!mapping.targetField) {
      errors.push('Target field is required');
    }

    if (mapping.sourceField && mapping.targetField) {
      const sourceType = mapping.sourceField.type;
      const targetType = mapping.targetField.type;

      if (sourceType !== targetType) {
        errors.push(`Type mismatch: ${sourceType} cannot be mapped to ${targetType}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateTransformation(value: unknown, transformation: string): ValidationResult {
    const errors: string[] = [];

    try {
      // Basic transformation validation
      if (typeof transformation !== 'string') {
        errors.push('Transformation must be a string');
        return { isValid: false, errors };
      }

      // Add more specific transformation validation logic here
      // For example, checking if the transformation is a valid JavaScript expression
      const isValidExpression = /^[a-zA-Z0-9_$()\s.]+$/.test(transformation);
      if (!isValidExpression) {
        errors.push('Invalid transformation expression');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      errors.push('Error validating transformation');
      return {
        isValid: false,
        errors,
      };
    }
  }
} 