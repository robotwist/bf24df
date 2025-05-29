import { FormGraph, FormNode, FormField } from '../types/forms';

export class AvantosService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async fetchFormGraph(): Promise<FormGraph> {
    const response = await fetch(`${this.baseUrl}/action-blueprint-graph`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch form graph: ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformApiResponse(data);
  }

  private transformApiResponse(data: any): FormGraph {
    // Transform the API response into our internal FormGraph structure
    return {
      nodes: data.nodes.map((node: any) => ({
        id: node.id,
        type: node.type,
        label: node.label,
        fields: node.fields.map((field: any) => ({
          id: field.id,
          name: field.name,
          type: field.type,
          required: field.required,
          validation: field.validation
        }))
      })),
      edges: data.edges.map((edge: any) => ({
        source: edge.source,
        target: edge.target,
        type: edge.type
      }))
    };
  }
} 