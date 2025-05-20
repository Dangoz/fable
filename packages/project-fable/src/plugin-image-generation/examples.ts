import { ActionExample } from '@elizaos/core';

export const generateImageExamples: ActionExample[][] = [
  // TODO: We want to generate images in more abstract ways, not just when asked to generate an image

  [
    {
      name: '{{user1}}',
      content: { text: 'Generate an image of a cat' },
    },
    {
      name: '{{agentName}}',
      content: {
        text: "Here's an image of a cat",
        action: 'GENERATE_IMAGE',
      },
    },
  ],
  [
    {
      name: '{{user1}}',
      content: { text: 'Generate an image of a dog' },
    },
    {
      name: '{{agentName}}',
      content: {
        text: "Here's an image of a dog",
        action: 'GENERATE_IMAGE',
      },
    },
  ],
  [
    {
      name: '{{user1}}',
      content: { text: 'Create an image of a cat with a hat' },
    },
    {
      name: '{{agentName}}',
      content: {
        text: "Here's an image of a cat with a hat",
        action: 'GENERATE_IMAGE',
      },
    },
  ],
  [
    {
      name: '{{user1}}',
      content: { text: 'Make an image of a dog with a hat' },
    },
    {
      name: '{{agentName}}',
      content: {
        text: "Here's an image of a dog with a hat",
        action: 'GENERATE_IMAGE',
      },
    },
  ],
  [
    {
      name: '{{user1}}',
      content: { text: 'Paint an image of a cat with a hat' },
    },
    {
      name: '{{agentName}}',
      content: {
        text: "Here's an image of a cat with a hat",
        action: 'GENERATE_IMAGE',
      },
    },
  ],
];
