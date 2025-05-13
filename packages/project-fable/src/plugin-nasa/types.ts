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
