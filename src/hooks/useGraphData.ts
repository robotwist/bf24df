import { useState, useEffect } from 'react';
import { fetchGraphData } from '../lib/api/graphApi';
import { GraphData } from '../types/graph';

export const useGraphData = (orgId: string, blueprintId: string) => {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadGraphData = async () => {
      try {
        setLoading(true);
        const graphData = await fetchGraphData(orgId, blueprintId);
        setData(graphData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadGraphData();
  }, [orgId, blueprintId]);

  return { data, loading, error };
}; 