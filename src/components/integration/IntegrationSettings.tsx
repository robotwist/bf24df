import React, { useState, useEffect } from 'react';
import { IntegrationService } from '../../services/IntegrationService';
import styles from '../../styles/IntegrationSettings.module.css';

interface IntegrationSettingsProps {
  graphData: any;
  onSettingsUpdate: (settings: any) => void;
}

export const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({
  graphData,
  onSettingsUpdate,
}) => {
  const [integrationService] = useState(() => new IntegrationService());
  const [settings, setSettings] = useState({
    fhir: {
      enabled: false,
      serverUrl: '',
      apiKey: '',
      version: 'R4',
    },
    hl7: {
      enabled: false,
      serverUrl: '',
      port: '',
      facility: '',
    },
    auth: {
      type: 'none',
      username: '',
      password: '',
      token: '',
    },
  });
  const [status, setStatus] = useState({
    fhir: { connected: false, lastSync: null },
    hl7: { connected: false, lastSync: null },
  });
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('integrationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const handleSettingChange = (section: string, field: string, value: any) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section as keyof typeof settings],
        [field]: value,
      },
    };
    setSettings(newSettings);
    localStorage.setItem('integrationSettings', JSON.stringify(newSettings));
    onSettingsUpdate(newSettings);
  };

  const testConnection = async (type: 'fhir' | 'hl7') => {
    setIsTesting(true);
    setError(null);

    try {
      if (type === 'fhir') {
        const testResource = {
          resourceType: 'Patient',
          id: 'test-patient',
          name: [{ family: 'Test', given: ['Patient'] }],
        };
        await integrationService.sendToFHIRServer(testResource, settings.fhir);
        setStatus(prev => ({
          ...prev,
          fhir: { connected: true, lastSync: new Date() },
        }));
      } else {
        const testMessage = integrationService.createTestHL7Message();
        await integrationService.sendToHL7Server(testMessage, settings.hl7);
        setStatus(prev => ({
          ...prev,
          hl7: { connected: true, lastSync: new Date() },
        }));
      }
    } catch (err) {
      setError(`Failed to connect to ${type.toUpperCase()} server: ${err}`);
      setStatus(prev => ({
        ...prev,
        [type]: { connected: false, lastSync: null },
      }));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Integration Settings</h2>

      <div className={styles.sections}>
        <section className={styles.section}>
          <h3>FHIR Integration</h3>
          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={settings.fhir.enabled}
                onChange={(e) => handleSettingChange('fhir', 'enabled', e.target.checked)}
              />
              Enable FHIR Integration
            </label>
          </div>
          {settings.fhir.enabled && (
            <>
              <div className={styles.formGroup}>
                <label>Server URL</label>
                <input
                  type="url"
                  value={settings.fhir.serverUrl}
                  onChange={(e) => handleSettingChange('fhir', 'serverUrl', e.target.value)}
                  placeholder="https://fhir-server.example.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label>API Key</label>
                <input
                  type="password"
                  value={settings.fhir.apiKey}
                  onChange={(e) => handleSettingChange('fhir', 'apiKey', e.target.value)}
                  placeholder="Enter API key"
                />
              </div>
              <div className={styles.formGroup}>
                <label>FHIR Version</label>
                <select
                  value={settings.fhir.version}
                  onChange={(e) => handleSettingChange('fhir', 'version', e.target.value)}
                >
                  <option value="R4">R4</option>
                  <option value="R3">R3</option>
                  <option value="R2">R2</option>
                </select>
              </div>
              <button
                className={styles.testButton}
                onClick={() => testConnection('fhir')}
                disabled={isTesting}
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
              {status.fhir.lastSync && (
                <div className={styles.status}>
                  Last sync: {new Date(status.fhir.lastSync).toLocaleString()}
                </div>
              )}
            </>
          )}
        </section>

        <section className={styles.section}>
          <h3>HL7 Integration</h3>
          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={settings.hl7.enabled}
                onChange={(e) => handleSettingChange('hl7', 'enabled', e.target.checked)}
              />
              Enable HL7 Integration
            </label>
          </div>
          {settings.hl7.enabled && (
            <>
              <div className={styles.formGroup}>
                <label>Server URL</label>
                <input
                  type="url"
                  value={settings.hl7.serverUrl}
                  onChange={(e) => handleSettingChange('hl7', 'serverUrl', e.target.value)}
                  placeholder="https://hl7-server.example.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Port</label>
                <input
                  type="text"
                  value={settings.hl7.port}
                  onChange={(e) => handleSettingChange('hl7', 'port', e.target.value)}
                  placeholder="Port number"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Facility</label>
                <input
                  type="text"
                  value={settings.hl7.facility}
                  onChange={(e) => handleSettingChange('hl7', 'facility', e.target.value)}
                  placeholder="Facility name"
                />
              </div>
              <button
                className={styles.testButton}
                onClick={() => testConnection('hl7')}
                disabled={isTesting}
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
              {status.hl7.lastSync && (
                <div className={styles.status}>
                  Last sync: {new Date(status.hl7.lastSync).toLocaleString()}
                </div>
              )}
            </>
          )}
        </section>

        <section className={styles.section}>
          <h3>Authentication</h3>
          <div className={styles.formGroup}>
            <label>Authentication Type</label>
            <select
              value={settings.auth.type}
              onChange={(e) => handleSettingChange('auth', 'type', e.target.value)}
            >
              <option value="none">None</option>
              <option value="basic">Basic Auth</option>
              <option value="token">Token</option>
            </select>
          </div>
          {settings.auth.type === 'basic' && (
            <>
              <div className={styles.formGroup}>
                <label>Username</label>
                <input
                  type="text"
                  value={settings.auth.username}
                  onChange={(e) => handleSettingChange('auth', 'username', e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Password</label>
                <input
                  type="password"
                  value={settings.auth.password}
                  onChange={(e) => handleSettingChange('auth', 'password', e.target.value)}
                />
              </div>
            </>
          )}
          {settings.auth.type === 'token' && (
            <div className={styles.formGroup}>
              <label>Token</label>
              <input
                type="password"
                value={settings.auth.token}
                onChange={(e) => handleSettingChange('auth', 'token', e.target.value)}
              />
            </div>
          )}
        </section>
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}; 