import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import type { Project } from '@elizaos/core';
import { caelus, stelle, solar } from '@/characters';

const project: Project = {
  agents: [caelus, stelle, solar],
};

export default project;
