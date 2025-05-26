import { container } from '../container';
import { eventBus, Events } from '../events/EventBus';
import { Logger } from '../utils/logger';

export interface Plugin {
  name: string;
  version: string;
  initialize: () => Promise<void>;
  destroy: () => Promise<void>;
}

class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, Plugin> = new Map();
  private logger: Logger;

  private constructor() {
    this.logger = container.get<Logger>('logger');
  }

  public static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  public async registerPlugin(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }

    try {
      await plugin.initialize();
      this.plugins.set(plugin.name, plugin);
      this.logger.info(`Plugin ${plugin.name} v${plugin.version} registered successfully`);
      eventBus.emit(Events.PLUGIN_REGISTERED, plugin);
    } catch (error) {
      this.logger.error(`Failed to register plugin ${plugin.name}:`, error);
      throw error;
    }
  }

  public async unregisterPlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} is not registered`);
    }

    try {
      await plugin.destroy();
      this.plugins.delete(pluginName);
      this.logger.info(`Plugin ${pluginName} unregistered successfully`);
      eventBus.emit(Events.PLUGIN_UNREGISTERED, plugin);
    } catch (error) {
      this.logger.error(`Failed to unregister plugin ${pluginName}:`, error);
      throw error;
    }
  }

  public getPlugin(pluginName: string): Plugin | undefined {
    return this.plugins.get(pluginName);
  }

  public getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  public async destroyAll(): Promise<void> {
    for (const [name, plugin] of this.plugins) {
      try {
        await this.unregisterPlugin(name);
      } catch (error) {
        this.logger.error(`Failed to destroy plugin ${name}:`, error);
      }
    }
  }
}

export const pluginManager = PluginManager.getInstance(); 