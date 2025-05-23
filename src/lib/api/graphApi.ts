import { GraphData } from '../../types/graph';

const API_BASE_URL = '/api/v1';

export const fetchGraphData = async (orgId: string, blueprintId: string): Promise<GraphData> => {
  const url = `${API_BASE_URL}/${orgId}/actions/blueprints/${blueprintId}/graph`;
  console.log('Fetching graph data from:', url);
  
  try {
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch graph data: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Received graph data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching graph data:', error);
    throw error;
  }
}; 