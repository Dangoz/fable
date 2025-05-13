import {
  Plugin,
  elizaLogger,
  Action,
  ActionExample,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from '@elizaos/core';
import { z } from 'zod';

// --- Types (from types.ts) ---
export interface APODResponse {
  copyright: string;
  date: string;
  explanation: string;
  hdurl: string;
  media_type: string;
  service_version: string;
  title: string;
  url: string;
}

export interface MarsRoverDataResponse {
  photo: string;
  sol: number;
  camera: string;
  rover: string;
}

export interface EpicImageResponse {
  /** Identifier for the image */
  identifier: string;
  /** Caption for the image */
  caption: string;
  /** URL to the image */
  image: string;
  /** Version of the image */
  version: string;
  /** URL to access the image */
  centroid_coordinates: {
    /** Latitude of the centroid coordinates */
    lat: number;
    /** Longitude of the centroid coordinates */
    lon: number;
  };
  /** Position of the DSCOVR satellite in J2000 reference frame */
  dscovr_j2000_position: {
    /** X coordinate */
    x: number;
    /** Y coordinate */
    y: number;
    /** Z coordinate */
    z: number;
  };
  /** Position of the moon in J2000 reference frame */
  lunar_j2000_position: {
    /** X coordinate */
    x: number;
    /** Y coordinate */
    y: number;
    /** Z coordinate */
    z: number;
  };
  /** Position of the sun in J2000 reference frame */
  sun_j2000_position: {
    /** X coordinate */
    x: number;
    /** Y coordinate */
    y: number;
    /** Z coordinate */
    z: number;
  };
  /** Attitude quaternions of the satellite */
  attitude_quaternions: {
    /** Q0 component */
    q0: number;
    /** Q1 component */
    q1: number;
    /** Q2 component */
    q2: number;
    /** Q3 component */
    q3: number;
  };
  /** Date and time when the image was taken (format: YYYY-MM-DD HH:MM:SS) */
  date: string;
  /** Consolidated coordinates data */
  coords: {
    /** Centroid coordinates */
    centroid_coordinates: {
      /** Latitude */
      lat: number;
      /** Longitude */
      lon: number;
    };
    /** DSCOVR satellite position */
    dscovr_j2000_position: {
      /** X coordinate */
      x: number;
      /** Y coordinate */
      y: number;
      /** Z coordinate */
      z: number;
    };
    /** Moon position */
    lunar_j2000_position: {
      /** X coordinate */
      x: number;
      /** Y coordinate */
      y: number;
      /** Z coordinate */
      z: number;
    };
    /** Sun position */
    sun_j2000_position: {
      /** X coordinate */
      x: number;
      /** Y coordinate */
      y: number;
      /** Z coordinate */
      z: number;
    };
    /** Attitude quaternions */
    attitude_quaternions: {
      /** Q0 component */
      q0: number;
      /** Q1 component */
      q1: number;
      /** Q2 component */
      q2: number;
      /** Q3 component */
      q3: number;
    };
  };
}

// --- Environment (from environment.ts) ---
export const nasaEnvSchema = z.object({
  NASA_API_KEY: z.string().min(1, 'Nasa API key is required'),
});

export type nasaConfig = z.infer<typeof nasaEnvSchema>;

export async function validateNasaConfig(runtime: IAgentRuntime): Promise<nasaConfig> {
  try {
    const config = {
      NASA_API_KEY: runtime.getSetting('NASA_API_KEY'),
    };
    return nasaEnvSchema.parse(config);
  } catch (error) {
    console.log('error validating NASA config:', error);
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      throw new Error(`Nasa API configuration validation failed:\n${errorMessages}`);
    }
    throw error;
  }
}

// --- Utils (from util.ts) ---
export const getEpicImageUrl = (image: EpicImageResponse) => {
  const date = image.date.split(' ')[0].split('-').join('/');
  return `https://api.nasa.gov/EPIC/archive/natural/${date}/png/${image.image}.png?api_key=DEMO_KEY`; // Using DEMO_KEY for image URL construction as per original util.ts
};

// --- Services (from services.ts) ---
const BASE_URL_APOD = 'https://api.nasa.gov/planetary/apod?api_key=';

const fetchMarsPhotos = async (
  apiKey: string,
  attempts = 0,
  maxAttempts = 10
): Promise<MarsRoverDataResponse | undefined> => {
  try {
    const curiosityCameras = ['FHAZ', 'RHAZ', 'MAST', 'CHEMCAM', 'MAHLI', 'MARDI', 'NAVCAM'];
    // const opportunityCameras = [
    //     'FHAZ',
    //     'RHAZ',
    //     'PANCAM',
    //     'MINITES'
    // ];

    const CURIOUSITY_MAX_SOL = 3400;
    // const OPPORTUNITY_MAX_SOL = 4500;

    const rovers = {
      curiosity: {
        cameras: curiosityCameras,
        maxSol: CURIOUSITY_MAX_SOL,
      },
      // opportunity: {
      //     cameras: opportunityCameras,
      //     maxSol: OPPORTUNITY_MAX_SOL
      // },
    };

    const roverNames = Object.keys(rovers);
    const randomRover = roverNames[Math.floor(Math.random() * roverNames.length)];
    const selectedRover = rovers[randomRover as keyof typeof rovers];

    const randomCamera =
      selectedRover.cameras[Math.floor(Math.random() * selectedRover.cameras.length)];
    const randomSol = Math.floor(Math.random() * selectedRover.maxSol) + 1;

    const requestURL = `https://api.nasa.gov/mars-photos/api/v1/rovers/${randomRover}/photos?sol=${randomSol}&camera=${randomCamera}&api_key=${apiKey}`;
    console.log('Fetching Mars photo from URL: ', requestURL);
    const response = await fetch(requestURL);
    const data = await response.json();

    if (data.photos.length) {
      const returnObj: MarsRoverDataResponse = {
        photo: data.photos[0].img_src,
        sol: randomSol,
        camera: randomCamera,
        rover: randomRover,
      };
      return returnObj;
    } else if (attempts < maxAttempts) {
      return fetchMarsPhotos(apiKey, attempts + 1, maxAttempts);
    } else {
      throw new Error('No photos found after maximum attempts');
    }
  } catch (err) {
    console.error('Error fetching Mars rover photos:', err);
    throw err; // Re-throw after logging
  }
};

