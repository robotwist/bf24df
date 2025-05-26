import request from 'supertest';
import { app } from '../index';
import { FHIRResource } from '../models/FHIRResource';

describe('FHIR Routes', () => {
  const samplePatient = {
    resourceType: 'Patient',
    id: 'test-patient-1',
    name: [
      {
        family: 'Smith',
        given: ['John'],
      },
    ],
    gender: 'male',
    birthDate: '1974-12-25',
  };

  describe('POST /:resourceType', () => {
    it('should create a new FHIR resource', async () => {
      const response = await request(app)
        .post('/fhir/Patient')
        .send(samplePatient);

      expect(response.status).toBe(201);
      expect(response.body.resourceType).toBe('Patient');
      expect(response.body.id).toBe('test-patient-1');
    });

    it('should reject invalid FHIR resources', async () => {
      const invalidPatient = { ...samplePatient, resourceType: 'InvalidType' };
      
      const response = await request(app)
        .post('/fhir/Patient')
        .send(invalidPatient);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid FHIR resource');
    });
  });

  describe('GET /:resourceType/:id', () => {
    beforeEach(async () => {
      await new FHIRResource({
        resourceType: 'Patient',
        id: 'test-patient-1',
        data: samplePatient,
      }).save();
    });

    it('should retrieve a FHIR resource by id', async () => {
      const response = await request(app)
        .get('/fhir/Patient/test-patient-1');

      expect(response.status).toBe(200);
      expect(response.body.resourceType).toBe('Patient');
      expect(response.body.id).toBe('test-patient-1');
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(app)
        .get('/fhir/Patient/non-existent');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /:resourceType', () => {
    beforeEach(async () => {
      await new FHIRResource({
        resourceType: 'Patient',
        id: 'test-patient-1',
        data: samplePatient,
      }).save();
    });

    it('should search FHIR resources', async () => {
      const response = await request(app)
        .get('/fhir/Patient')
        .query({ name: 'Smith' });

      expect(response.status).toBe(200);
      expect(response.body.resourceType).toBe('Bundle');
      expect(response.body.entry).toHaveLength(1);
      expect(response.body.entry[0].resource.name[0].family).toBe('Smith');
    });
  });
}); 