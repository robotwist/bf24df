import { ValidationResult } from './validationService';

export interface TransformationParams {
  [key: string]: string | number | boolean;
}

export interface Transformation {
  transform: (value: any, params?: TransformationParams) => any;
  validate: (value: any, params?: TransformationParams) => ValidationResult;
  getAvailableParams: () => string[];
}

const TRANSFORMATIONS: Record<string, Transformation> = {
  uppercase: {
    transform: (value: string) => value?.toUpperCase(),
    validate: (value: any) => ({
      isValid: typeof value === 'string',
      errors: typeof value !== 'string' ? ['Value must be a string'] : []
    }),
    getAvailableParams: () => []
  },
  lowercase: {
    transform: (value: string) => value?.toLowerCase(),
    validate: (value: any) => ({
      isValid: typeof value === 'string',
      errors: typeof value !== 'string' ? ['Value must be a string'] : []
    }),
    getAvailableParams: () => []
  },
  capitalize: {
    transform: (value: string) => {
      if (!value) return value;
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    },
    validate: (value: any) => ({
      isValid: typeof value === 'string',
      errors: typeof value !== 'string' ? ['Value must be a string'] : []
    }),
    getAvailableParams: () => []
  },
  trim: {
    transform: (value: string) => value?.trim(),
    validate: (value: any) => ({
      isValid: typeof value === 'string',
      errors: typeof value !== 'string' ? ['Value must be a string'] : []
    }),
    getAvailableParams: () => []
  },
  formatDate: {
    transform: (value: string | Date, params?: TransformationParams) => {
      const date = new Date(value);
      const format = params?.format as string || 'YYYY-MM-DD';
      return format
        .replace('YYYY', date.getFullYear().toString())
        .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
        .replace('DD', date.getDate().toString().padStart(2, '0'));
    },
    validate: (value: any) => ({
      isValid: !isNaN(Date.parse(value)),
      errors: isNaN(Date.parse(value)) ? ['Invalid date format'] : []
    }),
    getAvailableParams: () => ['format']
  },
  formatPhone: {
    transform: (value: string) => {
      const cleaned = value.replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      return match ? `(${match[1]}) ${match[2]}-${match[3]}` : value;
    },
    validate: (value: any) => ({
      isValid: typeof value === 'string' && /^\d{10}$/.test(value.replace(/\D/g, '')),
      errors: typeof value !== 'string' ? ['Value must be a string'] : 
              !/^\d{10}$/.test(value.replace(/\D/g, '')) ? ['Invalid phone number format'] : []
    }),
    getAvailableParams: () => []
  },
  formatSSN: {
    transform: (value: string) => {
      const cleaned = value.replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{2})(\d{4})$/);
      return match ? `${match[1]}-${match[2]}-${match[3]}` : value;
    },
    validate: (value: any) => ({
      isValid: typeof value === 'string' && /^\d{9}$/.test(value.replace(/\D/g, '')),
      errors: typeof value !== 'string' ? ['Value must be a string'] : 
              !/^\d{9}$/.test(value.replace(/\D/g, '')) ? ['Invalid SSN format'] : []
    }),
    getAvailableParams: () => []
  },
  round: {
    transform: (value: number, params?: TransformationParams) => {
      const decimals = params?.decimals as number || 0;
      return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
    },
    validate: (value: any) => ({
      isValid: !isNaN(Number(value)),
      errors: isNaN(Number(value)) ? ['Value must be a number'] : []
    }),
    getAvailableParams: () => ['decimals']
  },
  floor: {
    transform: (value: number) => Math.floor(Number(value)),
    validate: (value: any) => ({
      isValid: !isNaN(Number(value)),
      errors: isNaN(Number(value)) ? ['Value must be a number'] : []
    }),
    getAvailableParams: () => []
  },
  ceil: {
    transform: (value: number) => Math.ceil(Number(value)),
    validate: (value: any) => ({
      isValid: !isNaN(Number(value)),
      errors: isNaN(Number(value)) ? ['Value must be a number'] : []
    }),
    getAvailableParams: () => []
  }
};

export class TransformationService {
  private static instance: TransformationService;
  private customTransformations: Map<string, Transformation>;

  private constructor() {
    this.customTransformations = new Map();
  }

  public static getInstance(): TransformationService {
    if (!TransformationService.instance) {
      TransformationService.instance = new TransformationService();
    }
    return TransformationService.instance;
  }

  public addCustomTransformation(name: string, transformation: Transformation): void {
    this.customTransformations.set(name, transformation);
  }

  public transform(value: any, transformationType: string, params?: TransformationParams): any {
    const transformation = this.getTransformation(transformationType);
    if (!transformation) {
      throw new Error(`Unknown transformation type: ${transformationType}`);
    }

    const validation = transformation.validate(value, params);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    return transformation.transform(value, params);
  }

  public getAvailableTransformations(sourceType: string, targetType: string): string[] {
    const transformations: string[] = [];

    // Add transformations based on field types
    if (sourceType === 'string' || targetType === 'string') {
      transformations.push('uppercase', 'lowercase', 'capitalize', 'trim');
    }
    if (sourceType === 'number' || targetType === 'number') {
      transformations.push('round', 'floor', 'ceil');
    }
    if (sourceType === 'date' || targetType === 'date' || 
        sourceType === 'datetime' || targetType === 'datetime') {
      transformations.push('formatDate');
    }
    if (sourceType === 'string') {
      transformations.push('formatPhone', 'formatSSN');
    }

    // Add custom transformations
    this.customTransformations.forEach((_, name) => {
      transformations.push(name);
    });

    return transformations;
  }

  public getTransformationParams(transformationType: string): string[] {
    const transformation = this.getTransformation(transformationType);
    return transformation?.getAvailableParams() || [];
  }

  private getTransformation(type: string): Transformation | undefined {
    return TRANSFORMATIONS[type] || this.customTransformations.get(type);
  }
}

export const transformationService = TransformationService.getInstance(); 