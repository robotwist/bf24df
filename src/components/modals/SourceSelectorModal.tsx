import React from 'react';
import { MappingSource } from '../../types/mappings';

interface SourceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (source: MappingSource) => void;
  sources: MappingSource[];
}

export const SourceSelectorModal: React.FC<SourceSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  sources
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Select Data Source</h3>
        
        <div className="sources-list">
          {sources.map((source, index) => (
            <div 
              key={`${source.type}-${source.fieldId}-${index}`}
              className="source-item"
              onClick={() => onSelect(source)}
            >
              <span className="source-type">{source.type}</span>
              <span className="source-label">{source.label}</span>
            </div>
          ))}
        </div>

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}; 