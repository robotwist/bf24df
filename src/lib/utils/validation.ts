import { FieldType, FieldSchema } from '../../types/forms';
import { MappingSource } from '../../types/mappings';

export const isCompatibleTypes = (sourceType: FieldType, targetType: FieldType): boolean => {
  // Direct type matches
  if (sourceType === targetType) return true;

  // Special cases
  if (sourceType === 'number' && targetType === 'string') return true;
  if (sourceType === 'string' && targetType === 'date') return true;
  
  // Array compatibility
  if (sourceType === 'array' && targetType === 'string') return true;
  
  return false;
};

export const validateMapping = (
  sourceSchema: FieldSchema,
  targetSchema: FieldSchema
): { isValid: boolean; message?: string } => {
  if (!isCompatibleTypes(sourceSchema.type, targetSchema.type)) {
    return {
      isValid: false,
      message: `Type mismatch: cannot map ${sourceSchema.type} to ${targetSchema.type}`
    };
  }

  // Check enum compatibility
  if (targetSchema.enum && sourceSchema.type === 'string') {
    const sourceEnum = sourceSchema.enum || [];
    const targetEnum = targetSchema.enum || [];
    
    if (sourceEnum.length > 0 && targetEnum.length > 0) {
      const hasCommonValues = sourceEnum.some(value => targetEnum.includes(value));
      if (!hasCommonValues) {
        return {
          isValid: false,
          message: 'No common values between source and target enums'
        };
      }
    }
  }

  // Check nested object compatibility
  if (sourceSchema.type === 'object' && targetSchema.type === 'object') {
    if (sourceSchema.properties && targetSchema.properties) {
      for (const [key, targetProp] of Object.entries(targetSchema.properties)) {
        const sourceProp = sourceSchema.properties[key];
        if (sourceProp) {
          const validation = validateMapping(sourceProp, targetProp);
          if (!validation.isValid) {
            return validation;
          }
        }
      }
    }
  }

  return { isValid: true };
};

export const getFieldSchema = (
  formSchema: Record<string, FieldSchema>,
  fieldPath: string[]
): FieldSchema | null => {
  let current: any = formSchema;
  
  for (const part of fieldPath) {
    if (!current || !current.properties || !current.properties[part]) {
      return null;
    }
    current = current.properties[part];
  }
  
  return current;
}; 