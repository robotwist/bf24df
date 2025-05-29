import { Mapping, Transformation } from '../types';

export class TransformationService {
  /**
   * Applies a transformation to a value
   */
  static transformValue(value: any, mapping: Mapping): any {
    if (!mapping.transformation) {
      return value;
    }

    const { type, format } = mapping.transformation;

    switch (type) {
      case 'uppercase':
        return String(value).toUpperCase();

      case 'lowercase':
        return String(value).toLowerCase();

      case 'trim':
        return String(value).trim();

      case 'formatDate':
        if (!format) return value;
        try {
          const date = new Date(value);
          return this.formatDate(date, format);
        } catch {
          return value;
        }

      case 'numberFormat':
        if (!format) return value;
        try {
          const num = Number(value);
          if (isNaN(num)) return value;
          return this.formatNumber(num, format);
        } catch {
          return value;
        }

      case 'custom':
        if (!format) return value;
        try {
          const transformFn = new Function('value', format);
          return transformFn(value);
        } catch {
          return value;
        }

      default:
        return value;
    }
  }

  /**
   * Formats a date according to the specified format
   */
  private static formatDate(date: Date, format: string): string {
    const formatMap: Record<string, string> = {
      y: date.getFullYear().toString(),
      M: (date.getMonth() + 1).toString().padStart(2, '0'),
      d: date.getDate().toString().padStart(2, '0'),
      H: date.getHours().toString().padStart(2, '0'),
      h: (date.getHours() % 12 || 12).toString().padStart(2, '0'),
      m: date.getMinutes().toString().padStart(2, '0'),
      s: date.getSeconds().toString().padStart(2, '0'),
      z: date.getTimezoneOffset().toString()
    };

    return format.replace(/[yMdHhmsz]/g, match => formatMap[match] || match);
  }

  /**
   * Formats a number according to the specified format
   */
  private static formatNumber(num: number, format: string): string {
    // Extract the number of decimal places from the format string
    const decimalPlaces = format.split('.')[1]?.length || 0;
    return num.toFixed(decimalPlaces);
  }

  /**
   * Gets available transformations for a field type
   */
  static getAvailableTransformations(sourceType: string, targetType: string): string[] {
    const commonTransformations: string[] = [
      'uppercase',
      'lowercase',
      'trim'
    ];

    const typeSpecificTransformations: Record<string, string[]> = {
      string: commonTransformations,
      text: commonTransformations,
      date: ['formatDate'],
      datetime: ['formatDate'],
      number: ['numberFormat'],
      integer: ['numberFormat'],
      float: ['numberFormat']
    };

    // Get transformations for both source and target types
    const sourceTransformations = typeSpecificTransformations[sourceType] || [];
    const targetTransformations = typeSpecificTransformations[targetType] || [];

    // Combine and deduplicate transformations
    return [...new Set([...sourceTransformations, ...targetTransformations])];
  }

  /**
   * Validates a transformation result
   */
  static validateTransformationResult(value: any, targetType: string): boolean {
    switch (targetType) {
      case 'string':
      case 'text':
      case 'email':
      case 'url':
      case 'tel':
        return typeof value === 'string';

      case 'number':
      case 'integer':
      case 'float':
        return typeof value === 'number' && !isNaN(value);

      case 'boolean':
      case 'checkbox':
        return typeof value === 'boolean';

      case 'date':
      case 'datetime':
        return value instanceof Date && !isNaN(value.getTime());

      case 'array':
        return Array.isArray(value);

      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);

      default:
        return true;
    }
  }
} 