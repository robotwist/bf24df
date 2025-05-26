interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
  };
  [key: string]: any;
}

export const validateFHIRResource = (resource: FHIRResource): boolean => {
  if (!resource || typeof resource !== 'object') {
    return false;
  }

  if (!resource.resourceType || typeof resource.resourceType !== 'string') {
    return false;
  }

  // Basic validation for common resource types
  switch (resource.resourceType) {
    case 'Patient':
      return validatePatient(resource);
    case 'Observation':
      return validateObservation(resource);
    case 'Condition':
      return validateCondition(resource);
    case 'Procedure':
      return validateProcedure(resource);
    default:
      return true; // Allow other resource types
  }
};

const validatePatient = (resource: FHIRResource): boolean => {
  if (!resource.name || !Array.isArray(resource.name)) {
    return false;
  }

  return resource.name.every((name: any) => {
    return (
      name &&
      typeof name === 'object' &&
      (Array.isArray(name.given) || typeof name.family === 'string')
    );
  });
};

const validateObservation = (resource: FHIRResource): boolean => {
  return (
    resource.status &&
    typeof resource.status === 'string' &&
    resource.code &&
    typeof resource.code === 'object'
  );
};

const validateCondition = (resource: FHIRResource): boolean => {
  return (
    resource.clinicalStatus &&
    typeof resource.clinicalStatus === 'object' &&
    resource.code &&
    typeof resource.code === 'object'
  );
};

const validateProcedure = (resource: FHIRResource): boolean => {
  return (
    resource.status &&
    typeof resource.status === 'string' &&
    resource.code &&
    typeof resource.code === 'object'
  );
};

export const convertToFHIR = (data: any, resourceType: string): FHIRResource => {
  const resource: FHIRResource = {
    resourceType,
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString(),
    },
  };

  switch (resourceType) {
    case 'Patient':
      return convertToPatient(data, resource);
    case 'Observation':
      return convertToObservation(data, resource);
    case 'Condition':
      return convertToCondition(data, resource);
    case 'Procedure':
      return convertToProcedure(data, resource);
    default:
      return resource;
  }
};

const convertToPatient = (data: any, resource: FHIRResource): FHIRResource => {
  return {
    ...resource,
    name: [
      {
        family: data.lastName,
        given: [data.firstName],
      },
    ],
    gender: data.gender,
    birthDate: data.dateOfBirth,
    identifier: [
      {
        system: 'http://example.com/mrn',
        value: data.mrn,
      },
    ],
  };
};

const convertToObservation = (data: any, resource: FHIRResource): FHIRResource => {
  return {
    ...resource,
    status: 'final',
    code: {
      coding: [
        {
          system: data.codeSystem,
          code: data.code,
          display: data.display,
        },
      ],
    },
    valueQuantity: {
      value: data.value,
      unit: data.unit,
    },
    effectiveDateTime: data.effectiveDateTime,
  };
};

const convertToCondition = (data: any, resource: FHIRResource): FHIRResource => {
  return {
    ...resource,
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: data.status,
        },
      ],
    },
    code: {
      coding: [
        {
          system: data.codeSystem,
          code: data.code,
          display: data.display,
        },
      ],
    },
    onsetDateTime: data.onsetDateTime,
  };
};

const convertToProcedure = (data: any, resource: FHIRResource): FHIRResource => {
  return {
    ...resource,
    status: data.status,
    code: {
      coding: [
        {
          system: data.codeSystem,
          code: data.code,
          display: data.display,
        },
      ],
    },
    performedDateTime: data.performedDateTime,
  };
}; 