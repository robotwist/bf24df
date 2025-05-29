import React, { useState } from 'react';
import { FormNode, GraphData } from '../../types/graph';
import { toTitleCase, formatFieldType } from '../../utils/formattingUtils';
import { MappingEditor } from '../mappings/MappingEditor';
import { BulkMapping } from '../mappings/BulkMapping';
import styles from '../../styles/FormCard.module.css';
import { FormGraph, FormField } from '../../types/forms';

interface FormCardProps {
  form: FormGraph;
  graphData: GraphData;
  onEdit?: (formId: string) => void;
  onDelete?: (formId: string) => void;
}

export const FormCard: React.FC<FormCardProps> = ({ form, graphData, onEdit, onDelete }) => {
  const [isMappingEditorOpen, setIsMappingEditorOpen] = useState(false);
  const [isBulkMappingOpen, setIsBulkMappingOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showDagView, setShowDagView] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const groupFieldsByCategory = () => {
    const groups: { [key: string]: { [key: string]: any } } = {};
    
    // Get the form schema from the forms array
    const formSchema = form.data.field_schema;
    if (!formSchema || !formSchema.properties) {
      return groups;
    }

    Object.entries(formSchema.properties).forEach(([fieldId, schema]) => {
      const category = schema.category || 'General';
      if (!groups[category]) {
        groups[category] = {};
      }
      groups[category][fieldId] = schema;
    });

    return groups;
  };

  const renderField = (field: FormField) => (
    <div key={field.id} className="mb-2">
      <span className="font-medium">{field.label}</span>
      <span className="text-gray-500 text-sm ml-2">({field.type})</span>
    </div>
  );

  const handleEdit = () => {
    if (onEdit) {
      onEdit(form.id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(form.id);
    }
  };

  // Get all dependencies (direct and transitive)
  const getDependencies = () => {
    const dependencies = new Set<string>();
    const visited = new Set<string>();

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = graphData.nodes.find(n => n.id === nodeId);
      if (!node) return;

      node.data.prerequisites.forEach(prereqId => {
        dependencies.add(prereqId);
        traverse(prereqId);
      });
    };

    form.data.prerequisites.forEach(traverse);
    return Array.from(dependencies);
  };

  // Get all dependent forms (forms that depend on this one)
  const getDependents = () => {
    return graphData.nodes.filter(node => 
      node.data.prerequisites.includes(form.id)
    );
  };

  const getWorkflowImpact = () => {
    const dependencies = getDependencies();
    const dependents = getDependents();
    const totalForms = dependencies.length + dependents.length + 1; // +1 for current form
    
    // Calculate critical path
    const criticalPath = new Set<string>();
    const visited = new Set<string>();
    
    const traverseCritical = (nodeId: string, depth: number = 0) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = graphData.nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      if (depth > 0) {
        criticalPath.add(nodeId);
      }
      
      node.data.prerequisites.forEach(prereqId => {
        traverseCritical(prereqId, depth + 1);
      });
    };
    
    traverseCritical(form.id);
    
    return {
      totalForms,
      criticalPath: Array.from(criticalPath),
      dependencies,
      dependents
    };
  };

  const renderDagView = () => {
    const dependencies = getDependencies();
    const dependents = getDependents();
    const impact = getWorkflowImpact();

    return (
      <div className={styles.dagView}>
        <div className={styles.dagSection}>
          <h4>Dependencies</h4>
          <div className={styles.dagList}>
            {dependencies.map(depId => {
              const depNode = graphData.nodes.find(n => n.id === depId);
              const isCritical = impact.criticalPath.includes(depId);
              return (
                <div key={depId} className={`${styles.dagItem} ${isCritical ? styles.critical : ''}`}>
                  <span className={styles.dagLabel}>
                    {depNode?.data.name || 'Unknown Form'}
                  </span>
                  <span className={styles.dagType}>
                    {form.data.prerequisites.includes(depId) ? 'Direct' : 'Transitive'}
                  </span>
                  {isCritical && (
                    <span className={styles.criticalBadge}>Critical Path</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.dagSection}>
          <h4>Dependents</h4>
          <div className={styles.dagList}>
            {dependents.map(dep => (
              <div key={dep.id} className={styles.dagItem}>
                <span className={styles.dagLabel}>{dep.data.name}</span>
                <span className={styles.dagType}>Direct</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.dagInfo}>
          <div className={styles.impactSummary}>
            <h4>Workflow Impact Analysis</h4>
            <div className={styles.impactStats}>
              <div className={styles.impactStat}>
                <span className={styles.statLabel}>Total Forms in Chain</span>
                <span className={styles.statValue}>{impact.totalForms}</span>
              </div>
              <div className={styles.impactStat}>
                <span className={styles.statLabel}>Critical Path Forms</span>
                <span className={styles.statValue}>{impact.criticalPath.length}</span>
              </div>
              <div className={styles.impactStat}>
                <span className={styles.statLabel}>Direct Dependencies</span>
                <span className={styles.statValue}>{dependencies.length}</span>
              </div>
              <div className={styles.impactStat}>
                <span className={styles.statLabel}>Direct Dependents</span>
                <span className={styles.statValue}>{dependents.length}</span>
              </div>
            </div>
          </div>
          <div className={styles.workflowInsights}>
            <h4>Workflow Insights</h4>
            <ul>
              <li>Changes to this form affect {impact.totalForms} forms in the workflow</li>
              <li>{impact.criticalPath.length} forms are on the critical path</li>
              <li>Data flows from {dependencies.length} source forms to {dependents.length} dependent forms</li>
              <li>This form is {dependencies.length === 0 ? 'a root form' : 'dependent on other forms'}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.formCard}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>{form.data.name}</h2>
        <div className={styles.formActions}>
          <button
            className={styles.dagButton}
            onClick={() => setShowDagView(!showDagView)}
            title="View DAG Relationships"
          >
            {showDagView ? 'Hide DAG' : 'Show DAG'}
          </button>
          <button
            className={styles.bulkMapButton}
            onClick={() => setIsBulkMappingOpen(true)}
          >
            Bulk Map Fields
          </button>
          <div className={styles.editDeleteButtons}>
            {onEdit && (
              <button
                onClick={handleEdit}
                className={styles.editButton}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className={styles.deleteButton}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
      {form.data.description && (
        <p className={styles.formDescription}>{form.data.description}</p>
      )}
      <div className={styles.formFields}>
        {Object.entries(groupFieldsByCategory()).map(([category, fields]) => (
          <div key={category} className={styles.fieldSection}>
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection(category)}
            >
              <h3>{category}</h3>
              <span className={styles.expandIcon}>
                {expandedSections.has(category) ? '−' : '+'}
              </span>
            </button>
            {expandedSections.has(category) && (
              <div className={styles.sectionContent}>
                {Object.entries(fields).map(([fieldId, schema]) =>
                  renderField({ id: fieldId, label: toTitleCase(fieldId), type: formatFieldType(schema) })
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showDagView && renderDagView()}

      {isMappingEditorOpen && (
        <MappingEditor
          form={form}
          onClose={() => setIsMappingEditorOpen(false)}
        />
      )}

      {isBulkMappingOpen && (
        <BulkMapping
          formNode={form}
          graphData={graphData}
          onClose={() => setIsBulkMappingOpen(false)}
        />
      )}
    </div>
  );
}; 