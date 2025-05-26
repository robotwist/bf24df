import { FieldMapping, FormMappings } from '../../types/mappings';
import { validationService } from './validationService';

const STORAGE_KEY = 'form_mappings';

export class MappingService {
  private static instance: MappingService;
  private mappings: Map<string, FormMappings>;
  private loadingStates: Map<string, boolean>;
  private errorStates: Map<string, Error | null>;

  private constructor() {
    this.mappings = new Map();
    this.loadingStates = new Map();
    this.errorStates = new Map();
    this.loadAllMappings();
  }

  public static getInstance(): MappingService {
    if (!MappingService.instance) {
      MappingService.instance = new MappingService();
    }
    return MappingService.instance;
  }

  private loadAllMappings(): void {
    try {
      const storedMappings = localStorage.getItem(STORAGE_KEY);
      if (storedMappings) {
        const parsedMappings = JSON.parse(storedMappings) as FormMappings[];
        parsedMappings.forEach(mapping => {
          this.mappings.set(mapping.formId, mapping);
        });
      }
    } catch (error) {
      console.error('Failed to load mappings:', error);
      // Initialize with empty mappings if loading fails
      this.mappings.clear();
    }
  }

  private saveAllMappings(): void {
    try {
      const mappingsArray = Array.from(this.mappings.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappingsArray));
    } catch (error) {
      console.error('Failed to save mappings:', error);
      throw new Error('Failed to save mappings to storage');
    }
  }

  public async loadMappings(formId: string): Promise<FieldMapping[]> {
    this.setLoading(formId, true);
    this.setError(formId, null);

    try {
      // Simulate network delay in development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const formMappings = this.mappings.get(formId);
      return formMappings?.mappings || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load mappings';
      this.setError(formId, new Error(errorMessage));
      throw new Error(errorMessage);
    } finally {
      this.setLoading(formId, false);
    }
  }

  public async saveMappings(formId: string, mappings: FieldMapping[]): Promise<void> {
    this.setLoading(formId, true);
    this.setError(formId, null);

    try {
      // Validate all mappings before saving
      const validationResults = mappings.map(mapping => 
        validationService.validateMapping(mapping)
      );

      const invalidMappings = validationResults.filter(result => !result.isValid);
      if (invalidMappings.length > 0) {
        const errorMessages = invalidMappings
          .map(result => result.errors)
          .flat()
          .join(', ');
        throw new Error(`Invalid mappings: ${errorMessages}`);
      }

      // Simulate network delay in development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      this.mappings.set(formId, {
        formId,
        mappings
      });

      this.saveAllMappings();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save mappings';
      this.setError(formId, new Error(errorMessage));
      throw new Error(errorMessage);
    } finally {
      this.setLoading(formId, false);
    }
  }

  public async addMapping(formId: string, mapping: FieldMapping): Promise<void> {
    const currentMappings = await this.loadMappings(formId);
    const updatedMappings = [...currentMappings, mapping];
    await this.saveMappings(formId, updatedMappings);
  }

  public async removeMapping(formId: string, mappingId: string): Promise<void> {
    const currentMappings = await this.loadMappings(formId);
    const updatedMappings = currentMappings.filter(m => m.id !== mappingId);
    await this.saveMappings(formId, updatedMappings);
  }

  public async updateMapping(formId: string, mappingId: string, updates: Partial<FieldMapping>): Promise<void> {
    const currentMappings = await this.loadMappings(formId);
    const updatedMappings = currentMappings.map(m => 
      m.id === mappingId ? { ...m, ...updates } : m
    );
    await this.saveMappings(formId, updatedMappings);
  }

  public getLoadingState(formId: string): boolean {
    return this.loadingStates.get(formId) || false;
  }

  public getErrorState(formId: string): Error | null {
    return this.errorStates.get(formId) || null;
  }

  private setLoading(formId: string, isLoading: boolean): void {
    this.loadingStates.set(formId, isLoading);
  }

  private setError(formId: string, error: Error | null): void {
    this.errorStates.set(formId, error);
  }

  public clearError(formId: string): void {
    this.errorStates.set(formId, null);
  }

  public async exportMappings(): Promise<string> {
    try {
      const mappingsArray = Array.from(this.mappings.values());
      return JSON.stringify(mappingsArray, null, 2);
    } catch (error) {
      throw new Error('Failed to export mappings');
    }
  }

  public async importMappings(jsonString: string): Promise<void> {
    try {
      const mappings = JSON.parse(jsonString) as FormMappings[];
      
      // Validate all mappings before importing
      for (const formMapping of mappings) {
        const validationResults = formMapping.mappings.map(mapping => 
          validationService.validateMapping(mapping)
        );

        const invalidMappings = validationResults.filter(result => !result.isValid);
        if (invalidMappings.length > 0) {
          const errorMessages = invalidMappings
            .map(result => result.errors)
            .flat()
            .join(', ');
          throw new Error(`Invalid mappings in form ${formMapping.formId}: ${errorMessages}`);
        }
      }

      // Clear existing mappings and import new ones
      this.mappings.clear();
      mappings.forEach(mapping => {
        this.mappings.set(mapping.formId, mapping);
      });

      this.saveAllMappings();
    } catch (error) {
      throw new Error('Failed to import mappings: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}

export const mappingService = MappingService.getInstance(); 