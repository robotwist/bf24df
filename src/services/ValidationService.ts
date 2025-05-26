import { GraphData, FormNode } from '../types/graph';

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  validate: (node: FormNode) => ValidationResult;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  details?: string[];
  recommendations?: string[];
}

interface ValidationReport {
  formId: string;
  timestamp: string;
  overallStatus: 'pass' | 'fail' | 'warning';
  rules: {
    ruleId: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    details?: string[];
  }[];
  summary: {
    totalRules: number;
    passedRules: number;
    failedRules: number;
    warningRules: number;
  };
}

export class ValidationService {
  private graphData: GraphData;
  private rules: ValidationRule[];

  constructor(graphData: GraphData) {
    this.graphData = graphData;
    this.rules = this.initializeRules();
  }

  private initializeRules(): ValidationRule[] {
    return [
      // HIPAA Compliance Rules
      {
        id: 'hipaa-phi',
        name: 'PHI Data Validation',
        description: 'Ensures proper handling of Protected Health Information',
        severity: 'error',
        validate: (node: FormNode) => {
          const phiFields = this.findPHIFields(node);
          const hasEncryption = this.checkFieldEncryption(node);
          const hasAccessControl = this.checkAccessControl(node);

          return {
            isValid: phiFields.length === 0 || (hasEncryption && hasAccessControl),
            message: phiFields.length > 0 
              ? `Found ${phiFields.length} PHI fields without proper protection`
              : 'No PHI fields found or all properly protected',
            details: phiFields,
            recommendations: [
              'Implement field-level encryption',
              'Add access control mechanisms',
              'Document PHI handling procedures'
            ]
          };
        }
      },
      {
        id: 'hipaa-audit',
        name: 'Audit Trail Validation',
        description: 'Ensures proper audit trail implementation',
        severity: 'error',
        validate: (node: FormNode) => {
          const hasAuditTrail = this.checkAuditTrail(node);
          const hasTimestamp = this.checkTimestamp(node);
          const hasUserTracking = this.checkUserTracking(node);

          return {
            isValid: hasAuditTrail && hasTimestamp && hasUserTracking,
            message: 'Audit trail implementation check',
            details: [
              hasAuditTrail ? 'Audit trail present' : 'Missing audit trail',
              hasTimestamp ? 'Timestamp tracking present' : 'Missing timestamp tracking',
              hasUserTracking ? 'User tracking present' : 'Missing user tracking'
            ],
            recommendations: [
              'Implement comprehensive audit logging',
              'Add timestamp tracking for all changes',
              'Implement user action tracking'
            ]
          };
        }
      },

      // Data Quality Rules
      {
        id: 'data-completeness',
        name: 'Data Completeness Check',
        description: 'Ensures all required fields are present and properly validated',
        severity: 'warning',
        validate: (node: FormNode) => {
          const requiredFields = node.data.field_schema?.required || [];
          const allFields = Object.keys(node.data.field_schema?.properties || {});
          const missingFields = requiredFields.filter(field => !allFields.includes(field));

          return {
            isValid: missingFields.length === 0,
            message: missingFields.length > 0 
              ? `Missing ${missingFields.length} required fields`
              : 'All required fields present',
            details: missingFields,
            recommendations: [
              'Add missing required fields',
              'Update field validation rules',
              'Review field requirements'
            ]
          };
        }
      },
      {
        id: 'data-format',
        name: 'Data Format Validation',
        description: 'Ensures proper data format and type validation',
        severity: 'error',
        validate: (node: FormNode) => {
          const fields = node.data.field_schema?.properties || {};
          const formatErrors = this.checkFieldFormats(fields);

          return {
            isValid: formatErrors.length === 0,
            message: formatErrors.length > 0 
              ? `Found ${formatErrors.length} format validation errors`
              : 'All fields have proper format validation',
            details: formatErrors,
            recommendations: [
              'Add proper format validation',
              'Implement type checking',
              'Add format-specific validation rules'
            ]
          };
        }
      },

      // Workflow Rules
      {
        id: 'workflow-dependencies',
        name: 'Workflow Dependency Check',
        description: 'Validates form dependencies and prerequisites',
        severity: 'warning',
        validate: (node: FormNode) => {
          const dependencies = this.checkDependencies(node);
          const cycles = this.checkCycles(node);

          return {
            isValid: dependencies.isValid && !cycles.hasCycle,
            message: cycles.hasCycle 
              ? 'Circular dependency detected'
              : dependencies.message,
            details: [
              ...dependencies.details,
              cycles.hasCycle ? 'Circular dependency found' : 'No circular dependencies'
            ],
            recommendations: [
              'Review form dependencies',
              'Resolve circular dependencies',
              'Optimize workflow path'
            ]
          };
        }
      }
    ];
  }

