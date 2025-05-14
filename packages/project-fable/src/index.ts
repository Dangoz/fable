import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import type { Project } from '@elizaos/core';
import { defaultCharacter, marsProbe, luigi, pom } from '@/characters';

const project: Project = {
  agents: [defaultCharacter, marsProbe, luigi, pom],
};

export default project;
