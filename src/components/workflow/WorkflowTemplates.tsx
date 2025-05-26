import React, { useState, useEffect } from 'react';
import { WorkflowService } from '../../services/WorkflowService';
import styles from '../../styles/WorkflowTemplates.module.css';

interface WorkflowTemplatesProps {
  graphData: any;
  onTemplateSelect: (templateId: string) => void;
}

export const WorkflowTemplates: React.FC<WorkflowTemplatesProps> = ({
  graphData,
  onTemplateSelect,
}) => {
  const [workflowService] = useState(() => new WorkflowService(graphData));
  const [templates, setTemplates] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
    loadSuggestions();
  }, [graphData]);

  const loadTemplates = async () => {
    try {
      const availableTemplates = workflowService.getTemplates();
      setTemplates(availableTemplates);
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error loading templates:', err);
    }
  };

  const loadSuggestions = async () => {
    try {
      const aiSuggestions = await workflowService.generateSuggestions();
      setSuggestions(aiSuggestions);
    } catch (err) {
      setError('Failed to load AI suggestions');
      console.error('Error loading suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    onTemplateSelect(templateId);
  };

  const handleSuggestionApply = async (suggestionId: string) => {
    try {
      await workflowService.applySuggestion(suggestionId);
      // Refresh suggestions after applying one
      loadSuggestions();
    } catch (err) {
      setError('Failed to apply suggestion');
      console.error('Error applying suggestion:', err);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading workflow templates...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Workflow Templates</h2>
        <button
          className={styles.refreshButton}
          onClick={() => {
            loadTemplates();
            loadSuggestions();
          }}
        >
          Refresh
        </button>
      </div>

      <div className={styles.content}>
        <section className={styles.templatesSection}>
          <h3>Available Templates</h3>
          <div className={styles.templateGrid}>
            {templates.map((template) => (
              <div
                key={template.id}
                className={styles.templateCard}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <h4>{template.name}</h4>
                <p>{template.description}</p>
                <div className={styles.metadata}>
                  <span className={styles.category}>{template.category}</span>
                  <span className={styles.time}>{template.estimatedTime}</span>
                </div>
                <div className={styles.tags}>
                  {template.tags.map((tag: string) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.suggestionsSection}>
          <h3>AI-Powered Suggestions</h3>
          <div className={styles.suggestionGrid}>
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className={styles.suggestionCard}>
                <div className={styles.suggestionHeader}>
                  <h4>{suggestion.type}</h4>
                  <span className={styles.confidence}>
                    {Math.round(suggestion.confidence * 100)}% confidence
                  </span>
                </div>
                <p>{suggestion.description}</p>
                <div className={styles.suggestionActions}>
                  <button
                    className={styles.applyButton}
                    onClick={() => handleSuggestionApply(suggestion.id)}
                  >
                    Apply Suggestion
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}; 