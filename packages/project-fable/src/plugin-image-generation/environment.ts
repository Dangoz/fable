import type { IAgentRuntime } from '@elizaos/core';
import { z } from 'zod';

export const imageGenEnvSchema = z.object({
  OPENAI_API_KEY: z.string({
    required_error: 'OPENAI_API_KEY is required for image generation',
  }),
});

export type ImageGenConfig = z.infer<typeof imageGenEnvSchema>;

export async function validateImageGenConfig(runtime: IAgentRuntime): Promise<ImageGenConfig> {
  try {
    const config = {
      OPENAI_API_KEY: runtime.getSetting('OPENAI_API_KEY') || process.env.OPENAI_API_KEY,
    };

    return imageGenEnvSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      throw new Error(`OpenAI Image generation configuration validation failed:\n${errorMessages}`);
    }
    throw error;
  }
}
