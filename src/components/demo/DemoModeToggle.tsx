import React, { useState } from 'react';
import { DEMO_CONFIG } from '../../config/demo';
import styles from './DemoModeToggle.module.css';

interface DemoModeToggleProps {
  onUserSelect: (user: typeof DEMO_CONFIG.testUsers[0]) => void;
}

export const DemoModeToggle: React.FC<DemoModeToggleProps> = ({ onUserSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.demoModeContainer}>
      <button
        className={styles.demoModeButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        Demo Mode
      </button>
      
      {isOpen && (
        <div className={styles.userList}>
          <h3>Select Demo User</h3>
          {DEMO_CONFIG.testUsers.map(user => (
            <button
              key={user.id}
              className={styles.userButton}
              onClick={() => {
                onUserSelect(user);
                setIsOpen(false);
              }}
            >
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userRole}>{user.role}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 