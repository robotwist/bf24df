import { GraphData } from '../../types/graph';
import { mockGraphData } from './mockData';

const API_BASE_URL = '/api/v1';
const REQUEST_TIMEOUT = 10000; // 10 seconds

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = REQUEST_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out', 408, 'TIMEOUT');
    }
    throw error;
  }
}

export async function fetchGraphData(): Promise<GraphData> {
  if (process.env.NODE_ENV === 'test') {
    return mockGraphData;
  }

  const url = `${API_BASE_URL}/graph`;
  try {
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        `Failed to fetch graph data: ${errorText}`,
        response.status,
        'GRAPH_FETCH_ERROR'
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Failed to fetch graph data',
      500,
      'UNKNOWN_ERROR'
    );
  }
} 