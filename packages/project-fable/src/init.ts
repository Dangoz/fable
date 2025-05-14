import { IAgentRuntime, logger } from '@elizaos/core';
import type { OnboardingConfig, Action, Provider, Evaluator, Character } from '@elizaos/core';

export const initCharacter = async ({
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

  // Set the character for the runtime
  runtime.character = character;

  // Register configuration if provided
  if (config) {
    logger.info(`Adding configuration for ${character.name}`);
  }

  // Register actions if provided
  if (actions && actions.length > 0) {
    for (const action of actions) {
      logger.info(`Registering action: ${action.name}`);
      runtime.registerAction(action);
    }
  }

  // Register providers if provided
  if (providers && providers.length > 0) {
    for (const provider of providers) {
      logger.info(`Registering provider: ${provider.name}`);
      runtime.registerProvider(provider);
    }
  }

  // Register evaluators if provided
  if (evaluators && evaluators.length > 0) {
    for (const evaluator of evaluators) {
      logger.info(`Registering evaluator: ${evaluator.name}`);
      runtime.registerEvaluator(evaluator);
    }
  }
};
