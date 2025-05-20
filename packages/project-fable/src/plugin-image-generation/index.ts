import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type Plugin,
  type State,
  elizaLogger,
} from '@elizaos/core';
import { validateOpenAIConfig } from './environment';
import { generateImageExamples } from './examples';
import { createImageGenerationService } from './service';
import { generateId, saveImageFromUrl } from './utils';

/**
 * OpenAI gpt-image-1 image generation action implementation
 * See: https://platform.openai.com/docs/guides/images
 */
const imageGeneration: Action = {
  name: 'GENERATE_IMAGE',
  similes: ['CREATE_IMAGE', 'MAKE_PICTURE', 'DRAW', 'GENERATE_IMAGE'],
  description: 'Generate an image using OpenAI gpt-image-1 model.',

  validate: async (runtime: IAgentRuntime, message: Memory) => {
    try {
      await validateOpenAIConfig(runtime);
      const text = message.content.text.toLowerCase();
      return (
        text.includes('generate') ||
        text.includes('create') ||
        text.includes('draw') ||
        text.includes('make an image') ||
        text.includes('picture of')
      );
    } catch (error) {
      elizaLogger.error('OpenAI API validation failed:', error);
      return false;
    }
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown } = {},
    callback?: HandlerCallback
  ) => {
    try {
      const config = await validateOpenAIConfig(runtime);
      const imageService = createImageGenerationService(config.OPENAI_API_KEY);

      const responseContent = {
        thought:
          "This request is asking for image generation. I'll use OpenAI's gpt-image-1 model to create a visual based on the user's description.",
        text: "I'm generating that image for you now...",
        actions: ['GENERATE_IMAGE'],
      };

      if (callback) await callback(responseContent);

      const imageUrl = await imageService.generateImage(message.content.text);
      const filename = `openai_${Date.now()}`;
      const filepath = await saveImageFromUrl(imageUrl, filename);

      elizaLogger.log('Saved image from OpenAI:', filepath);

      await runtime.createMemory(
        {
          id: generateId(),
          content: {
            text: "Here's the image I generated:",
            attachments: [
              {
                id: crypto.randomUUID(),
                url: filepath,
                title: 'Generated image',
                source: 'openai',
                description: 'Image generated using OpenAI gpt-image-1',
                text: 'Image generated with OpenAI gpt-image-1',
                contentType: 'image/png',
              },
            ],
          },
          entityId: runtime.agentId,
          agentId: runtime.agentId,
          roomId: message.roomId,
        },
        'messages'
      );

      return true;
    } catch (error) {
      elizaLogger.error('Error handling image generation:', error);

      if (callback) {
        await callback({
          thought: 'The image generation failed due to an error.',
          text: `I'm sorry, I wasn't able to generate that image. ${error instanceof Error ? error.message : String(error)}`,
          actions: ['REPLY'],
        });
      }

      return false;
    }
  },

  examples: generateImageExamples,
};

/**
 * OpenAI gpt-image-1 image generation plugin
 */
export const imageGenPlugin: Plugin = {
  name: 'imageGen',
  description: 'Generate images using OpenAI gpt-image-1 model',
  actions: [imageGeneration],
};

export default imageGenPlugin;
