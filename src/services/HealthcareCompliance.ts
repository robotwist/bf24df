import { GraphData, FormNode } from '../types/graph';

interface ComplianceMetrics {
  hipaaCompliance: {
    score: number;
    violations: string[];
    recommendations: string[];
  };
  auditTrail: {
    timestamp: string;
    action: string;
    user: string;
    details: string;
  }[];
  complianceGaps: {
    severity: 'high' | 'medium' | 'low';
    description: string;
    affectedForms: string[];
    remediationSteps: string[];
  }[];
  regulatoryStatus: {
    hipaa: boolean;
    hitech: boolean;
    meaningfulUse: boolean;
    details: string[];
  };
}

interface DataFlowAnalysis {
  source: string;
  destination: string;
  dataTypes: string[];
  sensitivity: 'high' | 'medium' | 'low';
  complianceRequirements: string[];
  risks: string[];
}

export class HealthcareCompliance {
  private graphData: GraphData;
  private auditLog: any[] = [];

  constructor(graphData: GraphData) {
    this.graphData = graphData;
  }

  // HIPAA Data Flow Tracking
  analyzeDataFlow(formId: string): DataFlowAnalysis[] {
    const node = this.graphData.nodes.find(n => n.id === formId);
    if (!node) return [];

    const flows: DataFlowAnalysis[] = [];
    const dependencies = this.getDependencyForms(formId);
    const dependents = this.getDependentForms(formId);

    // Analyze incoming data flows
    dependencies.forEach(dep => {
      flows.push(this.createDataFlowAnalysis(dep, node));
    });

    // Analyze outgoing data flows
    dependents.forEach(dep => {
      flows.push(this.createDataFlowAnalysis(node, dep));
    });

    return flows;
  }

  private createDataFlowAnalysis(
    source: FormNode,
    destination: FormNode
  ): DataFlowAnalysis {
    const dataTypes = this.extractDataTypes(source);
    const sensitivity = this.calculateDataSensitivity(dataTypes);

    return {
      source: source.id,
      destination: destination.id,
      dataTypes,
      sensitivity,
      complianceRequirements: this.getComplianceRequirements(dataTypes),
      risks: this.identifyDataFlowRisks(source, destination, dataTypes)
    };
  }

  private extractDataTypes(node: FormNode): string[] {
    const fields = node.data.field_schema?.properties || {};
    return Object.values(fields).map(field => field.type);
  }

  private calculateDataSensitivity(dataTypes: string[]): 'high' | 'medium' | 'low' {
    const sensitiveTypes = ['ssn', 'dob', 'medical_record', 'diagnosis'];
    const count = dataTypes.filter(type => 
      sensitiveTypes.some(sensitive => type.toLowerCase().includes(sensitive))
    ).length;

    if (count > 2) return 'high';
    if (count > 0) return 'medium';
    return 'low';
  }

  private getComplianceRequirements(dataTypes: string[]): string[] {
    const requirements: string[] = [];

    if (dataTypes.some(type => type.toLowerCase().includes('phi'))) {
      requirements.push('HIPAA Privacy Rule');
      requirements.push('HIPAA Security Rule');
    }

    if (dataTypes.some(type => type.toLowerCase().includes('ehr'))) {
      requirements.push('HITECH Act');
      requirements.push('Meaningful Use');
    }

    return requirements;
  }

  private identifyDataFlowRisks(
    source: FormNode,
    destination: FormNode,
    dataTypes: string[]
  ): string[] {
    const risks: string[] = [];

    if (this.calculateDataSensitivity(dataTypes) === 'high') {
      risks.push('High sensitivity data transfer');
    }

    if (this.isExternalForm(destination)) {
      risks.push('External data transfer');
    }

    if (!this.hasRequiredConsent(source, destination)) {
      risks.push('Missing required consent');
    }

    return risks;
  }

  // Audit Trail Generation
  generateAuditTrail(formId: string): ComplianceMetrics['auditTrail'] {
    return this.auditLog.filter(log => 
      log.formId === formId
    ).map(log => ({
      timestamp: log.timestamp,
      action: log.action,
      user: log.user,
      details: log.details
    }));
  }

