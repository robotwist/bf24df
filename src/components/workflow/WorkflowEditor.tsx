import React, { useState, useEffect } from 'react';
import { WorkflowService } from '../../services/WorkflowService';
import { WorkflowTemplate, AISuggestion } from '../../services/WorkflowService';
import { EnhancedDAG } from '../visualization/EnhancedDAG';
import styles from '../../styles/WorkflowEditor.module.css';

interface WorkflowEditorProps {
  templateId: string;
  onBack: () => void;
  currentUser: {
    id: string;
    name: string;
    role: string;
    email: string;
    permissions: string[];
  } | null;
}

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  templateId,
  onBack,
  currentUser
}) => {
  const [template, setTemplate] = useState<WorkflowTemplate | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workflowService] = useState(() => new WorkflowService());

  useEffect(() => {
    if (currentUser) {
      workflowService.setCurrentUser(currentUser);
    }
  }, [currentUser, workflowService]);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true);
        setError(null);
        const templateData = await workflowService.getTemplateById(templateId);
        setTemplate(templateData);
        
        // Generate suggestions for this template
        const templateSuggestions = await workflowService.generateSuggestions(templateId);
        setSuggestions(templateSuggestions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load template');
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [templateId, workflowService]);

  const handleSuggestionApply = async (suggestionId: string) => {
    try {
      await workflowService.applySuggestion(suggestionId);
      // Refresh suggestions after applying one
      const updatedSuggestions = await workflowService.generateSuggestions(templateId);
      setSuggestions(updatedSuggestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply suggestion');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading template...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!template) {
    return <div className={styles.error}>Template not found</div>;
  }

  return (
    <div className={styles.workflowEditor}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back to Templates
        </button>
        <h2>{template.metadata?.name || 'Untitled Template'}</h2>
      </div>

      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <div className={styles.templateInfo}>
            <div className={styles.description}>
              <h3>Description</h3>
              <p>{template.metadata?.description || 'No description available'}</p>
            </div>

            <div className={styles.metadata}>
              <div className={styles.metaItem}>
                <span className={styles.label}>Estimated Time:</span>
                <span className={styles.value}>{template.metadata?.estimatedTime || 'Unknown'} min</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.label}>Required Role:</span>
                <span className={styles.value}>{template.metadata?.requiredRole || 'Any'}</span>
              </div>
              {template.metadata?.tags && template.metadata.tags.length > 0 && (
                <div className={styles.tags}>
                  {template.metadata.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.workflowVisualization}>
            <h3>Workflow Structure</h3>
            <EnhancedDAG
              graphData={template.nodes}
              selectedFormId={null}
              onFormSelect={(formId) => {
                // Handle form selection
                console.log('Selected form:', formId);
              }}
            />
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.suggestions}>
            <h3>AI Suggestions</h3>
            <div className={styles.suggestionList}>
              {suggestions.map(suggestion => (
                <div key={suggestion.id} className={styles.suggestionCard}>
                  <div className={styles.suggestionHeader}>
                    <h4>{suggestion.title}</h4>
                    <span className={styles.confidence}>
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p>{suggestion.description}</p>
                  <button
                    className={styles.applyButton}
                    onClick={() => handleSuggestionApply(suggestion.id)}
                  >
                    Apply Suggestion
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 