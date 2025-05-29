import React, { useState } from 'react';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import { FormMappingList } from './components/forms/FormMappingList';
import { SecurityDashboard } from './components/security/SecurityDashboard';
import { DemoModeToggle } from './components/common/DemoModeToggle';
import { AvantosService } from './services/AvantosService';

const AVANTOS_API_URL = process.env.VITE_AVANTOS_API_URL || 'https://api.avantos.com';
const AVANTOS_API_KEY = process.env.VITE_AVANTOS_API_KEY || '';

const avantosService = new AvantosService(AVANTOS_API_URL, AVANTOS_API_KEY);

type TabType = 'forms' | 'security';

const App = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<TabType>('forms');
  const [isDemoMode, setIsDemoMode] = useState(false);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="min-h-screen bg-gray-100">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  Form Mapping Platform
                </h1>
                <DemoModeToggle isDemoMode={isDemoMode} onToggle={toggleDemoMode} />
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6">
              <nav className="flex space-x-4">
                <button
                  onClick={() => handleTabChange('forms')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'forms'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Forms
                </button>
                <button
                  onClick={() => handleTabChange('security')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'security'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Security
                </button>
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === 'forms' ? (
                <FormMappingList avantosService={avantosService} />
              ) : (
                <SecurityDashboard isDemoMode={isDemoMode} />
              )}
            </div>
          </main>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;

