import { FHIRService } from '@/core/services/fhir';
import { FHIRResource } from '@/core/types/fhir';

describe('FHIRService', () => {
  let fhirService: FHIRService;

  beforeEach(() => {
    fhirService = new FHIRService();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getResource', () => {
    it('should fetch a FHIR resource by ID', async () => {
      const mockResource: FHIRResource = {
        resourceType: 'Patient',
        id: '123',
        meta: {
          versionId: '1',
          lastUpdated: new Date().toISOString(),
        },
        data: {
          name: [{ family: 'Doe', given: ['John'] }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResource,
      });

      const result = await fhirService.getResource('Patient', '123');
      expect(result).toEqual(mockResource);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/Patient/123'),
        expect.any(Object)
      );
    });

    it('should throw an error when resource is not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(fhirService.getResource('Patient', '123')).rejects.toThrow(
        'Resource not found'
      );
    });
  });

  describe('createResource', () => {
    it('should create a new FHIR resource', async () => {
      const mockResource: Partial<FHIRResource> = {
        resourceType: 'Patient',
        data: {
          name: [{ family: 'Doe', given: ['John'] }],
        },
      };

      const mockResponse = {
        ...mockResource,
        id: '123',
        meta: {
          versionId: '1',
          lastUpdated: new Date().toISOString(),
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fhirService.createResource('Patient', mockResource);
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/Patient'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockResource),
        })
      );
    });
  });

  describe('updateResource', () => {
    it('should update an existing FHIR resource', async () => {
      const mockResource: Partial<FHIRResource> = {
        resourceType: 'Patient',
        id: '123',
        data: {
          name: [{ family: 'Doe', given: ['John', 'Updated'] }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResource,
      });

      const result = await fhirService.updateResource('Patient', '123', mockResource);
      expect(result).toEqual(mockResource);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/Patient/123'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(mockResource),
        })
      );
    });
  });

  describe('deleteResource', () => {
    it('should delete a FHIR resource', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await fhirService.deleteResource('Patient', '123');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/Patient/123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('searchResources', () => {
    it('should search FHIR resources with parameters', async () => {
      const mockResponse = {
        resourceType: 'Bundle',
        type: 'searchset',
        total: 1,
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: '123',
              name: [{ family: 'Doe', given: ['John'] }],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fhirService.searchResources('Patient', {
        name: 'Doe',
        birthdate: '1990-01-01',
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/Patient?name=Doe&birthdate=1990-01-01'),
        expect.any(Object)
      );
    });
  });
}); 