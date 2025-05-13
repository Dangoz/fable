import { ActionExample } from '@elizaos/core';

export const getMarsRoverExamples: ActionExample[][] = [
  [
    {
      name: '{{user1}}',
      content: {
        text: 'I wonder what mars looks like today?',
      },
    },
    {
      name: '{{agent}}',
      content: {
        text: 'Let me fetch a picture from a mars rover.',
        action: 'NASA_GET_MARS_ROVER_PHOTO',
      },
    },
  ],
  [
    {
      name: '{{user1}}',
      content: {
        text: 'Can you fetch a random picture of Mars?',
      },
    },
    {
      name: '{{agent}}',
      content: {
        text: 'Let me fetch a picture from a mars rover.',
        action: 'NASA_GET_MARS_ROVER_PHOTO',
      },
    },
  ],
];

export const getAPODExamples: ActionExample[][] = [
  [
    {
      name: '{{user1}}',
      content: {
        text: "What's the nasa Astronomy picture of the day?",
      },
    },
    {
      name: '{{agent}}',
      content: {
        text: 'Let me get the nasa image of the day.',
        action: 'NASA_GET_APOD',
      },
    },
  ],
  [
    {
      name: '{{user1}}',
      content: {
        text: 'I love space.',
      },
    },
    {
      name: '{{agent}}',
      content: {
        text: 'Oh really, then let me get the nasa image of the day to make your day even better.',
        action: 'NASA_GET_APOD',
      },
    },
  ],
  [
    {
      name: '{{user1}}',
      content: {
        text: 'I am in love with space and space travel.',
      },
    },
    {
      name: '{{agent}}',
      content: {
        text: 'Space is beautiful, dark, scary, and vast. Would you like to see a current photo of space from NASA?',
      },
    },
    {
      name: '{{user1}}',
      content: {
        text: 'yes',
      },
    },
    {
      name: '{{agent}}',
      content: {
        text: 'Here is the NASA Astronomy Picture of the Day.',
        action: 'NASA_GET_APOD',
      },
    },
  ],
  [
    {
      name: '{{user1}}',
      content: {
        text: 'Space is beautiful, dark, scary, and unfathomably vast.',
      },
    },
    {
      name: '{{agent}}',
      content: {
        text: 'Indeed! Would you like to see a current photo from the NASA astronomy database?',
      },
    },
    {
      name: '{{user1}}',
      content: {
        text: 'yes',
      },
    },
    {
      name: '{{agent}}',
      content: {
        text: 'Here is the NASA Astronomy Picture of the Day.',
        action: 'NASA_GET_APOD',
      },
    },
  ],
  [
    {
      name: '{{user1}}',
      content: {
        text: "I'm a big fan of space and astronomy.",
      },
    },
    {
      name: '{{agent}}',
      content: {
        text: 'Would you like to see the Nasa Astronomy Picture of the Day?',
      },
    },
    {
      name: '{{user1}}',
      content: {
        text: 'yes',
      },
    },
    {
      name: '{{agent}}',
      content: {
        text: 'Here is the NASA Astronomy Picture of the Day.',
        action: 'NASA_GET_APOD',
      },
    },
  ],
];

export const getEpicImageExamples: ActionExample[][] = [
  [
    {
      name: '{{user1}}',
      content: {
        text: "What's the nasa Earth Polychromatic Imaging Camera (EPIC) image of the day?",
      },
    },
    {
      name: '{{agent}}',
      content: {
        text: 'Here is the NASA Earth Polychromatic Imaging Camera (EPIC) image of the day.',
        action: 'NASA_GET_EPIC_IMAGE',
      },
    },
  ],
  [
    {
      name: '{{user1}}',
      content: {
        text: 'I love space and astronomy.',
      },
    },
    {
      name: '{{agent}}',
      content: {
        text: 'Would you like to see the Nasa Earth Polychromatic Imaging Camera (EPIC) image of the day?',
      },
    },
    {
      name: '{{user1}}',
      content: {
        text: 'yes',
      },
    },
    {
      name: '{{agent}}',
      content: {
        text: 'Here is the NASA Earth Polychromatic Imaging Camera (EPIC) image of the day.',
        action: 'NASA_GET_EPIC_IMAGE',
      },
    },
  ],
];
