import React, { useState, useEffect } from 'react';
import { WorkflowService } from '../../services/WorkflowService';
import styles from '../../styles/WorkflowTemplates.module.css';

interface WorkflowTemplatesProps {
  graphData: any;
  onTemplateSelect: (templateId: string) => void;
}

export const WorkflowTemplates: React.FC<WorkflowTemplatesProps> = ({
  graphData,
  onTemplateSelect
}) => {
  const [workflowService] = useState(() => new WorkflowService(graphData));
  const [templates, setTemplates] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
    loadSuggestions();
  }, []);

  const loadTemplates = () => {
    const availableTemplates = workflowService.getTemplates();
    setTemplates(availableTemplates);
  };

  const loadSuggestions = async () => {
    try {
      const aiSuggestions = await workflowService.generateSuggestions();
      setSuggestions(aiSuggestions);
    } catch (err) {
      setError('Failed to load AI suggestions');
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await workflowService.automateWorkflow(templateId);
      setSelectedTemplate(templateId);
      onTemplateSelect(templateId);
    } catch (err) {
      setError('Failed to apply template');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTemplateCard = (template: any) => (
    <div
      key={template.id}
      className={`${styles.templateCard} ${
        selectedTemplate === template.id ? styles.selected : ''
      }`}
      onClick={() => handleTemplateSelect(template.id)}
    >
      <h3>{template.name}</h3>
      <p>{template.description}</p>
      <div className={styles.metadata}>
        <span className={styles.category}>{template.metadata.category}</span>
        <span className={styles.time}>
          {template.metadata.estimatedTime} min
        </span>
      </div>
      <div className={styles.tags}>
        {template.metadata.tags.map((tag: string) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className={styles.roles}>
        {template.metadata.requiredRoles.map((role: string) => (
          <span key={role} className={styles.role}>
            {role}
          </span>
        ))}
      </div>
    </div>
  );

  const renderSuggestionCard = (suggestion: any) => (
    <div key={suggestion.description} className={styles.suggestionCard}>
      <div className={styles.suggestionHeader}>
        <span className={styles.type}>{suggestion.type}</span>
        <span className={styles.confidence}>
          {Math.round(suggestion.confidence * 100)}% confidence
        </span>
      </div>
      <p>{suggestion.description}</p>
      <div className={styles.metadata}>
        <div className={styles.reason}>
          <strong>Reason:</strong> {suggestion.metadata.reason}
        </div>
        <div className={styles.impact}>
          <strong>Impact:</strong> {suggestion.metadata.impact}
        </div>
        {suggestion.metadata.alternatives && (
          <div className={styles.alternatives}>
            <strong>Alternatives:</strong>
            <ul>
              {suggestion.metadata.alternatives.map((alt: string) => (
                <li key={alt}>{alt}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <button
        className={styles.applyButton}
        onClick={() => suggestion.action()}
        disabled={isLoading}
      >
        Apply Suggestion
      </button>
    </div>
  );

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
          disabled={isLoading}
        >
          Refresh
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.content}>
        <div className={styles.templatesSection}>
          <h3>Available Templates</h3>
          <div className={styles.templateGrid}>
            {templates.map(renderTemplateCard)}
          </div>
        </div>

        <div className={styles.suggestionsSection}>
          <h3>AI-Powered Suggestions</h3>
          <div className={styles.suggestionsList}>
            {suggestions.map(renderSuggestionCard)}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
}; 