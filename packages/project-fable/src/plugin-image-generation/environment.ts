import type { IAgentRuntime } from '@elizaos/core';
import { z } from 'zod';

// Simple schema requiring OpenAI API key
export const imageGenSchema = z.object({
  OPENAI_API_KEY: z.string({
    required_error: 'OPENAI_API_KEY is required for image generation',
  }),
});

export type ImageGenConfig = z.infer<typeof imageGenSchema>;

/**
 * Validates that the OpenAI API key is available
 * @param runtime The agent runtime
 * @returns The validated configuration
 * @throws Error if validation fails
 */
export async function validateImageGenConfig(runtime: IAgentRuntime): Promise<ImageGenConfig> {
  try {
    return imageGenSchema.parse({
      OPENAI_API_KEY: runtime.getSetting('OPENAI_API_KEY') || process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `OpenAI Image generation requires an API key. Please set OPENAI_API_KEY in your environment or agent settings.`
      );
    }
    throw error;
  }
}