export const createNASAService = (apiKey: string) => {
  const getAPOD = async (): Promise<APODResponse> => {
    if (!apiKey) {
      throw new Error('Invalid parameters: NASA API Key is missing');
    }
    try {
      const url = BASE_URL_APOD + apiKey;
      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`NASA APOD API Error: ${error?.msg || response.statusText}`);
      }
      const data: APODResponse = await response.json();
      return data;
    } catch (error: any) {
      console.error('NASA APOD Service Error:', error.message);
      throw error;
    }
  };

  const getMarsRoverPhoto = async (): Promise<MarsRoverDataResponse> => {
    try {
      const data = await fetchMarsPhotos(apiKey);
      if (!data) {
        throw new Error('Failed to fetch Mars Rover photo after multiple attempts.');
      }
      return data;
    } catch (error: any) {
      console.error('NASA Mars Rover Service Error:', error.message);
      throw error;
    }
  };

  const getEpicImage = async (): Promise<EpicImageResponse> => {
    try {
      const requestURL = `https://api.nasa.gov/EPIC/api/natural/images?api_key=${apiKey}`;
      const response = await fetch(requestURL);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`NASA EPIC API Error: ${error?.msg || response.statusText}`);
      }
      const data = (await response.json()) as EpicImageResponse[];
      if (!data || data.length === 0) {
        throw new Error('No EPIC image data returned from API.');
      }
      return data[0];
    } catch (error: any) {
      console.error('NASA EPIC Service Error:', error.message);
      throw error;
    }
  };
  return { getAPOD, getMarsRoverPhoto, getEpicImage };
};

// --- Examples (from examples.ts) ---
const getMarsRoverExamples: ActionExample[][] = [
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

const getAPODExamples: ActionExample[][] = [
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

const getEpicImageExamples: ActionExample[][] = [
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

// --- Actions (from actions/*.ts) ---

// getAPODAction (from actions/getAPOD.ts)
const getAPODAction: Action = {
  name: 'NASA_GET_APOD',
  similes: ['ASTRONOMY', 'SPACE', 'NASA', 'PLANETS'],
  description: 'Get the Nasa Astronomy Picture of the Day.',
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
      const APODData = await nasaService.getAPOD();
      elizaLogger.success(`Successfully fetched APOD`);
      if (callback) {
        callback({
          text: `Here is the NASA Astronomy Picture of the Day: ${APODData.url}`,
        });
        return true;
      }
    } catch (error: any) {
      elizaLogger.error('Error in NASA APOD handler:', error);
      callback({
        text: `Error fetching APOD: ${error.message}`,
        content: { error: error.message }, // Include error details in content
      });
      return false;
    }
  },
  examples: getAPODExamples as ActionExample[][],
};

// getMarsRoverAction (from actions/getMarsRoverPhoto.ts)
const getMarsRoverAction: Action = {
  name: 'NASA_GET_MARS_ROVER_PHOTO',
  similes: ['MARS', 'MARTIAN', 'MARS PHOTO'],
  description: 'Get a random Nasa Mars Rover Photo.',
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
      const MarsRoverData = await nasaService.getMarsRoverPhoto();
      elizaLogger.success(`Successfully fetched Mars Rover Photo`);
      if (callback) {
        callback({
          text: `Here is a photo from the ${MarsRoverData.rover} on day ${MarsRoverData.sol} from the ${MarsRoverData.camera} camera.\n\n${MarsRoverData.photo}`,
        });
        return true;
      }
    } catch (error: any) {
      elizaLogger.error('Error in NASA Mars Rover handler:', error);
      callback({
        text: `Error fetching Mars Rover Photo: ${error.message}`,
        content: { error: error.message }, // Include error details in content
      });
      return false;
    }
  },
  examples: getMarsRoverExamples as ActionExample[][],
};

// getEpicImageAction (from actions/getEpicImage.ts)
const getEpicImageAction: Action = {
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
      const epicImageUrl = getEpicImageUrl(epicImage); // Use utility function
      elizaLogger.success(`Successfully fetched Epic Image`);
      if (callback) {
        callback({
          text: `Here is the NASA Earth Polychromatic Imaging Camera (EPIC) image of the day: ${epicImageUrl}`,
        });
        return true;
      }
    } catch (error: any) {
      elizaLogger.error('Error in NASA EPIC handler:', error);
      callback({
        text: `Error fetching Epic Image: ${error.message}`,
        content: { error: error.message }, // Include error details in content
      });
      return false;
    }
  },
  examples: getEpicImageExamples as ActionExample[][],
};

// --- Plugin Definition (from index.ts) ---
export const nasaPlugin: Plugin = {
  name: 'nasa',
  description: 'NASA plugin for Eliza',
  actions: [getAPODAction, getMarsRoverAction, getEpicImageAction],
  // evaluators analyze the situations and actions taken by the agent. they run after each agent action
  // allowing the agent to reflect on what happened and potentially trigger additional actions or modifications
  evaluators: [],
  // providers supply information and state to the agent's context, help agent access necessary data
  providers: [],
};

export default nasaPlugin;
