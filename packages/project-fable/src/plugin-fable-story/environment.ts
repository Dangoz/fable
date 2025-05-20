import { IAgentRuntime } from '@elizaos/core';
import { z } from 'zod';

export const openaiEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
});

export type openaiConfig = z.infer<typeof openaiEnvSchema>;

export async function validateOpenAIConfig(runtime: IAgentRuntime): Promise<openaiConfig> {
  try {
    const config = {
      OPENAI_API_KEY: runtime.getSetting('OPENAI_API_KEY'),
    };
    return openaiEnvSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      throw new Error(`OpenAI API configuration validation failed:\n${errorMessages}`);
    }
    throw error;
  }
}
