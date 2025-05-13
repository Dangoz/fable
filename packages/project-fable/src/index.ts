import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import { type Project } from '@elizaos/core';
import { defaultCharacter } from './characters';

const project: Project = {
  agents: [defaultCharacter],
};

export default project;
