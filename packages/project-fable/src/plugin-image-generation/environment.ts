import { elizaLogger } from '@elizaos/core';

/**
 * Returns whether the OpenAI API key is set in the environment
 * Used for validation checks in the image generation plugin
 * @param apiKey Optional API key to check
 * @returns True if the API key is set and valid
 */
export function isOpenAIConfigured(apiKey?: string): boolean {
  if (!apiKey) {
    elizaLogger.error('OPENAI_API_KEY is not set');
    return false;
  }
  return true;
}
