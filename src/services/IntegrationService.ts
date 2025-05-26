import { GraphData, FormNode } from '../types/graph';

interface FHIRResource {
  resourceType: string;
  id: string;
  meta?: {
    versionId: string;
    lastUpdated: string;
  };
  [key: string]: any;
}

interface HL7Message {
  messageType: string;
  messageId: string;
  timestamp: string;
  segments: HL7Segment[];
}

interface HL7Segment {
  segmentType: string;
  fields: string[];
}

interface IntegrationConfig {
  fhirEndpoint: string;
  hl7Endpoint: string;
  apiKey?: string;
  authToken?: string;
  retryAttempts: number;
  timeout: number;
}

export class IntegrationService {
  private graphData: GraphData;
  private config: IntegrationConfig;
  private fhirVersion: string = 'R4';
  private hl7Version: string = '2.8';

  constructor(graphData: GraphData, config: IntegrationConfig) {
    this.graphData = graphData;
    this.config = config;
  }

  // FHIR Integration
  public async convertToFHIR(formNode: FormNode): Promise<FHIRResource> {
    const resource: FHIRResource = {
      resourceType: this.determineFHIRResourceType(formNode),
      id: formNode.id,
      meta: {
        versionId: '1',
        lastUpdated: new Date().toISOString()
      }
    };

    // Map form fields to FHIR resource properties
    this.mapFormToFHIR(formNode, resource);
    return resource;
  }

  private determineFHIRResourceType(formNode: FormNode): string {
    // Map form types to FHIR resource types
    const typeMap: { [key: string]: string } = {
      'patient': 'Patient',
      'observation': 'Observation',
      'procedure': 'Procedure',
      'medication': 'MedicationRequest',
      'diagnosis': 'Condition',
      'lab': 'DiagnosticReport'
    };

    return typeMap[formNode.type] || 'QuestionnaireResponse';
  }

  private mapFormToFHIR(formNode: FormNode, resource: FHIRResource): void {
    // Map form fields to FHIR resource properties based on form type
    switch (resource.resourceType) {
      case 'Patient':
        this.mapPatientFields(formNode, resource);
        break;
      case 'Observation':
        this.mapObservationFields(formNode, resource);
        break;
      case 'Procedure':
        this.mapProcedureFields(formNode, resource);
        break;
      default:
        this.mapGenericFields(formNode, resource);
    }
  }

  private mapPatientFields(formNode: FormNode, resource: FHIRResource): void {
    resource.name = [{
      family: formNode.fields.find(f => f.id === 'lastName')?.value,
      given: [formNode.fields.find(f => f.id === 'firstName')?.value]
    }];
    resource.birthDate = formNode.fields.find(f => f.id === 'dateOfBirth')?.value;
    resource.gender = formNode.fields.find(f => f.id === 'gender')?.value;
    // Add more patient-specific mappings
  }

  private mapObservationFields(formNode: FormNode, resource: FHIRResource): void {
    resource.status = 'final';
    resource.code = {
      coding: [{
        system: 'http://loinc.org',
        code: formNode.fields.find(f => f.id === 'loincCode')?.value,
        display: formNode.fields.find(f => f.id === 'observationName')?.value
      }]
    };
    resource.valueQuantity = {
      value: formNode.fields.find(f => f.id === 'value')?.value,
      unit: formNode.fields.find(f => f.id === 'unit')?.value
    };
  }

  private mapProcedureFields(formNode: FormNode, resource: FHIRResource): void {
    resource.status = 'completed';
    resource.code = {
      coding: [{
        system: 'http://snomed.info/sct',
        code: formNode.fields.find(f => f.id === 'procedureCode')?.value,
        display: formNode.fields.find(f => f.id === 'procedureName')?.value
      }]
    };
    resource.performedDateTime = formNode.fields.find(f => f.id === 'procedureDate')?.value;
  }

  private mapGenericFields(formNode: FormNode, resource: FHIRResource): void {
    // Map generic form fields to FHIR resource
    formNode.fields.forEach(field => {
      if (field.value) {
        resource[field.id] = field.value;
      }
    });
  }

  // HL7 Integration
  public convertToHL7(formNode: FormNode): HL7Message {
    const message: HL7Message = {
      messageType: this.determineHL7MessageType(formNode),
      messageId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      segments: []
    };

    // Add MSH segment
    message.segments.push(this.createMSHSegment(message));

    // Add form-specific segments
    this.addFormSpecificSegments(formNode, message);

    return message;
  }

  private determineHL7MessageType(formNode: FormNode): string {
    const typeMap: { [key: string]: string } = {
      'patient': 'ADT',
      'observation': 'ORU',
      'procedure': 'ORM',
      'medication': 'RDE',
      'lab': 'ORU'
    };

    return typeMap[formNode.type] || 'ORU';
  }

  private createMSHSegment(message: HL7Message): HL7Segment {
    return {
      segmentType: 'MSH',
      fields: [
        '|',
        '^~\\&',
        'SYSTEM',
        'FACILITY',
        'SYSTEM',
        'FACILITY',
        new Date().toISOString(),
        '',
        message.messageType,
        message.messageId,
        'P',
        this.hl7Version
      ]
    };
  }

  private addFormSpecificSegments(formNode: FormNode, message: HL7Message): void {
    switch (message.messageType) {
      case 'ADT':
        this.addPatientSegments(formNode, message);
        break;
      case 'ORU':
        this.addObservationSegments(formNode, message);
        break;
      case 'ORM':
        this.addOrderSegments(formNode, message);
        break;
      default:
        this.addGenericSegments(formNode, message);
    }
  }

