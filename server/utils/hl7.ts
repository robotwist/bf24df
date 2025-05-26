interface HL7Message {
  messageType: string;
  messageId: string;
  timestamp: string;
  segments: HL7Segment[];
}

interface HL7Segment {
  segmentId: string;
  fields: string[];
}

export const validateHL7Message = (message: string): boolean => {
  if (!message || typeof message !== 'string') {
    return false;
  }

  // Check for MSH segment
  if (!message.startsWith('MSH|')) {
    return false;
  }

  // Basic validation of message structure
  const segments = message.split('\r');
  if (segments.length < 2) {
    return false;
  }

  // Validate MSH segment
  const mshFields = segments[0].split('|');
  if (mshFields.length < 12) {
    return false;
  }

  return true;
};

export const parseHL7Message = (message: string): HL7Message => {
  const segments = message.split('\r').filter(segment => segment.trim());
  const mshFields = segments[0].split('|');

  return {
    messageType: mshFields[8],
    messageId: mshFields[9],
    timestamp: mshFields[6],
    segments: segments.map(segment => ({
      segmentId: segment.substring(0, 3),
      fields: segment.split('|').slice(1),
    })),
  };
};

export const createHL7Message = (data: any, messageType: string): string => {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const messageId = `MSG${Date.now()}`;

  let message = '';
  
  // MSH Segment
  message += `MSH|^~\\&|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|${timestamp}||${messageType}|${messageId}|P|2.5\r`;

  // Add message type specific segments
  switch (messageType) {
    case 'ADT^A01':
      message += createADTA01Segments(data);
      break;
    case 'ORU^R01':
      message += createORUR01Segments(data);
      break;
    case 'ORM^O01':
      message += createORMO01Segments(data);
      break;
    default:
      throw new Error(`Unsupported message type: ${messageType}`);
  }

  return message;
};

const createADTA01Segments = (data: any): string => {
  let segments = '';

  // PID Segment
  segments += `PID|1|${data.patientId}||${data.mrn}||${data.lastName}^${data.firstName}||${data.dateOfBirth}|${data.gender}|||${data.address}||${data.phone}||${data.maritalStatus}||${data.race}||${data.ethnicity}\r`;

  // PV1 Segment
  segments += `PV1|1|O|${data.admissionType}||${data.admitDateTime}||${data.admittingProvider}||${data.assignedLocation}||${data.admissionSource}\r`;

  return segments;
};

const createORUR01Segments = (data: any): string => {
  let segments = '';

  // PID Segment
  segments += `PID|1|${data.patientId}||${data.mrn}||${data.lastName}^${data.firstName}||${data.dateOfBirth}|${data.gender}\r`;

  // OBR Segment
  segments += `OBR|1|${data.orderId}||${data.observationCode}||${data.collectionDateTime}||${data.collectorId}||${data.specimenSource}||${data.diagnosticServId}\r`;

  // OBX Segments
  data.observations.forEach((obs: any, index: number) => {
    segments += `OBX|${index + 1}|${obs.valueType}|${obs.observationId}|${obs.observationValue}|${obs.units}|${obs.referenceRange}|${obs.abnormalFlags}|${obs.status}|${obs.observationDateTime}\r`;
  });

  return segments;
};

const createORMO01Segments = (data: any): string => {
  let segments = '';

  // PID Segment
  segments += `PID|1|${data.patientId}||${data.mrn}||${data.lastName}^${data.firstName}||${data.dateOfBirth}|${data.gender}\r`;

  // ORC Segment
  segments += `ORC|${data.orderControl}|${data.orderId}||${data.fillerOrderId}||${data.orderStatus}||${data.transactionDateTime}||${data.orderingProvider}||${data.actionBy}||${data.orderingFacility}\r`;

  // OBR Segment
  segments += `OBR|1|${data.orderId}||${data.universalServiceId}||${data.collectionDateTime}||${data.collectorId}||${data.specimenSource}||${data.diagnosticServId}||${data.relevantClinicalInfo}||${data.specimenSource}||${data.orderingFacility}||${data.placerField1}||${data.placerField2}||${data.fillerField1}||${data.fillerField2}||${data.diagnosticServId}||${data.resultStatus}||${data.parentResult}||${data.quantityTiming}||${data.resultCopiesTo}||${data.parentNumber}||${data.transportationMode}||${data.reasonForStudy}||${data.principalResultInterpreter}||${data.assistantResultInterpreter}||${data.technician}||${data.transcriptionist}||${data.scheduledDateTime}||${data.numberOfSampleContainers}||${data.transportLogistics}||${data.collectorsComment}||${data.transportArrangement}||${data.transportArranged}||${data.escortRequired}||${data.plannedPatientTransportComment}\r`;

  return segments;
}; 