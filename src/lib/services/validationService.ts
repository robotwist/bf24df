import { FieldMapping } from '../../types/mappings';

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s-()]{10,}$/;
const SSN_REGEX = /^\d{3}-?\d{2}-?\d{4}$/;
const ZIP_REGEX = /^\d{5}(-\d{4})?$/;

const COMMON_VALIDATIONS: Record<string, ValidationRule[]> = {
  email: [
    {
      validate: (value) => EMAIL_REGEX.test(value),
      message: 'Invalid email format'
    }
  ],
  phone: [
    {
      validate: (value) => PHONE_REGEX.test(value),
      message: 'Invalid phone number format'
    }
  ],
  ssn: [
    {
      validate: (value) => SSN_REGEX.test(value),
      message: 'Invalid SSN format (XXX-XX-XXXX)'
    }
  ],
  zip: [
    {
      validate: (value) => ZIP_REGEX.test(value),
      message: 'Invalid ZIP code format'
    }
  ],
  required: [
    {
      validate: (value) => value !== null && value !== undefined && value !== '',
      message: 'This field is required'
    }
  ],
  number: [
    {
      validate: (value) => !isNaN(Number(value)),
      message: 'Must be a valid number'
    }
  ],
  integer: [
    {
      validate: (value) => Number.isInteger(Number(value)),
      message: 'Must be a valid integer'
    }
  ],
  date: [
    {
      validate: (value) => !isNaN(Date.parse(value)),
      message: 'Must be a valid date'
    }
  ]
};

export class ValidationService {
  private static instance: ValidationService;
  private customValidations: Map<string, ValidationRule[]>;

  private constructor() {
    this.customValidations = new Map();
  }

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  public addCustomValidation(fieldType: string, rules: ValidationRule[]): void {
    this.customValidations.set(fieldType, rules);
  }

  public validateMapping(mapping: FieldMapping): ValidationResult {
    const errors: string[] = [];

    // Validate required fields
    if (!mapping.targetFormId) {
      errors.push('Target form ID is required');
    }
    if (!mapping.targetFieldId) {
      errors.push('Target field ID is required');
    }
    if (!mapping.source) {
      errors.push('Source field is required');
    } else {
      if (!mapping.source.fieldId) {
        errors.push('Source field ID is required');
      }
      if (mapping.source.type === 'direct' && !mapping.source.formId) {
        errors.push('Source form ID is required for direct mappings');
      }
    }

    // Validate transformation if present
    if (mapping.transformation) {
      if (!mapping.transformation.type) {
        errors.push('Transformation type is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public validateFieldValue(value: any, fieldType: string): ValidationResult {
    const errors: string[] = [];
    const rules = this.getValidationRules(fieldType);

    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private getValidationRules(fieldType: string): ValidationRule[] {
    const rules: ValidationRule[] = [];

    // Add common validations based on field type
    if (COMMON_VALIDATIONS[fieldType]) {
      rules.push(...COMMON_VALIDATIONS[fieldType]);
    }

    // Add custom validations if any
    const customRules = this.customValidations.get(fieldType);
    if (customRules) {
      rules.push(...customRules);
    }

    return rules;
  }

  public validateFieldTypes(sourceType: string, targetType: string): ValidationResult {
    const errors: string[] = [];

    // Basic type compatibility check
    const compatibleTypes: Record<string, string[]> = {
      string: ['string', 'text', 'email', 'phone', 'ssn', 'zip'],
      number: ['number', 'integer'],
      boolean: ['boolean'],
      date: ['date', 'datetime'],
      text: ['string', 'text'],
      integer: ['number', 'integer'],
      datetime: ['date', 'datetime']
    };

    const sourceCompatible = compatibleTypes[sourceType] || [];
    const targetCompatible = compatibleTypes[targetType] || [];

    if (!sourceCompatible.includes(targetType) && !targetCompatible.includes(sourceType)) {
      errors.push(`Incompatible field types: ${sourceType} cannot be mapped to ${targetType}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const validationService = ValidationService.getInstance(); 