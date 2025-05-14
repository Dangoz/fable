import { Plugin } from '@elizaos/core';
import { getAPODAction } from '@/plugin-nasa/actions/getAPOD';
import { getMarsRoverAction } from '@/plugin-nasa/actions/getMarsRoverPhoto';
import { getEpicImageAction } from '@/plugin-nasa/actions/getEpicImage';

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
