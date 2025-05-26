import React from 'react';
import  ErrorBoundary  from './components/common/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import FormList from './components/forms/FormList';
import styles from './styles/App.module.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className={styles.app}>
          <header className={styles.header}>
            <h1>Form Mapping Tool</h1>
          </header>
          <main className={styles.main}>
            <FormList />
          </main>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;

