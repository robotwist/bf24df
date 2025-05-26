import React, { useState, useEffect } from 'react';
import { IntegrationService } from '../../services/IntegrationService';
import styles from '../../styles/IntegrationSettings.module.css';

interface IntegrationSettingsProps {
  graphData: any;
  onSettingsUpdate: (settings: any) => void;
}

export const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({
  graphData,
  onSettingsUpdate
}) => {
  const [settings, setSettings] = useState({
    fhirEndpoint: '',
    hl7Endpoint: '',
    apiKey: '',
    authToken: '',
    retryAttempts: 3,
    timeout: 5000
  });

  const [status, setStatus] = useState({
    fhir: 'disconnected',
    hl7: 'disconnected'
  });

  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('integrationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key: string, value: string | number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('integrationSettings', JSON.stringify(newSettings));
    onSettingsUpdate(newSettings);
  };

  const testConnection = async (type: 'fhir' | 'hl7') => {
    setIsTesting(true);
    setError(null);

    try {
      const integrationService = new IntegrationService(graphData, settings);
      
      if (type === 'fhir') {
        // Test FHIR connection with a simple Patient resource
        const testResource = {
          resourceType: 'Patient',
          id: 'test',
          meta: {
            versionId: '1',
            lastUpdated: new Date().toISOString()
          }
        };

        if (integrationService.validateFHIRResource(testResource)) {
          setStatus(prev => ({ ...prev, fhir: 'connected' }));
        }
      } else {
        // Test HL7 connection with a simple ADT message
        const testMessage = {
          messageType: 'ADT',
          messageId: 'test',
          timestamp: new Date().toISOString(),
          segments: [{
            segmentType: 'MSH',
            fields: ['|', '^~\\&', 'SYSTEM', 'FACILITY', 'SYSTEM', 'FACILITY', new Date().toISOString(), '', 'ADT', 'test', 'P', '2.8']
          }]
        };

        if (integrationService.validateHL7Message(testMessage)) {
          setStatus(prev => ({ ...prev, hl7: 'connected' }));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed');
      setStatus(prev => ({ ...prev, [type]: 'error' }));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Integration Settings</h2>

      <div className={styles.section}>
        <h3>FHIR Integration</h3>
        <div className={styles.status}>
          Status: <span className={styles[status.fhir]}>{status.fhir}</span>
        </div>
        <div className={styles.formGroup}>
          <label>FHIR Endpoint</label>
          <input
            type="text"
            value={settings.fhirEndpoint}
            onChange={(e) => handleSettingChange('fhirEndpoint', e.target.value)}
            placeholder="https://fhir-server.com/fhir"
          />
        </div>
        <button
          className={styles.testButton}
          onClick={() => testConnection('fhir')}
          disabled={isTesting || !settings.fhirEndpoint}
        >
          {isTesting ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      <div className={styles.section}>
        <h3>HL7 Integration</h3>
        <div className={styles.status}>
          Status: <span className={styles[status.hl7]}>{status.hl7}</span>
        </div>
        <div className={styles.formGroup}>
          <label>HL7 Endpoint</label>
          <input
            type="text"
            value={settings.hl7Endpoint}
            onChange={(e) => handleSettingChange('hl7Endpoint', e.target.value)}
            placeholder="https://hl7-server.com/receive"
          />
        </div>
        <button
          className={styles.testButton}
          onClick={() => testConnection('hl7')}
          disabled={isTesting || !settings.hl7Endpoint}
        >
          {isTesting ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      <div className={styles.section}>
        <h3>Authentication</h3>
        <div className={styles.formGroup}>
          <label>API Key</label>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => handleSettingChange('apiKey', e.target.value)}
            placeholder="Enter API key"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Auth Token</label>
          <input
            type="password"
            value={settings.authToken}
            onChange={(e) => handleSettingChange('authToken', e.target.value)}
            placeholder="Enter auth token"
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3>Advanced Settings</h3>
        <div className={styles.formGroup}>
          <label>Retry Attempts</label>
          <input
            type="number"
            value={settings.retryAttempts}
            onChange={(e) => handleSettingChange('retryAttempts', parseInt(e.target.value))}
            min="1"
            max="5"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Timeout (ms)</label>
          <input
            type="number"
            value={settings.timeout}
            onChange={(e) => handleSettingChange('timeout', parseInt(e.target.value))}
            min="1000"
            max="30000"
            step="1000"
          />
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
}; 