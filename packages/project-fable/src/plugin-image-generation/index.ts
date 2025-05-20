import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type Plugin,
  type State,
  elizaLogger,
} from '@elizaos/core';
import fs from 'node:fs';
import path from 'node:path';
import { validateImageGenConfig } from './environment';
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
 * OpenAI gpt-image-1 image generation action implementation
 * See: https://platform.openai.com/docs/guides/images
 */
const imageGeneration: Action = {
  name: 'GENERATE_IMAGE',
  similes: ['CREATE_IMAGE', 'MAKE_PICTURE', 'DRAW', 'GENERATE_IMAGE'],
  description: 'Generate an image using OpenAI gpt-image-1 model.',

  validate: async (runtime: IAgentRuntime) => {
    try {
      await validateImageGenConfig(runtime);
      return true;
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
    try {
      // Get the image generation service
      const imageService = runtime.getService<ImageGenerationService>(
        ImageGenerationService.serviceType
      );

      if (!imageService) {
        elizaLogger.error('Image generation service not available');
        return false;
      }

      // Generate the image using OpenAI's gpt-image-1
      const imageResult = await imageService.generateImage({
        runtime,
        prompt: message.content.text,
      });

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
                description: 'Image generated using OpenAI gpt-image-1',
                text: 'Image generated with OpenAI gpt-image-1',
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
};

/**
 * OpenAI gpt-image-1 image generation plugin
 */
export const imageGenerationPlugin: Plugin = {
  name: 'imageGeneration',
  description: 'Generate images using OpenAI gpt-image-1 model',
  actions: [imageGeneration],
  services: [ImageGenerationService],
};

export default imageGenerationPlugin;
