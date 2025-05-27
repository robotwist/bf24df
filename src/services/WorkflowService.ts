import { GraphData, FormNode } from '../types/graph';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'clinician' | 'nurse';
  email: string;
  permissions: string[];
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: FormNode[];
  metadata: {
    category: string;
    tags: string[];
    estimatedTime: number;
    requiredRoles: string[];
  };
}

interface AISuggestion {
  id: string;
  type: 'node' | 'connection' | 'validation';
  confidence: number;
  description: string;
  action: () => Promise<void>;
  metadata: {
    reason: string;
    impact: string;
    alternatives?: string[];
    requiredRole?: string;
  };
}

interface WorkflowMetrics {
  completionTime: number;
  errorRate: number;
  userSatisfaction: number;
  costSavings: number;
}

export class WorkflowService {
  private graphData: GraphData;
  private templates: Map<string, WorkflowTemplate>;
  private aiModel: any; // Placeholder for AI model integration
  private suggestions: Map<string, AISuggestion> = new Map();
  private currentUser: User | null = null;

  constructor(graphData: GraphData) {
    this.graphData = graphData;
    this.templates = new Map();
    this.initializeTemplates();
  }

  public setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      console.log(`WorkflowService: User set to ${user.name} (${user.role})`);
    } else {
      console.log('WorkflowService: No user set');
    }
  }

  private hasRequiredRole(requiredRoles: string[]): boolean {
    if (!this.currentUser || !requiredRoles) return false;
    return requiredRoles.includes(this.currentUser.role);
  }

  private initializeTemplates() {
    // Initialize with common healthcare workflow templates
    const templates: WorkflowTemplate[] = [
      {
        id: 'patient-intake',
        name: 'Patient Intake',
        description: 'Standard patient registration and initial assessment workflow',
        nodes: this.createPatientIntakeNodes(),
        metadata: {
          category: 'Registration',
          tags: ['patient', 'intake', 'registration'],
          estimatedTime: 15,
          requiredRoles: ['admin', 'nurse']
        }
      },
      {
        id: 'lab-order',
        name: 'Laboratory Order',
        description: 'Workflow for ordering and processing laboratory tests',
        nodes: this.createLabOrderNodes(),
        metadata: {
          category: 'Orders',
          tags: ['lab', 'orders', 'tests'],
          estimatedTime: 10,
          requiredRoles: ['admin', 'clinician', 'nurse']
        }
      }
    ];

    templates.forEach(template => this.templates.set(template.id, template));
  }

  private createPatientIntakeNodes(): FormNode[] {
    return [
      {
        id: 'patient-info',
        type: 'form',
        label: 'Patient Information',
        fields: [
          { id: 'firstName', label: 'First Name', type: 'text', required: true },
          { id: 'lastName', label: 'Last Name', type: 'text', required: true },
          { id: 'dob', label: 'Date of Birth', type: 'date', required: true },
          { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true }
        ]
      },
      {
        id: 'insurance',
        type: 'form',
        label: 'Insurance Information',
        fields: [
          { id: 'provider', label: 'Insurance Provider', type: 'text', required: true },
          { id: 'policyNumber', label: 'Policy Number', type: 'text', required: true },
          { id: 'groupNumber', label: 'Group Number', type: 'text', required: false }
        ]
      }
    ];
  }

  private createLabOrderNodes(): FormNode[] {
    return [
      {
        id: 'test-selection',
        type: 'form',
        label: 'Test Selection',
        fields: [
          { id: 'testType', label: 'Test Type', type: 'select', options: ['Blood', 'Urine', 'X-Ray'], required: true },
          { id: 'priority', label: 'Priority', type: 'select', options: ['Routine', 'Stat', 'ASAP'], required: true }
        ]
      },
      {
        id: 'patient-consent',
        type: 'form',
        label: 'Patient Consent',
        fields: [
          { id: 'consentGiven', label: 'Consent Given', type: 'checkbox', required: true },
          { id: 'consentDate', label: 'Consent Date', type: 'date', required: true }
        ]
      }
    ];
  }

  // Template Management
  public getTemplates(): WorkflowTemplate[] {
    if (!this.currentUser) return [];
    
    return Array.from(this.templates.values())
      .filter(template => this.hasRequiredRole(template.metadata.requiredRoles));
  }

  public getTemplateById(id: string): WorkflowTemplate | undefined {
    const template = this.templates.get(id);
    if (!template || !this.currentUser) return undefined;
    
    return this.hasRequiredRole(template.metadata.requiredRoles) ? template : undefined;
  }

  public createTemplate(template: WorkflowTemplate): void {
    if (!this.currentUser || !this.currentUser.permissions.includes('create_template')) {
      throw new Error('Unauthorized: Insufficient permissions to create template');
    }
    this.templates.set(template.id, template);
  }

  public updateTemplate(id: string, updates: Partial<WorkflowTemplate>): void {
    if (!this.currentUser || !this.currentUser.permissions.includes('edit_template')) {
      throw new Error('Unauthorized: Insufficient permissions to update template');
    }
    const template = this.templates.get(id);
    if (template) {
      this.templates.set(id, { ...template, ...updates });
    }
  }

  public deleteTemplate(id: string): void {
    if (!this.currentUser || !this.currentUser.permissions.includes('delete_template')) {
      throw new Error('Unauthorized: Insufficient permissions to delete template');
    }
    this.templates.delete(id);
  }

  // AI-Powered Suggestions
  public async generateSuggestions(): Promise<AISuggestion[]> {
    if (!this.currentUser) return [];

    const suggestions: AISuggestion[] = [];
    const patterns = this.analyzeWorkflowPatterns();
    
    // Generate role-specific suggestions
    suggestions.push(...this.generateNodeSuggestions(patterns));
    suggestions.push(...this.generateConnectionSuggestions(patterns));
    suggestions.push(...this.generateValidationSuggestions(patterns));

    // Filter suggestions based on user role
    return suggestions.filter(suggestion => 
      !suggestion.metadata.requiredRole || 
      suggestion.metadata.requiredRole === this.currentUser?.role
    );
  }

  private analyzeWorkflowPatterns(): any {
    // Analyze common patterns in the workflow
    // This would typically involve ML model analysis
    return {
      commonNodes: [],
      commonConnections: [],
      validationPatterns: []
    };
  }

  private generateNodeSuggestions(patterns: any): AISuggestion[] {
    const suggestions: AISuggestion[] = [
      {
        id: 'add-consent-node',
        type: 'node',
        confidence: 0.85,
        description: 'Add patient consent form before lab orders',
        action: async () => {
          if (!this.currentUser?.permissions.includes('add_node')) {
            throw new Error('Unauthorized: Insufficient permissions to add node');
          }
          await this.addConsentNode();
        },
        metadata: {
          reason: 'Common pattern in lab workflows',
          impact: 'Improves compliance and patient safety',
          alternatives: ['Add consent checkbox to existing form'],
          requiredRole: 'clinician'
        }
      }
    ];

    suggestions.forEach(suggestion => this.suggestions.set(suggestion.id, suggestion));
    return suggestions;
  }

  private generateConnectionSuggestions(patterns: any): AISuggestion[] {
    const suggestions: AISuggestion[] = [
      {
        id: 'add-insurance-verification',
        type: 'connection',
        confidence: 0.92,
        description: 'Connect insurance verification to patient intake',
        action: async () => {
          if (!this.currentUser?.permissions.includes('add_connection')) {
            throw new Error('Unauthorized: Insufficient permissions to add connection');
          }
          await this.addInsuranceVerificationConnection();
        },
        metadata: {
          reason: 'Reduces claim denials',
          impact: 'Improves revenue cycle efficiency',
          requiredRole: 'admin'
        }
      }
    ];

    suggestions.forEach(suggestion => this.suggestions.set(suggestion.id, suggestion));
    return suggestions;
  }

  private generateValidationSuggestions(patterns: any): AISuggestion[] {
    const suggestions: AISuggestion[] = [
      {
        id: 'add-insurance-validation',
        type: 'validation',
        confidence: 0.78,
        description: 'Add validation for insurance policy numbers',
        action: async () => {
          if (!this.currentUser?.permissions.includes('add_validation')) {
            throw new Error('Unauthorized: Insufficient permissions to add validation');
          }
          await this.addInsuranceValidation();
        },
        metadata: {
          reason: 'Common source of errors',
          impact: 'Reduces data entry errors',
          requiredRole: 'nurse'
        }
      }
    ];

    suggestions.forEach(suggestion => this.suggestions.set(suggestion.id, suggestion));
    return suggestions;
  }

  // Workflow Automation
  public async automateWorkflow(templateId: string): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Apply template to current workflow
    this.applyTemplate(template);

    // Generate and apply AI suggestions
    const suggestions = await this.generateSuggestions();
    this.applySuggestions(suggestions);

    // Calculate and store metrics
    const metrics = this.calculateWorkflowMetrics(template);
    this.storeMetrics(metrics);
  }

  private applyTemplate(template: WorkflowTemplate): void {
    // Apply template nodes to the workflow
    template.nodes.forEach(node => {
      this.graphData.nodes.push(node);
    });

    // Apply template connections
    this.createTemplateConnections(template);
  }

  private createTemplateConnections(template: WorkflowTemplate): void {
    // Create connections between template nodes
    for (let i = 0; i < template.nodes.length - 1; i++) {
      this.graphData.edges.push({
        id: `edge-${template.nodes[i].id}-${template.nodes[i + 1].id}`,
        source: template.nodes[i].id,
        target: template.nodes[i + 1].id
      });
    }
  }

  private applySuggestions(suggestions: AISuggestion[]): void {
    // Apply high-confidence suggestions
    suggestions
      .filter(s => s.confidence > 0.8)
      .forEach(s => s.action());
  }

  private calculateWorkflowMetrics(template: WorkflowTemplate): WorkflowMetrics {
    return {
      completionTime: template.metadata.estimatedTime,
      errorRate: 0.05, // Example value
      userSatisfaction: 0.85, // Example value
      costSavings: this.calculateCostSavings(template)
    };
  }

  private calculateCostSavings(template: WorkflowTemplate): number {
    // Calculate cost savings based on automation
    const manualTime = template.metadata.estimatedTime * 1.5; // Manual process takes 50% longer
    const hourlyRate = 50; // Example hourly rate
    return (manualTime - template.metadata.estimatedTime) * (hourlyRate / 60);
  }

  private storeMetrics(metrics: WorkflowMetrics): void {
    // Store metrics for analysis and reporting
    // This would typically involve database storage
    console.log('Workflow metrics:', metrics);
  }

  // Helper methods for AI suggestions
  private addConsentNode(): void {
    // Implementation for adding consent node
  }

  private addInsuranceVerificationConnection(): void {
    // Implementation for adding insurance verification connection
  }

  private addInsuranceValidation(): void {
    // Implementation for adding insurance validation
  }

  public async applySuggestion(suggestionId: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user is currently logged in');
    }

    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion) {
      throw new Error(`Suggestion ${suggestionId} not found`);
    }

    if (suggestion.metadata.requiredRole && suggestion.metadata.requiredRole !== this.currentUser.role) {
      throw new Error(`Unauthorized: This suggestion requires ${suggestion.metadata.requiredRole} role`);
    }

    // Apply the suggestion's action
    await suggestion.action();

    // Remove the applied suggestion
    this.suggestions.delete(suggestionId);
  }
} 