import React, { useState } from 'react';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import FormList from './components/forms/FormList';
import { WorkflowTemplates } from './components/workflow/WorkflowTemplates';
import { WorkflowEditor } from './components/workflow/WorkflowEditor';
import { SecurityDashboard } from './components/security/SecurityDashboard';
import { DemoModeToggle } from './components/demo/DemoModeToggle';
import { DEMO_CONFIG } from './config/demo';
import styles from './styles/App.module.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'forms' | 'workflows' | 'security'>('forms');
  const [graphData, setGraphData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<typeof DEMO_CONFIG.testUsers[0] | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    // Switch to workflows tab if not already there
    if (activeTab !== 'workflows') {
      setActiveTab('workflows');
    }
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
  };

  const handleUserSelect = (user: typeof DEMO_CONFIG.testUsers[0]) => {
    setCurrentUser(user);
    // Initialize demo data and services with selected user
    initializeDemoMode(user);
  };

  const initializeDemoMode = (user: typeof DEMO_CONFIG.testUsers[0]) => {
    // Initialize services with demo data
    // This would typically involve setting up mock data and services
    console.log('Initializing demo mode for user:', user);
  };

  const renderWorkflowContent = () => {
    if (selectedTemplate) {
      return (
        <WorkflowEditor
          templateId={selectedTemplate}
          onBack={handleBackToTemplates}
          currentUser={currentUser}
        />
      );
    }

    return (
      <WorkflowTemplates
        graphData={graphData}
        onTemplateSelect={handleTemplateSelect}
        currentUser={currentUser}
      />
    );
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className={styles.app}>
          {DEMO_CONFIG.enabled && (
            <DemoModeToggle onUserSelect={handleUserSelect} />
          )}
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
            {activeTab === 'workflows' && renderWorkflowContent()}
            {activeTab === 'security' && <SecurityDashboard graphData={graphData} />}
          </main>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;

