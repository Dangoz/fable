import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type Plugin,
  type State,
  elizaLogger,
  UUID,
} from '@elizaos/core';
import fs from 'node:fs';
import path from 'node:path';
import { isOpenAIConfigured } from './environment';
import { generateImageExamples } from './examples';
import { ImageGenerationService } from './service';

/**
 * Saves an image from a URL to disk
 * @param imageUrl The URL of the image
 * @param filename The filename to use (without extension)
 * @returns The path to the saved file
 */
async function saveImageFromUrl(imageUrl: string, filename: string): Promise<string> {
  const imageDir = path.join(process.cwd(), 'generatedImages');
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  // Fetch image from URL
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  // Create full file path
  const filepath = path.join(imageDir, `${filename}.png`);

  // Save the file
  fs.writeFileSync(filepath, imageBuffer);

  return filepath;
}

/**
 * Generates a unique ID for memory objects
 * @returns A unique UUID
 */
function generateId(): UUID {
  return crypto.randomUUID() as UUID;
}

/**
 * OpenAI gpt-image-1 image generation action implementation
 * See: https://platform.openai.com/docs/guides/images
 */
const imageGeneration: Action = {
  name: 'GENERATE_IMAGE',
  similes: ['CREATE_IMAGE', 'MAKE_PICTURE', 'DRAW', 'GENERATE_IMAGE'],
  description: 'Generate an image using OpenAI gpt-image-1 model.',

  validate: async (runtime: IAgentRuntime, message: Memory) => {
    // Check if OpenAI API key is configured
    const apiKey = runtime.getSetting('OPENAI_API_KEY') || process.env.OPENAI_API_KEY;
    if (!isOpenAIConfigured(apiKey)) {
      return false;
    }

    // Check if the message text suggests image generation
    const text = message.content.text.toLowerCase();
    return (
      text.includes('generate') ||
      text.includes('create') ||
      text.includes('draw') ||
      text.includes('make an image') ||
      text.includes('picture of')
    );
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown } = {},
    callback?: HandlerCallback
  ) => {
    try {
      // Register and get the image generation service
      await runtime.registerService(ImageGenerationService);
      const imageService = runtime.getService<ImageGenerationService>(
        ImageGenerationService.serviceType
      );

      if (!imageService) {
        elizaLogger.error('Image generation service not available');
        return false;
      }

      // Generate the initial response with thought component
      const responseContent = {
        thought:
          "This request is asking for image generation. I'll use OpenAI's gpt-image-1 model to create a visual based on the user's description.",
        text: "I'm generating that image for you now...",
        actions: ['GENERATE_IMAGE'],
      };

      // Send initial response if callback provided
      if (callback) {
        await callback(responseContent);
      }

      try {
        // Generate the image using OpenAI's gpt-image-1
        const imageUrl = await imageService.generateImage(message.content.text);

        // Generate a unique filename
        const filename = `openai_${Date.now()}`;

        // Save the image from the URL
        const filepath = await saveImageFromUrl(imageUrl, filename);
        elizaLogger.log('Saved image from OpenAI:', filepath);

        // Create follow-up message with the generated image
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
        // Image generation failed, send error response
        if (callback) {
          await callback({
            thought: 'The image generation failed due to an error with OpenAI.',
            text: `I'm sorry, I wasn't able to generate that image. ${error instanceof Error ? error.message : String(error)}`,
            actions: ['REPLY'],
          });
        }
        return false;
      }
    } catch (error) {
      elizaLogger.error('Error handling image generation:', error);

      // Send error response if callback provided
      if (callback) {
        await callback({
          thought: 'The image generation failed due to a technical error.',
          text: "I'm sorry, I wasn't able to generate that image. There was a technical problem.",
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
  services: [ImageGenerationService],
};

export default imageGenPlugin;
