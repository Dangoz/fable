import type { Action, IAgentRuntime } from '@elizaos/core';
import { elizaLogger } from '@elizaos/core';
import type { Template, TemplateName } from './utils/types';
import adventureTimeTemplate from './templates/adventureTime';
import evolvingArtTemplate from './templates/evolvingArt';
import infoAgentTemplate from './templates/infoAgent';
import adventureTimeVideo from './templates/adventureTimeVideo';

/**
 * CREATE_SMART_MEDIA action
 * Creates a new smart media post based on a template
 */
const createSmartMediaAction: Action = {
  name: 'CREATE_SMART_MEDIA',
  similes: ['CREATE_BONSAI_POST', 'MAKE_SMART_MEDIA'],
  description: 'Creates a new smart media post using one of the available templates',

  validate: async (runtime: IAgentRuntime, message: any) => {
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

      // TODO: Implement smart media creation logic
      // This would extract template name and data from the message
      // and call the appropriate template handler

      return true;
    } catch (error) {
      elizaLogger.error('Error handling CREATE_SMART_MEDIA action:', error);
      return false;
    }
  },

  examples: [
    {
      input: 'Create a smart media post with the adventure time template',
      output: {
        text: "I'll create a new Adventure Time smart media post for you.",
      },
    },
    {
      input: 'Make a new evolving art post',
      output: {
        text: 'Creating a new evolving art smart media post.',
      },
    },
    {
      input: 'Create a bonsai post with the info agent template',
      output: {
        text: "I'll set up a new info agent smart media post for you on Lens.",
      },
    },
  ],
};

/**
 * UPDATE_SMART_MEDIA action
 * Updates an existing smart media post
 */
const updateSmartMediaAction: Action = {
  name: 'UPDATE_SMART_MEDIA',
  similes: ['UPDATE_BONSAI_POST', 'REFRESH_SMART_MEDIA'],
  description: 'Updates an existing smart media post',

  validate: async (runtime: IAgentRuntime, message: any) => {
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

      // TODO: Implement smart media update logic
      // This would extract the post ID from the message
      // and update the post using the appropriate template handler

      return true;
    } catch (error) {
      elizaLogger.error('Error handling UPDATE_SMART_MEDIA action:', error);
      return false;
    }
  },

  examples: [
    {
      input: 'Update my smart media post',
      output: {
        text: "I'll update your smart media post with the latest content.",
      },
    },
    {
      input: 'Refresh my bonsai post',
      output: {
        text: 'Refreshing your Bonsai post now.',
      },
    },
    {
      input: 'Update the smart media with new content',
      output: {
        text: "I'll update your smart media post with new content.",
      },
    },
  ],
};

/**
 * Initialize templates and create Bonsai plugin actions
 */
export const createBonsaiActions = async (runtime: IAgentRuntime): Promise<Action[]> => {
  try {
    const templates = new Map<TemplateName, Template>();

    // Register templates
    templates.set(adventureTimeTemplate.clientMetadata.name, adventureTimeTemplate);
    templates.set(evolvingArtTemplate.clientMetadata.name, evolvingArtTemplate);
    templates.set(infoAgentTemplate.clientMetadata.name, infoAgentTemplate);
    templates.set(adventureTimeVideo.clientMetadata.name, adventureTimeVideo);

    // Store templates in runtime state for access in actions
    await runtime.setState('bonsai:templates', templates);

    elizaLogger.log('Registered Bonsai templates:', Array.from(templates.keys()));

    return [createSmartMediaAction, updateSmartMediaAction];
  } catch (error) {
    elizaLogger.error('Error creating Bonsai actions:', error);
    return [];
  }
};
