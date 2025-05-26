import { GraphData, FormNode } from '../types/graph';

interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resourceType: 'form' | 'mapping' | 'workflow';
  resourceId: string;
  details: {
    before?: any;
    after?: any;
    changes?: any[];
  };
  ipAddress?: string;
  userAgent?: string;
}

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

interface AccessControl {
  userId: string;
  roles: string[];
  permissions: string[];
  restrictions?: {
    forms?: string[];
    fields?: string[];
    timeRestrictions?: {
      startTime?: string;
      endTime?: string;
      daysOfWeek?: number[];
    };
  };
}

export class SecurityService {
  private graphData: GraphData;
  private auditTrail: AuditEvent[] = [];
  private roles: UserRole[] = [];
  private accessControls: Map<string, AccessControl> = new Map();

  constructor(graphData: GraphData) {
    this.graphData = graphData;
    this.initializeRoles();
  }

  private initializeRoles(): void {
    this.roles = [
      {
        id: 'admin',
        name: 'Administrator',
        permissions: ['*'],
        description: 'Full system access'
      },
      {
        id: 'clinician',
        name: 'Clinician',
        permissions: [
          'read:forms',
          'write:forms',
          'read:mappings',
          'write:mappings',
          'read:workflows'
        ],
        description: 'Healthcare provider access'
      },
      {
        id: 'nurse',
        name: 'Nurse',
        permissions: [
          'read:forms',
          'write:forms',
          'read:mappings'
        ],
        description: 'Nursing staff access'
      },
      {
        id: 'researcher',
        name: 'Researcher',
        permissions: [
          'read:forms',
          'read:mappings',
          'read:workflows'
        ],
        description: 'Research staff access'
      }
    ];
  }

  // HIPAA Compliance Methods
  public validateHIPAACompliance(formId: string): {
    isCompliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const form = this.graphData.nodes.find(n => n.id === formId);
    if (!form) {
      throw new Error(`Form ${formId} not found`);
    }

    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check for PHI fields
    const phiFields = this.detectPHIFields(form);
    if (phiFields.length > 0) {
      violations.push(`Found ${phiFields.length} PHI fields without proper protection`);
      recommendations.push('Implement field-level encryption for PHI fields');
    }

    // Check audit trail
    const auditEvents = this.getAuditTrail(formId);
    if (auditEvents.length === 0) {
      violations.push('No audit trail found for form');
      recommendations.push('Implement comprehensive audit logging');
    }

    // Check access controls
    const accessControl = this.getAccessControl(formId);
    if (!accessControl) {
      violations.push('No access control configuration found');
      recommendations.push('Implement role-based access control');
    }

    return {
      isCompliant: violations.length === 0,
      violations,
      recommendations
    };
  }

  private detectPHIFields(form: FormNode): string[] {
    const phiKeywords = [
      'patient', 'medical', 'health', 'diagnosis', 'treatment',
      'name', 'dob', 'ssn', 'address', 'phone', 'email'
    ];

    return Object.entries(form.data.field_schema?.properties || {})
      .filter(([_, field]) => 
        phiKeywords.some(keyword => 
          field.type?.toLowerCase().includes(keyword) ||
          field.description?.toLowerCase().includes(keyword)
        )
      )
      .map(([fieldId]) => fieldId);
  }

  // Audit Trail Methods
  public logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    this.auditTrail.push(auditEvent);
    this.persistAuditEvent(auditEvent);
  }

  public getAuditTrail(
    resourceId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      userId?: string;
      action?: string;
    }
  ): AuditEvent[] {
    return this.auditTrail.filter(event => {
      if (event.resourceId !== resourceId) return false;
      if (options?.startDate && event.timestamp < options.startDate) return false;
      if (options?.endDate && event.timestamp > options.endDate) return false;
      if (options?.userId && event.userId !== options.userId) return false;
      if (options?.action && event.action !== options.action) return false;
      return true;
    });
  }

  private persistAuditEvent(event: AuditEvent): void {
    // In a real implementation, this would persist to a secure database
    console.log('Persisting audit event:', event);
  }

  // Role-Based Access Control Methods
  public assignRole(userId: string, roleIds: string[]): void {
    const permissions = new Set<string>();
    const roles = this.roles.filter(role => roleIds.includes(role.id));

    roles.forEach(role => {
      role.permissions.forEach(permission => {
        if (permission === '*') {
          permissions.add('*');
        } else {
          permissions.add(permission);
        }
      });
    });

    this.accessControls.set(userId, {
      userId,
      roles: roleIds,
      permissions: Array.from(permissions)
    });
  }

  public checkAccess(
    userId: string,
    permission: string,
    resourceId: string
  ): boolean {
    const accessControl = this.accessControls.get(userId);
    if (!accessControl) return false;

    // Check for wildcard permission
    if (accessControl.permissions.includes('*')) return true;

    // Check specific permission
    if (!accessControl.permissions.includes(permission)) return false;

    // Check resource restrictions
    if (accessControl.restrictions?.forms?.includes(resourceId)) return false;

    return true;
  }

  public getAccessControl(userId: string): AccessControl | undefined {
    return this.accessControls.get(userId);
  }

  // Compliance Reporting
  public generateComplianceReport(): {
    hipaaCompliance: {
      compliantForms: number;
      nonCompliantForms: number;
      violations: string[];
    };
    auditTrail: {
      totalEvents: number;
      eventsByType: Record<string, number>;
      recentEvents: AuditEvent[];
    };
    accessControl: {
      totalUsers: number;
      usersByRole: Record<string, number>;
      restrictedResources: number;
    };
  } {
    const hipaaResults = this.graphData.nodes.map(node => 
      this.validateHIPAACompliance(node.id)
    );

    const auditEventsByType = this.auditTrail.reduce((acc, event) => {
      acc[event.action] = (acc[event.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const usersByRole = Array.from(this.accessControls.values()).reduce((acc, control) => {
      control.roles.forEach(role => {
        acc[role] = (acc[role] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      hipaaCompliance: {
        compliantForms: hipaaResults.filter(r => r.isCompliant).length,
        nonCompliantForms: hipaaResults.filter(r => !r.isCompliant).length,
        violations: hipaaResults.flatMap(r => r.violations)
      },
      auditTrail: {
        totalEvents: this.auditTrail.length,
        eventsByType: auditEventsByType,
        recentEvents: this.auditTrail.slice(-10)
      },
      accessControl: {
        totalUsers: this.accessControls.size,
        usersByRole,
        restrictedResources: this.graphData.nodes.filter(node => 
          Array.from(this.accessControls.values()).some(control => 
            control.restrictions?.forms?.includes(node.id)
          )
        ).length
      }
    };
  }
} 