import { IAgentRuntime, logger } from '@elizaos/core';
import type { OnboardingConfig, Action, Provider, Evaluator, Character } from '@elizaos/core';

export const initCharacter = ({
  runtime,
  config,
  actions,
  providers,
  evaluators,
  character,
}: {
  runtime: IAgentRuntime;
  config?: OnboardingConfig;
  actions?: Action[];
  providers?: Provider[];
  evaluators?: Evaluator[];
  character: Character;
}) => {
  logger.info(`Initializing === ${character.name} ===`);
};
