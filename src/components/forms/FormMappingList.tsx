import React from 'react';
import { FormGraph, FormMappingSet } from '../../types/forms';
import { useFormMappings } from '../../hooks/useFormMappings';
import { AvantosService } from '../../services/AvantosService';

interface FormMappingListProps {
  avantosService: AvantosService;
}

const FormMappingList = ({ avantosService }: FormMappingListProps): JSX.Element => {
  const {
    formGraph,
    mappings,
    loading,
    error,
    addMapping,
    updateMapping,
    removeMapping
  } = useFormMappings(avantosService);

  if (loading) return <div>Loading forms...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!formGraph) return <div>No forms available</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Form Mappings</h2>
      
      {/* Form List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formGraph.nodes.map((form) => (
          <div key={form.id} className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold">{form.label}</h3>
            <div className="mt-2">
              <h4 className="font-medium">Fields:</h4>
              <ul className="list-disc list-inside">
                {form.fields.map((field) => (
                  <li key={field.id}>
                    {field.name} ({field.type})
                    {field.required && <span className="text-red-500">*</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Mappings List */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Current Mappings</h3>
        {mappings.map((mappingSet, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">
                {mappingSet.sourceForm} → {mappingSet.targetForm}
              </h4>
              <button
                onClick={() => removeMapping(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <div className="space-y-2">
              {mappingSet.mappings.map((mapping, mappingIndex) => (
                <div key={mappingIndex} className="flex items-center space-x-2">
                  <span>{mapping.sourceField}</span>
                  <span>→</span>
                  <span>{mapping.targetField}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { FormMappingList }; 