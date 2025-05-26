/**
 * Converts a string from snake_case or kebab-case to Title Case.
 * e.g., 'hello_world' -> 'Hello World', 'another-example' -> 'Another Example'
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters (for camelCase/PascalCase)
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formats a field type for display based on its schema.
 * Handles simple types, arrays, and arrays of specific item types.
 */
export const formatFieldType = (schema: any): string => {
  if (!schema) return 'Unknown Type';

  // Handle array types
  if (schema.type === 'array') {
    if (schema.avantos_type === 'multi-select') {
      const options = schema.items?.enum || [];
      return `Multi-select (${options.join(', ')})`;
    }
    return `Array of ${formatFieldType(schema.items)}`;
  }

  // Handle basic types
  if (schema.type === 'string') {
    if (schema.enum) {
      return `Select (${schema.enum.join(', ')})`;
    }
    if (schema.avantos_type) {
      return toTitleCase(schema.avantos_type);
    }
    return 'Text';
  }

  if (schema.type === 'number') return 'Number';
  if (schema.type === 'integer') return 'Integer';
  if (schema.type === 'boolean') return 'Boolean';
  if (schema.type === 'object') return 'Object';

  return toTitleCase(schema.type || 'Unknown');
}; 