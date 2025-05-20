import type { Action, Plugin, IAgentRuntime } from '@elizaos/core';
import { elizaLogger } from '@elizaos/core';
import adventureTimeTemplate from './templates/adventureTime';
import evolvingArtTemplate from './templates/evolvingArt';
import infoAgentTemplate from './templates/infoAgent';
import adventureTimeVideo from './templates/adventureTimeVideo';
import BonsaiService from './BonsaiService';

// Define actions
const createSmartMediaAction: Action = {
  name: 'CREATE_SMART_MEDIA',
  similes: ['CREATE_BONSAI_POST', 'MAKE_SMART_MEDIA'],
  description: 'Creates a new smart media post using one of the available templates',

  validate: async (_: IAgentRuntime, message: any) => {
    const text = message.content.text.toLowerCase();
    return (
      text.includes('create smart media') ||
      text.includes('create bonsai post') ||
      text.includes('make smart media')
    );
  },

  handler: async (runtime: IAgentRuntime, message: any, state: any) => {
    try {
      elizaLogger.log('Handling CREATE_SMART_MEDIA action');
      // Implementation would use the BonsaiService instance stored in the runtime context
      return true;
    } catch (error) {
      elizaLogger.error('Error handling CREATE_SMART_MEDIA action:', error);
      return false;
    }
  },

  examples: [], // Would be replaced with proper examples in a complete implementation
};

const updateSmartMediaAction: Action = {
  name: 'UPDATE_SMART_MEDIA',
  similes: ['UPDATE_BONSAI_POST', 'REFRESH_SMART_MEDIA'],
  description: 'Updates an existing smart media post',

  validate: async (_: IAgentRuntime, message: any) => {
    const text = message.content.text.toLowerCase();
    return (
      text.includes('update smart media') ||
      text.includes('update bonsai post') ||
      text.includes('refresh smart media')
    );
  },

  handler: async (runtime: IAgentRuntime, message: any, state: any) => {
    try {
      elizaLogger.log('Handling UPDATE_SMART_MEDIA action');
      // Implementation would use the BonsaiService instance stored in the runtime context
      return true;
    } catch (error) {
      elizaLogger.error('Error handling UPDATE_SMART_MEDIA action:', error);
      return false;
    }
  },

  examples: [], // Would be replaced with proper examples in a complete implementation
};

/**
 * Bonsai plugin for ElizaOS V2
 * Implements the Smart Media Protocol (SMP) for agentic content in Lens feed
 */
export const bonsaiPlugin: Plugin = {
  name: 'bonsai',
  description: 'Implements the Smart Media Protocol (SMP) for agentic content in Lens feed',
  actions: [createSmartMediaAction, updateSmartMediaAction],
  init: async (config: Record<string, string>, runtime: IAgentRuntime) => {
    try {
      elizaLogger.log('Initializing Bonsai plugin');

      // Create BonsaiService instance
      const bonsaiService = new BonsaiService(runtime);

      // Register templates
      bonsaiService.registerTemplate(adventureTimeTemplate);
      bonsaiService.registerTemplate(evolvingArtTemplate);
      bonsaiService.registerTemplate(infoAgentTemplate);
      bonsaiService.registerTemplate(adventureTimeVideo);

      // Store service in runtime context for use by actions
      (runtime as any).bonsaiService = bonsaiService;

      elizaLogger.log('Bonsai plugin initialized successfully');
    } catch (error) {
      elizaLogger.error('Failed to initialize Bonsai plugin:', error);
    }
  },
};

export default bonsaiPlugin;

export type {
  CreateTemplateRequestParams,
  LaunchpadToken,
  SmartMedia,
  SmartMediaBase,
  Template,
  TemplateUsage,
  TemplateHandler,
  TemplateHandlerResponse,
  TemplateClientMetadata,
} from './utils/types';
