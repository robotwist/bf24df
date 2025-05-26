import { FHIRService } from './services/fhir';
import { WorkflowService } from './services/workflow';
import { HL7Service } from './services/hl7';
import { AuthService } from './services/auth';
import { Logger } from './utils/logger';
import { Config } from './config';

class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.initializeServices();
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private initializeServices(): void {
    // Core services
    const config = new Config();
    const logger = new Logger(config);
    
    // Register core services
    this.services.set('config', config);
    this.services.set('logger', logger);

    // Register business services
    this.services.set('fhir', new FHIRService(config, logger));
    this.services.set('workflow', new WorkflowService(config, logger));
    this.services.set('hl7', new HL7Service(config, logger));
    this.services.set('auth', new AuthService(config, logger));
  }

  public get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found in container`);
    }
    return service as T;
  }
}

export const container = Container.getInstance(); 