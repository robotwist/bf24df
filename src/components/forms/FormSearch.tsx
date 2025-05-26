import React, { useState, useMemo } from 'react';
import { FormNode } from '../../types/graph';
import styles from '../../styles/FormSearch.module.css';

interface FormSearchProps {
  forms: FormNode[];
  onSearch: (filteredForms: FormNode[]) => void;
}

export const FormSearch: React.FC<FormSearchProps> = ({ forms, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Extract unique categories from forms
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    forms.forEach(form => {
      if (form.data.category) {
        uniqueCategories.add(form.data.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [forms]);

  // Filter forms based on search term and category
  const filteredForms = useMemo(() => {
    return forms.filter(form => {
      const matchesSearch = form.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          form.data.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || form.data.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [forms, searchTerm, selectedCategory]);

  // Update parent component with filtered forms
  React.useEffect(() => {
    onSearch(filteredForms);
  }, [filteredForms, onSearch]);

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInput}>
        <input
          type="text"
          placeholder="Search forms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.input}
        />
        {searchTerm && (
          <button 
            className={styles.clearButton}
            onClick={() => setSearchTerm('')}
          >
            ×
          </button>
        )}
      </div>

      <div className={styles.categoryFilter}>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={styles.select}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.searchStats}>
        {filteredForms.length} of {forms.length} forms
      </div>
    </div>
  );
}; 