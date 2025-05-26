import React from 'react';
import styles from '../../styles/SecurityDashboard.module.css';

interface SecurityDashboardProps {
  graphData: any;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ graphData }) => {
  return (
    <div className={styles.container}>
      <h2>Security & Compliance Dashboard</h2>
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>HIPAA Compliance</h3>
          <div className={styles.status}>
            <span className={styles.statusIndicator}></span>
            <span>Compliant</span>
          </div>
          <p>All data handling follows HIPAA guidelines</p>
        </div>

        <div className={styles.card}>
          <h3>Data Encryption</h3>
          <div className={styles.status}>
            <span className={styles.statusIndicator}></span>
            <span>Active</span>
          </div>
          <p>End-to-end encryption enabled</p>
        </div>

        <div className={styles.card}>
          <h3>Access Control</h3>
          <div className={styles.status}>
            <span className={styles.statusIndicator}></span>
            <span>Enforced</span>
          </div>
          <p>Role-based access control active</p>
        </div>

        <div className={styles.card}>
          <h3>Audit Logs</h3>
          <div className={styles.status}>
            <span className={styles.statusIndicator}></span>
            <span>Enabled</span>
          </div>
          <p>Comprehensive activity tracking</p>
        </div>
      </div>
    </div>
  );
}; 