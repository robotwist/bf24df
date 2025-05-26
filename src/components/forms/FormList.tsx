import React, { useState, useEffect } from 'react';
import { FormNode, GraphData } from '../../types/graph';
import { FormSearch } from './FormSearch';
import { FormCard } from './FormCard';
import LoadingState from '../common/LoadingState';
import { useToast } from '../../contexts/ToastContext';
import styles from '../../styles/FormList.module.css';

const FormList: React.FC = () => {
  const [forms, setForms] = useState<FormNode[]>([]);
  const [filteredForms, setFilteredForms] = useState<FormNode[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formsResponse, graphResponse] = await Promise.all([
          fetch('http://localhost:3000/api/forms'),
          fetch('http://localhost:3000/api/graph')
        ]);

        if (!formsResponse.ok || !graphResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [formsData, graphData] = await Promise.all([
          formsResponse.json(),
          graphResponse.json()
        ]);

        setForms(formsData);
        setFilteredForms(formsData);
        setGraphData(graphData);
      } catch (error) {
        showToast('Failed to load data. Please try again.', 'error');
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  const handleSearch = (filtered: FormNode[]) => {
    setFilteredForms(filtered);
  };

  if (isLoading) {
    return <LoadingState message="Loading forms..." />;
  }

  if (!graphData) {
    return <div className={styles.error}>Failed to load graph data</div>;
  }

  return (
    <div className={styles.formList}>
      <FormSearch forms={forms} onSearch={handleSearch} />
      <div className={styles.formsGrid}>
        {filteredForms.map((form) => (
          <FormCard key={form.id} form={form} graphData={graphData} />
        ))}
      </div>
      {filteredForms.length === 0 && (
        <div className={styles.noResults}>
          No forms found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default FormList; 