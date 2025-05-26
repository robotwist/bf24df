import React, { useState, useEffect } from 'react';
import { GraphData } from '../../types/graph';
import { WorkflowAnalytics } from '../../services/WorkflowAnalytics';
import { HealthcareCompliance } from '../../services/HealthcareCompliance';
import styles from '../../styles/AnalyticsDashboard.module.css';

interface AnalyticsDashboardProps {
  graphData: GraphData;
}

interface DashboardMetrics {
  workflowEfficiency: {
    averageCycleTime: number;
    bottleneckCount: number;
    performanceScore: number;
    timeSaved: number;
  };
  complianceMetrics: {
    hipaaScore: number;
    complianceGaps: number;
    riskScore: number;
    auditTrailCount: number;
  };
  dataQuality: {
    completeness: number;
    accuracy: number;
    validationErrors: number;
    dataVolume: number;
  };
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ graphData }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  
  const workflowAnalytics = new WorkflowAnalytics(graphData);
  const healthcareCompliance = new HealthcareCompliance(graphData);

  useEffect(() => {
    calculateMetrics();
  }, [graphData, selectedTimeframe]);

  const calculateMetrics = async () => {
    setIsLoading(true);
    try {
      // Calculate workflow efficiency metrics
      const bottlenecks = workflowAnalytics.detectBottlenecks();
      const avgCycleTime = graphData.nodes.reduce((total, node) => 
        total + workflowAnalytics.calculateCycleTime(node.id), 0) / graphData.nodes.length;
      
      const performanceScore = graphData.nodes.reduce((total, node) => 
        total + workflowAnalytics.calculatePerformanceScore(node.id), 0) / graphData.nodes.length;

      // Calculate compliance metrics
      const complianceGaps = graphData.nodes.reduce((total, node) => 
        total + healthcareCompliance.detectComplianceGaps(node.id).length, 0);
      
      const hipaaScore = graphData.nodes.reduce((total, node) => {
        const report = healthcareCompliance.generateRegulatoryReport(node.id);
        return total + (report.hipaa ? 1 : 0);
      }, 0) / graphData.nodes.length * 100;

      // Calculate data quality metrics
      const dataQuality = graphData.nodes.reduce((total, node) => {
        const health = workflowAnalytics.calculateWorkflowHealth(node.id);
        return {
          completeness: total.completeness + health.healthMetrics.completeness,
          accuracy: total.accuracy + health.healthMetrics.efficiency,
          validationErrors: total.validationErrors + (health.healthMetrics.risk * 100),
          dataVolume: total.dataVolume + (Object.keys(node.data.field_schema?.properties || {}).length)
        };
      }, { completeness: 0, accuracy: 0, validationErrors: 0, dataVolume: 0 });

      setMetrics({
        workflowEfficiency: {
          averageCycleTime: avgCycleTime,
          bottleneckCount: bottlenecks.length,
          performanceScore: performanceScore * 100,
          timeSaved: calculateTimeSaved(avgCycleTime, bottlenecks.length)
        },
        complianceMetrics: {
          hipaaScore,
          complianceGaps,
          riskScore: calculateRiskScore(complianceGaps, hipaaScore),
          auditTrailCount: graphData.nodes.reduce((total, node) => 
            total + healthcareCompliance.generateAuditTrail(node.id).length, 0)
        },
        dataQuality: {
          completeness: (dataQuality.completeness / graphData.nodes.length) * 100,
          accuracy: (dataQuality.accuracy / graphData.nodes.length) * 100,
          validationErrors: dataQuality.validationErrors / graphData.nodes.length,
          dataVolume: dataQuality.dataVolume
        }
      });
    } catch (error) {
      console.error('Error calculating metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTimeSaved = (avgCycleTime: number, bottleneckCount: number): number => {
    // Assuming 20% time reduction per bottleneck resolved
    const potentialTimeReduction = avgCycleTime * (bottleneckCount * 0.2);
    return potentialTimeReduction;
  };

  const calculateRiskScore = (complianceGaps: number, hipaaScore: number): number => {
    // Risk score is inverse of compliance (100 - compliance)
    return 100 - ((hipaaScore + (100 - (complianceGaps * 10))) / 2);
  };

  const renderMetricCard = (
    title: string,
    value: number,
    unit: string,
    trend?: number,
    color?: string
  ) => (
    <div className={styles.metricCard}>
      <h3 className={styles.metricTitle}>{title}</h3>
      <div className={styles.metricValue} style={{ color }}>
        {value.toFixed(1)}{unit}
      </div>
      {trend && (
        <div className={`${styles.trend} ${trend > 0 ? styles.positive : styles.negative}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return <div className={styles.loading}>Loading analytics...</div>;
  }

  if (!metrics) {
    return <div className={styles.error}>Error loading metrics</div>;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Workflow Analytics Dashboard</h1>
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
        <h2>Workflow Efficiency</h2>
        <div className={styles.metricsGrid}>
          {renderMetricCard(
            'Average Cycle Time',
            metrics.workflowEfficiency.averageCycleTime,
            ' min',
            -5,
            '#2196F3'
          )}
          {renderMetricCard(
            'Performance Score',
            metrics.workflowEfficiency.performanceScore,
            '%',
            8,
            '#4CAF50'
          )}
          {renderMetricCard(
            'Potential Time Saved',
            metrics.workflowEfficiency.timeSaved,
            ' min',
            -15,
            '#FF9800'
          )}
          {renderMetricCard(
            'Bottlenecks',
            metrics.workflowEfficiency.bottleneckCount,
            '',
            -2,
            '#F44336'
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2>Compliance & Security</h2>
        <div className={styles.metricsGrid}>
          {renderMetricCard(
            'HIPAA Compliance',
            metrics.complianceMetrics.hipaaScore,
            '%',
            3,
            '#4CAF50'
          )}
          {renderMetricCard(
            'Risk Score',
            metrics.complianceMetrics.riskScore,
            '%',
            -5,
            '#F44336'
          )}
          {renderMetricCard(
            'Compliance Gaps',
            metrics.complianceMetrics.complianceGaps,
            '',
            -2,
            '#FF9800'
          )}
          {renderMetricCard(
            'Audit Trail Entries',
            metrics.complianceMetrics.auditTrailCount,
            '',
            12,
            '#2196F3'
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2>Data Quality</h2>
        <div className={styles.metricsGrid}>
          {renderMetricCard(
            'Data Completeness',
            metrics.dataQuality.completeness,
            '%',
            4,
            '#4CAF50'
          )}
          {renderMetricCard(
            'Data Accuracy',
            metrics.dataQuality.accuracy,
            '%',
            6,
            '#2196F3'
          )}
          {renderMetricCard(
            'Validation Errors',
            metrics.dataQuality.validationErrors,
            '',
            -8,
            '#F44336'
          )}
          {renderMetricCard(
            'Total Fields',
            metrics.dataQuality.dataVolume,
            '',
            15,
            '#FF9800'
          )}
        </div>
      </div>
    </div>
  );
}; 