  validateForm(formId: string): ValidationReport {
    const node = this.graphData.nodes.find(n => n.id === formId);
    if (!node) {
      throw new Error(`Form ${formId} not found`);
    }

    const results = this.rules.map(rule => {
      const result = rule.validate(node);
      return {
        ruleId: rule.id,
        status: result.isValid ? 'pass' : (rule.severity === 'error' ? 'fail' : 'warning'),
        message: result.message,
        details: result.details
      };
    });

    const summary = {
      totalRules: results.length,
      passedRules: results.filter(r => r.status === 'pass').length,
      failedRules: results.filter(r => r.status === 'fail').length,
      warningRules: results.filter(r => r.status === 'warning').length
    };

    const overallStatus = summary.failedRules > 0 ? 'fail' : 
                         summary.warningRules > 0 ? 'warning' : 'pass';

    return {
      formId,
      timestamp: new Date().toISOString(),
      overallStatus,
      rules: results,
      summary
    };
  }

  validateAllForms(): ValidationReport[] {
    return this.graphData.nodes.map(node => this.validateForm(node.id));
  }

  // Helper Methods
  private findPHIFields(node: FormNode): string[] {
    const phiKeywords = ['patient', 'medical', 'health', 'diagnosis', 'treatment'];
    const fields = node.data.field_schema?.properties || {};
    
    return Object.entries(fields)
      .filter(([_, field]) => 
        phiKeywords.some(keyword => 
          field.type?.toLowerCase().includes(keyword) ||
          field.description?.toLowerCase().includes(keyword)
        )
      )
      .map(([fieldId]) => fieldId);
  }

  private checkFieldEncryption(node: FormNode): boolean {
    // This would check actual encryption settings
    return false; // Placeholder
  }

  private checkAccessControl(node: FormNode): boolean {
    // This would check actual access control settings
    return false; // Placeholder
  }

  private checkAuditTrail(node: FormNode): boolean {
    // This would check actual audit trail implementation
    return false; // Placeholder
  }

  private checkTimestamp(node: FormNode): boolean {
    // This would check timestamp tracking implementation
    return false; // Placeholder
  }

  private checkUserTracking(node: FormNode): boolean {
    // This would check user tracking implementation
    return false; // Placeholder
  }

  private checkFieldFormats(fields: any): string[] {
    const errors: string[] = [];
    
    Object.entries(fields).forEach(([fieldId, field]) => {
      if (!field.type) {
        errors.push(`${fieldId}: Missing type definition`);
      }
      if (field.type === 'string' && !field.pattern && !field.format) {
        errors.push(`${fieldId}: Missing format validation for string field`);
      }
      if (field.type === 'number' && (field.minimum === undefined || field.maximum === undefined)) {
        errors.push(`${fieldId}: Missing range validation for number field`);
      }
    });

    return errors;
  }

  private checkDependencies(node: FormNode): { 
    isValid: boolean; 
    message: string; 
    details: string[] 
  } {
    const prerequisites = node.data.prerequisites || [];
    const missingPrereqs = prerequisites.filter(prereq => 
      !this.graphData.nodes.some(n => n.id === prereq)
    );

    return {
      isValid: missingPrereqs.length === 0,
      message: missingPrereqs.length > 0 
        ? `Missing ${missingPrereqs.length} prerequisite forms`
        : 'All prerequisites present',
      details: missingPrereqs.map(prereq => `Missing prerequisite: ${prereq}`)
    };
  }

  private checkCycles(node: FormNode): { 
    hasCycle: boolean; 
    cyclePath?: string[] 
  } {
    const visited = new Set<string>();
    const path: string[] = [];

    const hasCycle = this.detectCycle(node.id, visited, path);

    return {
      hasCycle,
      cyclePath: hasCycle ? [...path] : undefined
    };
  }

  private detectCycle(
    nodeId: string,
    visited: Set<string>,
    path: string[]
  ): boolean {
    if (path.includes(nodeId)) {
      return true;
    }

    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    path.push(nodeId);

    const node = this.graphData.nodes.find(n => n.id === nodeId);
    if (!node) return false;

    for (const prereq of node.data.prerequisites) {
      if (this.detectCycle(prereq, visited, path)) {
        return true;
      }
    }

    path.pop();
    return false;
  }
} 