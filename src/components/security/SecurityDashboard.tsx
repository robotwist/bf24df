import React, { useState, useEffect } from 'react';
import { GraphData } from '../../types/graph';
import { SecurityService } from '../../services/SecurityService';
import styles from '../../styles/SecurityDashboard.module.css';

interface SecurityDashboardProps {
  graphData: GraphData;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ graphData }) => {
  const [securityService] = useState(() => new SecurityService(graphData));
  const [complianceReport, setComplianceReport] = useState<any>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComplianceReport();
  }, [graphData, selectedTimeframe]);

  const loadComplianceReport = async () => {
    setIsLoading(true);
    try {
      const report = securityService.generateComplianceReport();
      setComplianceReport(report);
    } catch (error) {
      console.error('Error loading compliance report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMetricCard = (
    title: string,
    value: number | string,
    trend?: number,
    color?: string
  ) => (
    <div className={styles.metricCard}>
      <h3 className={styles.metricTitle}>{title}</h3>
      <div className={styles.metricValue} style={{ color }}>
        {value}
      </div>
      {trend !== undefined && (
        <div className={`${styles.trend} ${trend > 0 ? styles.positive : styles.negative}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );

  const renderAuditEvents = () => {
    if (!complianceReport?.auditTrail.recentEvents.length) {
      return <div className={styles.noData}>No recent audit events</div>;
    }

    return (
      <div className={styles.auditEvents}>
        {complianceReport.auditTrail.recentEvents.map((event: any) => (
          <div key={event.id} className={styles.auditEvent}>
            <div className={styles.eventHeader}>
              <span className={styles.eventAction}>{event.action}</span>
              <span className={styles.eventTime}>
                {new Date(event.timestamp).toLocaleString()}
              </span>
            </div>
            <div className={styles.eventDetails}>
              <div>User: {event.userId}</div>
              <div>Resource: {event.resourceType} ({event.resourceId})</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading security dashboard...</div>;
  }

  if (!complianceReport) {
    return <div className={styles.error}>Error loading compliance report</div>;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Security & Compliance Dashboard</h1>
        <div className={styles.timeframeSelector}>
          <button
            className={selectedTimeframe === 'day' ? styles.active : ''}
            onClick={() => setSelectedTimeframe('day')}
          >
            Day
          </button>
          <button
            className={selectedTimeframe === 'week' ? styles.active : ''}
            onClick={() => setSelectedTimeframe('week')}
          >
            Week
          </button>
          <button
            className={selectedTimeframe === 'month' ? styles.active : ''}
            onClick={() => setSelectedTimeframe('month')}
          >
            Month
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2>HIPAA Compliance</h2>
        <div className={styles.metricsGrid}>
          {renderMetricCard(
            'Compliant Forms',
            complianceReport.hipaaCompliance.compliantForms,
            undefined,
            '#10b981'
          )}
          {renderMetricCard(
            'Non-Compliant Forms',
            complianceReport.hipaaCompliance.nonCompliantForms,
            undefined,
            '#ef4444'
          )}
          {renderMetricCard(
            'Compliance Rate',
            `${Math.round(
              (complianceReport.hipaaCompliance.compliantForms /
                (complianceReport.hipaaCompliance.compliantForms +
                  complianceReport.hipaaCompliance.nonCompliantForms)) *
                100
            )}%`,
            undefined,
            '#3b82f6'
          )}
        </div>
        {complianceReport.hipaaCompliance.violations.length > 0 && (
          <div className={styles.violations}>
            <h3>Compliance Violations</h3>
            <ul>
              {complianceReport.hipaaCompliance.violations.map((violation: string, index: number) => (
                <li key={index}>{violation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2>Access Control</h2>
        <div className={styles.metricsGrid}>
          {renderMetricCard(
            'Total Users',
            complianceReport.accessControl.totalUsers,
            undefined,
            '#3b82f6'
          )}
          {renderMetricCard(
            'Restricted Resources',
            complianceReport.accessControl.restrictedResources,
            undefined,
            '#f59e0b'
          )}
        </div>
        <div className={styles.roleDistribution}>
          <h3>User Role Distribution</h3>
          <div className={styles.roleChart}>
            {Object.entries(complianceReport.accessControl.usersByRole).map(([role, count]) => (
              <div key={role} className={styles.roleBar}>
                <div className={styles.roleLabel}>{role}</div>
                <div className={styles.roleCount}>{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Audit Trail</h2>
        <div className={styles.metricsGrid}>
          {renderMetricCard(
            'Total Events',
            complianceReport.auditTrail.totalEvents,
            undefined,
            '#3b82f6'
          )}
          {Object.entries(complianceReport.auditTrail.eventsByType).map(([type, count]) => (
            <div key={type} className={styles.eventType}>
              <span className={styles.eventTypeLabel}>{type}</span>
              <span className={styles.eventTypeCount}>{count}</span>
            </div>
          ))}
        </div>
        <div className={styles.recentEvents}>
          <h3>Recent Events</h3>
          {renderAuditEvents()}
        </div>
      </div>
    </div>
  );
}; 