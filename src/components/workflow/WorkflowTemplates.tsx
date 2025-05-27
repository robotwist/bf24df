import React, { useState, useEffect } from 'react';
import { WorkflowService } from '../../services/WorkflowService';
import styles from '../../styles/WorkflowTemplates.module.css';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'clinician' | 'nurse';
  email: string;
  permissions: string[];
}

// Default demo user with admin privileges
const DEFAULT_USER: User = {
  id: 'demo-user',
  name: 'Demo User',
  role: 'admin',
  email: 'demo@example.com',
  permissions: [
    'read:templates',
    'write:templates',
    'create_template',
    'edit_template',
    'delete_template',
    'add_node',
    'add_connection',
    'add_validation'
  ]
};

interface WorkflowTemplatesProps {
  graphData: any;
  onTemplateSelect: (templateId: string) => void;
  currentUser?: User;
}

export const WorkflowTemplates: React.FC<WorkflowTemplatesProps> = ({
  graphData,
  onTemplateSelect,
  currentUser = DEFAULT_USER, // Use default user if none provided
}) => {
  const [workflowService] = useState(() => {
    const service = new WorkflowService(graphData);
    service.setCurrentUser(currentUser);
    return service;
  });
  const [templates, setTemplates] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    workflowService.setCurrentUser(currentUser);
    loadTemplates();
    loadSuggestions();
  }, [graphData, currentUser]);

  const loadTemplates = async () => {
    try {
      const availableTemplates = workflowService.getTemplates();
      setTemplates(availableTemplates || []);
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error loading templates:', err);
    }
  };

  const loadSuggestions = async () => {
    try {
      const aiSuggestions = await workflowService.generateSuggestions();
      setSuggestions(aiSuggestions || []);
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
      setError(err instanceof Error ? err.message : 'Failed to apply suggestion');
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
        <div className={styles.userInfo}>
          <span className={styles.userRole}>
            {currentUser.role} {currentUser === DEFAULT_USER && '(Demo Mode)'}
          </span>
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
      </div>

      <div className={styles.content}>
        <section className={styles.templatesSection}>
          <h3>Available Templates</h3>
          <div className={styles.templateGrid}>
            {templates && templates.length > 0 ? (
              templates.map((template) => (
                <div
                  key={`template-${template.id}`}
                  className={styles.templateCard}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <h4>{template.name}</h4>
                  <p>{template.description}</p>
                  <div className={styles.metadata}>
                    <span className={styles.category}>{template.metadata?.category}</span>
                    <span className={styles.time}>{template.metadata?.estimatedTime} min</span>
                  </div>
                  <div className={styles.tags}>
                    {template.metadata?.tags?.map((tag: string) => (
                      <span key={`${template.id}-tag-${tag}`} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className={styles.roles}>
                    {template.metadata?.requiredRoles?.map((role: string) => (
                      <span key={`${template.id}-role-${role}`} className={styles.role}>
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noTemplates}>No templates available</div>
            )}
          </div>
        </section>

        <section className={styles.suggestionsSection}>
          <h3>AI-Powered Suggestions</h3>
          <div className={styles.suggestionGrid}>
            {suggestions && suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <div key={`suggestion-${suggestion.id}`} className={styles.suggestionCard}>
                  <div className={styles.suggestionHeader}>
                    <h4>{suggestion.type}</h4>
                    <span className={styles.confidence}>
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p>{suggestion.description}</p>
                  <div className={styles.suggestionMetadata}>
                    <span className={styles.impact}>Impact: {suggestion.metadata.impact}</span>
                    {suggestion.metadata.requiredRole && (
                      <span className={styles.requiredRole}>
                        Required Role: {suggestion.metadata.requiredRole}
                      </span>
                    )}
                  </div>
                  <div className={styles.suggestionActions}>
                    <button
                      className={styles.applyButton}
                      onClick={() => handleSuggestionApply(suggestion.id)}
                      disabled={suggestion.metadata.requiredRole !== currentUser.role}
                    >
                      Apply Suggestion
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noSuggestions}>No suggestions available</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}; 