import React from 'react';
import styles from '../../styles/Tooltip.module.css';

interface InfoIconProps {
  tooltipContent: string;
}

export const InfoIcon: React.FC<InfoIconProps> = ({ tooltipContent }) => {
  return (
    <div className={styles.infoIcon} title={tooltipContent}>
      i
    </div>
  );
}; 