  logAuditEvent(
    formId: string,
    action: string,
    user: string,
    details: string
  ): void {
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      formId,
      action,
      user,
      details
    });
  }

  // Compliance Gap Detection
  detectComplianceGaps(formId: string): ComplianceMetrics['complianceGaps'] {
    const gaps: ComplianceMetrics['complianceGaps'] = [];
    const node = this.graphData.nodes.find(n => n.id === formId);
    if (!node) return gaps;

    // Check HIPAA compliance
    const hipaaGaps = this.checkHIPAAGaps(node);
    gaps.push(...hipaaGaps);

    // Check data flow compliance
    const flowGaps = this.checkDataFlowGaps(node);
    gaps.push(...flowGaps);

    // Check form validation compliance
    const validationGaps = this.checkValidationGaps(node);
    gaps.push(...validationGaps);

    return gaps;
  }

  private checkHIPAAGaps(node: FormNode): ComplianceMetrics['complianceGaps'] {
    const gaps: ComplianceMetrics['complianceGaps'] = [];
    const fields = node.data.field_schema?.properties || {};

    // Check for PHI fields without proper encryption
    Object.entries(fields).forEach(([fieldId, field]) => {
      if (this.isPHIField(field) && !this.hasEncryption(field)) {
        gaps.push({
          severity: 'high',
          description: `PHI field "${fieldId}" lacks encryption`,
          affectedForms: [node.id],
          remediationSteps: [
            'Implement field-level encryption',
            'Add encryption key management',
            'Update data access controls'
          ]
        });
      }
    });

    return gaps;
  }

  private checkDataFlowGaps(node: FormNode): ComplianceMetrics['complianceGaps'] {
    const gaps: ComplianceMetrics['complianceGaps'] = [];
    const flows = this.analyzeDataFlow(node.id);

    flows.forEach(flow => {
      if (flow.sensitivity === 'high' && !this.hasDataFlowControls(flow)) {
        gaps.push({
          severity: 'high',
          description: `High sensitivity data flow lacks proper controls`,
          affectedForms: [flow.source, flow.destination],
          remediationSteps: [
            'Implement data flow monitoring',
            'Add access controls',
            'Document data flow agreements'
          ]
        });
      }
    });

    return gaps;
  }

  private checkValidationGaps(node: FormNode): ComplianceMetrics['complianceGaps'] {
    const gaps: ComplianceMetrics['complianceGaps'] = [];
    const fields = node.data.field_schema?.properties || {};

    Object.entries(fields).forEach(([fieldId, field]) => {
      if (this.isPHIField(field) && !this.hasRequiredValidation(field)) {
        gaps.push({
          severity: 'medium',
          description: `PHI field "${fieldId}" lacks required validation`,
          affectedForms: [node.id],
          remediationSteps: [
            'Add data format validation',
            'Implement value range checks',
            'Add required field validation'
          ]
        });
      }
    });

    return gaps;
  }

  // Regulatory Reporting
  generateRegulatoryReport(formId: string): ComplianceMetrics['regulatoryStatus'] {
    const node = this.graphData.nodes.find(n => n.id === formId);
    if (!node) throw new Error('Form not found');

    const details: string[] = [];
    const flows = this.analyzeDataFlow(formId);
    const gaps = this.detectComplianceGaps(formId);

    // Check HIPAA compliance
    const hipaaCompliant = this.checkHIPAACompliance(node, flows);
    if (!hipaaCompliant) {
      details.push('HIPAA compliance gaps detected');
    }

    // Check HITECH compliance
    const hitechCompliant = this.checkHITECHCompliance(node);
    if (!hitechCompliant) {
      details.push('HITECH compliance gaps detected');
    }

    // Check Meaningful Use compliance
    const meaningfulUseCompliant = this.checkMeaningfulUseCompliance(node);
    if (!meaningfulUseCompliant) {
      details.push('Meaningful Use compliance gaps detected');
    }

    return {
      hipaa: hipaaCompliant,
      hitech: hitechCompliant,
      meaningfulUse: meaningfulUseCompliant,
      details
    };
  }

  // Helper Methods
  private getDependencyForms(formId: string): FormNode[] {
    const node = this.graphData.nodes.find(n => n.id === formId);
    if (!node) return [];

    return this.graphData.nodes.filter(n => 
      node.data.prerequisites.includes(n.id)
    );
  }

  private getDependentForms(formId: string): FormNode[] {
    return this.graphData.nodes.filter(node => 
      node.data.prerequisites.includes(formId)
    );
  }

  private isExternalForm(node: FormNode): boolean {
    // This would be more sophisticated in a real implementation
    return node.data.component_id.includes('external');
  }

  private hasRequiredConsent(source: FormNode, destination: FormNode): boolean {
    // This would check actual consent records
    return true; // Placeholder
  }

  private isPHIField(field: any): boolean {
    const phiKeywords = ['patient', 'medical', 'health', 'diagnosis', 'treatment'];
    return phiKeywords.some(keyword => 
      field.type?.toLowerCase().includes(keyword) ||
      field.description?.toLowerCase().includes(keyword)
    );
  }

  private hasEncryption(field: any): boolean {
    // This would check actual encryption settings
    return false; // Placeholder
  }

  private hasDataFlowControls(flow: DataFlowAnalysis): boolean {
    // This would check actual data flow controls
    return false; // Placeholder
  }

  private hasRequiredValidation(field: any): boolean {
    return field.pattern || field.minLength || field.maxLength;
  }

  private checkHIPAACompliance(
    node: FormNode,
    flows: DataFlowAnalysis[]
  ): boolean {
    const gaps = this.checkHIPAAGaps(node);
    const hasHighRiskFlows = flows.some(flow => 
      flow.sensitivity === 'high' && !this.hasDataFlowControls(flow)
    );

    return gaps.length === 0 && !hasHighRiskFlows;
  }

  private checkHITECHCompliance(node: FormNode): boolean {
    // This would implement actual HITECH compliance checks
    return true; // Placeholder
  }

  private checkMeaningfulUseCompliance(node: FormNode): boolean {
    // This would implement actual Meaningful Use compliance checks
    return true; // Placeholder
  }
} 