  private addPatientSegments(formNode: FormNode, message: HL7Message): void {
    // Add PID segment
    message.segments.push({
      segmentType: 'PID',
      fields: [
        '1',
        formNode.id,
        '',
        '',
        `${formNode.fields.find(f => f.id === 'lastName')?.value}^${formNode.fields.find(f => f.id === 'firstName')?.value}`,
        '',
        formNode.fields.find(f => f.id === 'dateOfBirth')?.value,
        formNode.fields.find(f => f.id === 'gender')?.value
      ]
    });
  }

  private addObservationSegments(formNode: FormNode, message: HL7Message): void {
    // Add OBR segment
    message.segments.push({
      segmentType: 'OBR',
      fields: [
        '1',
        formNode.id,
        '',
        formNode.fields.find(f => f.id === 'observationCode')?.value,
        formNode.fields.find(f => f.id === 'observationName')?.value,
        '',
        new Date().toISOString()
      ]
    });

    // Add OBX segment
    message.segments.push({
      segmentType: 'OBX',
      fields: [
        '1',
        'NM',
        formNode.fields.find(f => f.id === 'observationCode')?.value,
        formNode.fields.find(f => f.id === 'observationName')?.value,
        formNode.fields.find(f => f.id === 'value')?.value,
        formNode.fields.find(f => f.id === 'unit')?.value,
        'N',
        ''
      ]
    });
  }

  private addOrderSegments(formNode: FormNode, message: HL7Message): void {
    // Add ORC segment
    message.segments.push({
      segmentType: 'ORC',
      fields: [
        'NW',
        formNode.id,
        '',
        '',
        '',
        '',
        '',
        new Date().toISOString()
      ]
    });

    // Add OBR segment
    message.segments.push({
      segmentType: 'OBR',
      fields: [
        '1',
        formNode.id,
        '',
        formNode.fields.find(f => f.id === 'procedureCode')?.value,
        formNode.fields.find(f => f.id === 'procedureName')?.value,
        '',
        formNode.fields.find(f => f.id === 'procedureDate')?.value
      ]
    });
  }

  private addGenericSegments(formNode: FormNode, message: HL7Message): void {
    // Add generic segments based on form fields
    formNode.fields.forEach((field, index) => {
      message.segments.push({
        segmentType: 'OBX',
        fields: [
          (index + 1).toString(),
          'ST',
          field.id,
          field.label,
          field.value,
          '',
          'N',
          ''
        ]
      });
    });
  }

  // API Integration
  public async sendToFHIRServer(resource: FHIRResource): Promise<Response> {
    const response = await fetch(`${this.config.fhirEndpoint}/${resource.resourceType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Authorization': `Bearer ${this.config.authToken}`,
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(resource)
    });

    if (!response.ok) {
      throw new Error(`FHIR server error: ${response.statusText}`);
    }

    return response;
  }

  public async sendToHL7Server(message: HL7Message): Promise<Response> {
    const response = await fetch(this.config.hl7Endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/hl7-v2',
        'Authorization': `Bearer ${this.config.authToken}`,
        'Accept': 'application/json'
      },
      body: this.formatHL7Message(message)
    });

    if (!response.ok) {
      throw new Error(`HL7 server error: ${response.statusText}`);
    }

    return response;
  }

  private formatHL7Message(message: HL7Message): string {
    return message.segments
      .map(segment => `${segment.segmentType}|${segment.fields.join('|')}`)
      .join('\r');
  }

  // Validation and Error Handling
  public validateFHIRResource(resource: FHIRResource): boolean {
    // Basic FHIR resource validation
    if (!resource.resourceType || !resource.id) {
      return false;
    }

    // Add more specific validation based on resource type
    switch (resource.resourceType) {
      case 'Patient':
        return this.validatePatientResource(resource);
      case 'Observation':
        return this.validateObservationResource(resource);
      case 'Procedure':
        return this.validateProcedureResource(resource);
      default:
        return true;
    }
  }

  private validatePatientResource(resource: FHIRResource): boolean {
    return !!(resource.name && resource.birthDate);
  }

  private validateObservationResource(resource: FHIRResource): boolean {
    return !!(resource.code && resource.valueQuantity);
  }

  private validateProcedureResource(resource: FHIRResource): boolean {
    return !!(resource.code && resource.performedDateTime);
  }

  public validateHL7Message(message: HL7Message): boolean {
    // Basic HL7 message validation
    if (!message.messageType || !message.messageId || !message.segments.length) {
      return false;
    }

    // Validate MSH segment
    const mshSegment = message.segments.find(s => s.segmentType === 'MSH');
    if (!mshSegment || mshSegment.fields.length < 12) {
      return false;
    }

    // Add more specific validation based on message type
    switch (message.messageType) {
      case 'ADT':
        return this.validateADTMessage(message);
      case 'ORU':
        return this.validateORUMessage(message);
      case 'ORM':
        return this.validateORMMessage(message);
      default:
        return true;
    }
  }

  private validateADTMessage(message: HL7Message): boolean {
    return !!message.segments.find(s => s.segmentType === 'PID');
  }

  private validateORUMessage(message: HL7Message): boolean {
    return !!(message.segments.find(s => s.segmentType === 'OBR') &&
              message.segments.find(s => s.segmentType === 'OBX'));
  }

  private validateORMMessage(message: HL7Message): boolean {
    return !!(message.segments.find(s => s.segmentType === 'ORC') &&
              message.segments.find(s => s.segmentType === 'OBR'));
  }
} 