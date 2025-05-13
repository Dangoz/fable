import {
  elizaLogger,
  Action,
  ActionExample,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from '@elizaos/core';
import { validateNasaConfig } from '../environment';
import { createNASAService } from '../services';
import { getEpicImageUrl } from '../util';
import { getEpicImageExamples } from '../examples';

export const getEpicImageAction: Action = {
  name: 'NASA_GET_EPIC_IMAGE',
  similes: ['EPIC', 'EARTH', 'POLYCHROMATIC', 'IMAGING', 'CAMERA'],
  description: 'Get the Nasa Earth Polychromatic Imaging Camera (EPIC) image of the day.',
  validate: async (runtime: IAgentRuntime) => {
    await validateNasaConfig(runtime);
    return true;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback: HandlerCallback
  ) => {
    const config = await validateNasaConfig(runtime);
    const nasaService = createNASAService(config.NASA_API_KEY);

    try {
      const epicImage = await nasaService.getEpicImage();
      const epicImageUrl = getEpicImageUrl(epicImage);
      elizaLogger.success(`Successfully fetched Epic Image`);
      if (callback) {
        callback({
          text: `Here is the NASA Earth Polychromatic Imaging Camera (EPIC) image of the day: ${epicImageUrl}`,
        });
        return true;
      }
    } catch (error: any) {
      elizaLogger.error('Error in NASA plugin handler:', error);
      callback({
        text: `Error fetching Epic Image: ${error.message}`,
      });
      return false;
    }
  },
  examples: getEpicImageExamples as ActionExample[][],
} as Action;
