import { ActionExample } from '@elizaos/core';

/**
 * Example conversations demonstrating the OpenAI gpt-image-1 image generation action
 * Based on capabilities described in: https://platform.openai.com/docs/guides/images
 */
export const generateImageExamples: ActionExample[][] = [
  [
    {
      name: '{{user1}}',
      content: { text: 'Generate an image of a futuristic city with flying cars' },
    },
    {
      name: '{{agentName}}',
      content: {
        text: "Here's the futuristic city you requested:",
        action: 'GENERATE_IMAGE',
      },
    },
  ],
  [
    {
      name: '{{user1}}',
      content: { text: 'Create a photorealistic image of a mountain landscape at sunset' },
    },
    {
      name: '{{agentName}}',
      content: {
        text: "Here's the mountain landscape at sunset:",
        action: 'GENERATE_IMAGE',
      },
    },
  ],
  [
    {
      name: '{{user1}}',
      content: { text: 'Draw a cute robot playing with a kitten' },
    },
    {
      name: '{{agentName}}',
      content: {
        text: "Here's the robot and kitten scene:",
        action: 'GENERATE_IMAGE',
      },
    },
  ],
  [
    {
      name: '{{user1}}',
      content: { text: 'Make an image of a surreal underwater cityscape' },
    },
    {
      name: '{{agentName}}',
      content: {
        text: "Here's the underwater cityscape:",
        action: 'GENERATE_IMAGE',
      },
    },
  ],
  [
    {
      name: '{{user1}}',
      content: { text: 'Generate a cyberpunk street market at night with neon lights' },
    },
    {
      name: '{{agentName}}',
      content: {
        text: "Here's the cyberpunk street scene:",
        action: 'GENERATE_IMAGE',
      },
    },
  ],
];
