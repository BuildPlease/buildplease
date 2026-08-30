import { readEnvironmentVariable } from './environment-variable';

/**
 * Process-environment transport used by the BuildPlease launcher to carry the
 * selected environment through the complete child-process tree.
 *
 * The raw value is validated against each application's typed environment
 * registry when its environment configuration is loaded.
 */
export const BUILDPLEASE_ENVIRONMENT_VARIABLE = 'BUILDPLEASE_ENVIRONMENT';

/**
 * Read the environment selected for the current BuildPlease execution.
 *
 * Selection is intentionally explicit. BuildPlease does not invent a default
 * environment because the valid environment names belong to each application.
 */
export function readSelectedEnvironmentName(): string {
  const environment = readEnvironmentVariable(BUILDPLEASE_ENVIRONMENT_VARIABLE);

  if (!environment) {
    throw new Error(
      `BuildPlease environment is not selected. Run through ` +
        `"buildplease --env <environment> -- <command>" or set ${BUILDPLEASE_ENVIRONMENT_VARIABLE}.`,
    );
  }

  return environment;
}
