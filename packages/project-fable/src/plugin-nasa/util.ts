import type { EpicImageResponse } from './types';

// given an epic image response, construct the appropriate image url
export const getEpicImageUrl = (image: EpicImageResponse) => {
  // convert 2025-03-19 00:13:03 to 2025/03/19
  const date = image.date.split(' ')[0].split('-').join('/');

  return `https://api.nasa.gov/EPIC/archive/natural/${date}/png/${image.image}.png?api_key=DEMO_KEY`;
};
