import React from 'react';
import { ValidationReport } from '../../services/ValidationService';
import styles from '../../styles/ValidationResults.module.css';

interface ValidationResultsProps {
  report: ValidationReport;
  onRuleClick?: (ruleId: string) => void;
}

export const ValidationResults: React.FC<ValidationResultsProps> = ({
  report,
  onRuleClick
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return '#10b981';
      case 'fail':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return '✓';
      case 'fail':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return '•';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Validation Results</h2>
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.label}>Total Rules:</span>
            <span className={styles.value}>{report.summary.totalRules}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.label}>Passed:</span>
            <span className={styles.value} style={{ color: '#10b981' }}>
              {report.summary.passedRules}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.label}>Failed:</span>
            <span className={styles.value} style={{ color: '#ef4444' }}>
              {report.summary.failedRules}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.label}>Warnings:</span>
            <span className={styles.value} style={{ color: '#f59e0b' }}>
              {report.summary.warningRules}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.rulesList}>
        {report.rules.map(rule => (
          <div
            key={rule.ruleId}
            className={styles.ruleCard}
            onClick={() => onRuleClick?.(rule.ruleId)}
          >
            <div className={styles.ruleHeader}>
              <div
                className={styles.statusIndicator}
                style={{ backgroundColor: getStatusColor(rule.status) }}
              >
                {getStatusIcon(rule.status)}
              </div>
              <h3 className={styles.ruleTitle}>{rule.ruleId}</h3>
            </div>
            <p className={styles.ruleMessage}>{rule.message}</p>
            {rule.details && rule.details.length > 0 && (
              <div className={styles.ruleDetails}>
                <h4>Details:</h4>
                <ul>
                  {rule.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.timestamp}>
          Generated: {new Date(report.timestamp).toLocaleString()}
        </div>
        <div
          className={styles.overallStatus}
          style={{ backgroundColor: getStatusColor(report.overallStatus) }}
        >
          Overall Status: {report.overallStatus.toUpperCase()}
        </div>
      </div>
    </div>
  );
}; 