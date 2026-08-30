import { readEnvironmentVariable } from '../../src-node/environment-configuration/environment-variable';

/** Process-environment transport used by the BuildPlease launcher. */
export const BUILDPLEASE_ENVIRONMENT_VARIABLE = 'BUILDPLEASE_ENVIRONMENT';

/** Read the environment selected for the current BuildPlease execution. */
export function readSelectedEnvironmentName(): string {
  const environment = readEnvironmentVariable(BUILDPLEASE_ENVIRONMENT_VARIABLE);

  if (!environment) throw new Error('BuildPlease environment is not selected.');

  return environment;
}
