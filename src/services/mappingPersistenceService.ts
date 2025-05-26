import { Mapping } from '../types';

export class MappingPersistenceService {
  private static readonly STORAGE_KEY = 'form-mappings';
  private static readonly VERSION = '1.0';

  /**
   * Saves mappings to local storage
   */
  static saveMappings(mappings: Mapping[]): void {
    try {
      const data = {
        version: this.VERSION,
        timestamp: new Date().toISOString(),
        mappings
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save mappings:', error);
      throw new Error('Failed to save mappings to local storage');
    }
  }

  /**
   * Loads mappings from local storage
   */
  static loadMappings(): Mapping[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);
      
      // Version check
      if (parsed.version !== this.VERSION) {
        console.warn(`Mappings version mismatch. Expected ${this.VERSION}, got ${parsed.version}`);
        // Could implement migration logic here
      }

      return parsed.mappings;
    } catch (error) {
      console.error('Failed to load mappings:', error);
      throw new Error('Failed to load mappings from local storage');
    }
  }

  /**
   * Clears all saved mappings
   */
  static clearMappings(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear mappings:', error);
      throw new Error('Failed to clear mappings from local storage');
    }
  }

  /**
   * Exports mappings to a file
   */
  static exportMappings(mappings: Mapping[]): void {
    try {
      const data = {
        version: this.VERSION,
        timestamp: new Date().toISOString(),
        mappings
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `form-mappings-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export mappings:', error);
      throw new Error('Failed to export mappings');
    }
  }

  /**
   * Imports mappings from a file
   */
  static async importMappings(file: File): Promise<Mapping[]> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Version check
      if (data.version !== this.VERSION) {
        console.warn(`Imported mappings version mismatch. Expected ${this.VERSION}, got ${data.version}`);
        // Could implement migration logic here
      }

      return data.mappings;
    } catch (error) {
      console.error('Failed to import mappings:', error);
      throw new Error('Failed to import mappings from file');
    }
  }

  /**
   * Validates imported mappings
   */
  static validateImportedMappings(mappings: any[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(mappings)) {
      errors.push('Imported data is not an array');
      return { isValid: false, errors };
    }

    mappings.forEach((mapping, index) => {
      if (!mapping.sourceField || !mapping.targetField) {
        errors.push(`Mapping at index ${index} is missing required fields`);
      }

      if (mapping.transformation) {
        if (!mapping.transformation.type) {
          errors.push(`Mapping at index ${index} has invalid transformation type`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Gets the last saved timestamp
   */
  static getLastSavedTimestamp(): string | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data);
      return parsed.timestamp || null;
    } catch {
      return null;
    }
  }
} 