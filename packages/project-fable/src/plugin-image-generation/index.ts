import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type Plugin,
  type State,
  ModelType,
  elizaLogger,
} from '@elizaos/core';
import { validateImageGenConfig } from './environment';
import { generateImageExamples } from './examples';
import { ImageGenerationService } from './service';
import { saveImageFromUrl } from './utils';
import { IMAGE_SYSTEM_PROMPT, generateImagePromptInput } from './prompts';

/**
 * Image generation action implementation
 */
const imageGeneration: Action = {
  name: 'GENERATE_IMAGE',
  similes: [
    'IMAGE_GENERATION',
    'IMAGE_GEN',
    'CREATE_IMAGE',
    'MAKE_PICTURE',
    'GENERATE_IMAGE',
    'GENERATE_A',
    'DRAW',
    'DRAW_A',
    'MAKE_A',
  ],
  description: 'Generate an image using OpenAI GPT-Image-1/DALL-E.',
  suppressInitialMessage: true,
  validate: async (runtime: IAgentRuntime, _message: Memory) => {
    try {
      await validateImageGenConfig(runtime);
      return !!runtime.getSetting('OPENAI_API_KEY');
    } catch (error) {
      elizaLogger.error('Image generation validation failed:', error);
      return false;
    }
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback: HandlerCallback
  ) => {
    elizaLogger.log('Composing state for message:', message);
    state = (await runtime.composeState(message)) as State;
    const userId = runtime.agentId;
    elizaLogger.log('User ID:', userId);

    // Get the user's message content
    const content = message.content.text;

    // Generate the input prompt based on the user's message
    const imagePromptInput = generateImagePromptInput(content);

    // Get the image generation service using its static serviceType
    const imageService = runtime.getService<ImageGenerationService>(
      ImageGenerationService.serviceType
    );

    if (!imageService) {
      elizaLogger.error('Image generation service not available');
      return false;
    }

    try {
      // Generate the image prompt using the service
      const imageResult = await imageService.generateImage({
        runtime,
        context: imagePromptInput,
        modelClass: ModelType.TEXT_SMALL,
        customSystemPrompt: IMAGE_SYSTEM_PROMPT,
      });

      elizaLogger.log('Image result received:', imageResult);

      // Check if we got a URL or an error message
      if (imageResult.startsWith('http')) {
        // We got an image URL from OpenAI
        const filename = `openai_${Date.now()}`;

        // Save the image from the URL
        const filepath = await saveImageFromUrl(imageResult, filename);

        elizaLogger.log('Saved image from OpenAI:', filepath);

        // Send the response back to the user
        callback(
          {
            text: "Here's the image I created:",
            attachments: [
              {
                id: crypto.randomUUID(),
                url: filepath,
                title: 'Generated image',
                source: 'openai',
                description: 'Image generated using OpenAI',
                text: `Generated with prompt: ${imageResult}`,
                contentType: 'image/png',
              },
            ],
          },
          [
            {
              attachment: filepath,
              name: `${filename}.png`,
            },
          ]
        );
      } else {
        // Something went wrong, return the error message
        callback({
          text: `I couldn't generate that image. ${imageResult}`,
        });
      }

      return true;
    } catch (error) {
      elizaLogger.error('Error handling image generation:', error);
      callback({
        text: 'Sorry, I encountered an error while trying to generate that image.',
      });
      return false;
    }
  },
  examples: generateImageExamples,
} as Action;

/**
 * Image generation plugin definition
 */
export const imageGenerationPlugin: Plugin = {
  name: 'imageGeneration',
  description: 'Generate images using OpenAI GPT-Image-1/DALL-E',
  actions: [imageGeneration],
  evaluators: [],
  providers: [],
  services: [ImageGenerationService], // Register the service with the plugin
};

export default imageGenerationPlugin;
