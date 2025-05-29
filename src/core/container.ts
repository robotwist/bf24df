import { Logger } from './utils/logger';
import { Config } from './config';

type ServiceType = 'config' | 'logger';

interface Service {
  initialize?(): Promise<void>;
  destroy?(): Promise<void>;
}

class Container {
  private static instance: Container;
  private services: Map<ServiceType, Service> = new Map();

  private constructor() {
    this.initializeServices();
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private async initializeServices(): Promise<void> {
    // Core services
    const config = new Config();
    const logger = new Logger(config);
    
    // Register core services
    this.services.set('config', config);
    this.services.set('logger', logger);

    // Initialize services that need it
    for (const service of this.services.values()) {
      if (service.initialize) {
        await service.initialize();
      }
    }
  }

  public get<T extends Service>(serviceName: ServiceType): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found in container`);
    }
    return service as T;
  }

  public async destroy(): Promise<void> {
    for (const service of this.services.values()) {
      if (service.destroy) {
        await service.destroy();
      }
    }
    this.services.clear();
  }
}

export const container = Container.getInstance(); 