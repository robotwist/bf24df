import React, { useState, useEffect } from 'react';
import { WorkflowService } from '../../services/WorkflowService';
import { WorkflowTemplate, AISuggestion } from '../../services/WorkflowService';
import styles from '../../styles/WorkflowTemplates.module.css';

interface WorkflowTemplatesProps {
  graphData: any;
  onTemplateSelect: (templateId: string) => void;
  currentUser: {
    id: string;
    name: string;
    role: string;
    email: string;
    permissions: string[];
  } | null;
}

export const WorkflowTemplates: React.FC<WorkflowTemplatesProps> = ({
  graphData,
  onTemplateSelect,
  currentUser
}) => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
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
    const loadTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        const templatesData = await workflowService.getTemplates();
        setTemplates(templatesData || []);
        
        // Generate suggestions for all templates
        const allSuggestions = await workflowService.generateSuggestions();
        setSuggestions(allSuggestions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [workflowService]);

  const handleSuggestionApply = async (suggestionId: string) => {
    try {
      await workflowService.applySuggestion(suggestionId);
      // Refresh suggestions after applying one
      const updatedSuggestions = await workflowService.generateSuggestions();
      setSuggestions(updatedSuggestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply suggestion');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading templates...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.workflowTemplates}>
      <div className={styles.header}>
        <h2>Workflow Templates</h2>
        {currentUser && (
          <div className={styles.userInfo}>
            Logged in as: {currentUser.name} ({currentUser.role})
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.templates}>
          <h3>Available Templates</h3>
          {templates.length > 0 ? (
            <div className={styles.templateList}>
              {templates.map(template => (
                <div
                  key={`template-${template.id}`}
                  className={styles.templateCard}
                  onClick={() => onTemplateSelect(template.id)}
                >
                  <h4>{template.metadata?.name || 'Untitled Template'}</h4>
                  <p>{template.metadata?.description || 'No description'}</p>
                  <div className={styles.metadata}>
                    <span className={styles.time}>
                      {template.metadata?.estimatedTime || 'Unknown'} min
                    </span>
                    {template.metadata?.requiredRole && (
                      <span className={styles.role}>
                        {template.metadata.requiredRole}
                      </span>
                    )}
                  </div>
                  {template.metadata?.tags && template.metadata.tags.length > 0 && (
                    <div className={styles.tags}>
                      {template.metadata.tags.map(tag => (
                        <span key={`${template.id}-tag-${tag}`} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noTemplates}>
              {currentUser ? 'No templates available' : 'Please log in to view templates'}
            </p>
          )}
        </div>

        <div className={styles.suggestions}>
          <h3>AI Suggestions</h3>
          {suggestions.length > 0 ? (
            <div className={styles.suggestionList}>
              {suggestions.map(suggestion => (
                <div key={`suggestion-${suggestion.id}`} className={styles.suggestionCard}>
                  <div className={styles.suggestionHeader}>
                    <h4>{suggestion.title}</h4>
                    <span className={styles.confidence}>
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p>{suggestion.description}</p>
                  {suggestion.metadata?.impact && (
                    <p className={styles.impact}>
                      <strong>Impact:</strong> {suggestion.metadata.impact}
                    </p>
                  )}
                  <button
                    onClick={() => handleSuggestionApply(suggestion.id)}
                    className={styles.applyButton}
                    disabled={!currentUser || (suggestion.metadata?.requiredRole && 
                      !workflowService.hasRequiredRole(suggestion.metadata.requiredRole))}
                  >
                    Apply Suggestion
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noSuggestions}>
              {currentUser ? 'No suggestions available' : 'Please log in to view suggestions'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}; 