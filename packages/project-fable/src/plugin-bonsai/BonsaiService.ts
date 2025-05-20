import { elizaLogger, type IAgentRuntime } from '@elizaos/core';
import type {
  Template,
  TemplateName,
  SmartMedia,
  SmartMediaBase,
  TemplateUsage,
} from './utils/types';

/**
 * BonsaiService provides core functionality for managing smart media posts
 * in a plugin architecture compatible with ElizaOS V2
 */
export class BonsaiService {
  private templates: Map<TemplateName, Template> = new Map();
  private runtime: IAgentRuntime;

  constructor(runtime: IAgentRuntime) {
    this.runtime = runtime;
  }

  /**
   * Registers a template for use with the service
   */
  public registerTemplate(template: Template): void {
    this.templates.set(template.clientMetadata.name, template);
    elizaLogger.log(`Registered template: ${template.clientMetadata.name}`);
  }

  /**
   * Generates a preview using the specified template
   */
  public async generatePreview(
    templateName: TemplateName,
    templateData: unknown
  ): Promise<{ preview?: any; templateData?: unknown }> {
    try {
      const template = this.templates.get(templateName);

      if (!template) {
        throw new Error(`Template not found: ${templateName}`);
      }

      const response = await template.handler(this.runtime, undefined, templateData);

      return {
        preview: response?.preview,
        templateData: response?.updatedTemplateData || templateData,
      };
    } catch (error) {
      elizaLogger.error('Error generating preview:', error);
      throw error;
    }
  }

  /**
   * Creates a new smart media post
   */
  public async createSmartMedia(
    creator: string,
    templateName: TemplateName,
    category: string,
    templateData: unknown,
    postId?: string
  ): Promise<SmartMedia | null> {
    try {
      const template = this.templates.get(templateName);

      if (!template) {
        throw new Error(`Template not found: ${templateName}`);
      }

      // This would be expanded with actual implementation
      // that creates and stores the smart media post

      elizaLogger.log(`Created smart media with template: ${templateName}`);

      // Return a placeholder SmartMedia object
      return null;
    } catch (error) {
      elizaLogger.error('Error creating smart media:', error);
      return null;
    }
  }

  /**
   * Updates an existing smart media post
   */
  public async updateSmartMedia(postId: string, forceUpdate?: boolean): Promise<boolean> {
    try {
      // This would be expanded with actual implementation
      // that retrieves and updates the existing smart media post

      elizaLogger.log(`Updated smart media post: ${postId}`);
      return true;
    } catch (error) {
      elizaLogger.error(`Error updating smart media post ${postId}:`, error);
      return false;
    }
  }

  /**
   * Gets all registered templates
   */
  public getTemplates(): Map<TemplateName, Template> {
    return this.templates;
  }
}

export default BonsaiService;
