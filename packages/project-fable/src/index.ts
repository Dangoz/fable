import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import type { Project } from '@elizaos/core';
import { defaultCharacter, marsProbe } from '@/characters';

const project: Project = {
  agents: [defaultCharacter, marsProbe],
};

export default project;
