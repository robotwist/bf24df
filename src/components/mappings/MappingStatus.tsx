import React from 'react';
import { FieldMapping } from '../../types/mappings';
import { validateMapping } from '../../lib/utils/validation';
import { FormSchema } from '../../types/forms';

interface MappingStatusProps {
  mapping: FieldMapping;
  sourceSchema: FormSchema;
  targetSchema: FormSchema;
}

export const MappingStatus: React.FC<MappingStatusProps> = ({
  mapping,
  sourceSchema,
  targetSchema
}) => {
  const validationResult = validateMapping(
    sourceSchema.properties[mapping.source.fieldId],
    targetSchema.properties[mapping.targetFieldId]
  );
  const isValid = validationResult.isValid;

  const getSourceTypeLabel = () => {
    switch (mapping.source.type) {
      case 'direct':
        return 'Direct Dependency';
      case 'transitive':
        return 'Transitive Dependency';
      case 'global':
        return 'Global Source';
      default:
        return 'Unknown Source';
    }
  };

  return (
    <div className={`mapping-status ${isValid ? 'valid' : 'invalid'}`}>
      <div className="mapping-status-icon">
        {isValid ? '✓' : '!'}
      </div>
      <div className="mapping-details">
        <span>{getSourceTypeLabel()}</span>
        {!isValid && (
          <span className="mapping-error">
            {validationResult.message}
          </span>
        )}
      </div>
    </div>
  );
}; 