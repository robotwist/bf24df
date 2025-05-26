import React, { useState } from 'react';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import FormList from './components/forms/FormList';
import { WorkflowTemplates } from './components/workflow/WorkflowTemplates';
import { SecurityDashboard } from './components/security/SecurityDashboard';
import styles from './styles/App.module.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'forms' | 'workflows' | 'security'>('forms');
  const [graphData, setGraphData] = useState<any>(null);

  const handleTemplateSelect = (templateId: string) => {
    // Handle template selection
    console.log('Selected template:', templateId);
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className={styles.app}>
          <header className={styles.header}>
            <h1>Healthcare Workflow Platform</h1>
            <nav className={styles.navigation}>
              <button
                className={`${styles.navButton} ${activeTab === 'forms' ? styles.active : ''}`}
                onClick={() => setActiveTab('forms')}
              >
                Forms
              </button>
              <button
                className={`${styles.navButton} ${activeTab === 'workflows' ? styles.active : ''}`}
                onClick={() => setActiveTab('workflows')}
              >
                Workflows
              </button>
              <button
                className={`${styles.navButton} ${activeTab === 'security' ? styles.active : ''}`}
                onClick={() => setActiveTab('security')}
              >
                Security
              </button>
            </nav>
          </header>
          <main className={styles.main}>
            {activeTab === 'forms' && <FormList />}
            {activeTab === 'workflows' && (
              <WorkflowTemplates
                graphData={graphData}
                onTemplateSelect={handleTemplateSelect}
              />
            )}
            {activeTab === 'security' && <SecurityDashboard graphData={graphData} />}
          </main>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;

