import { validateEnvironmentName } from './validate-environment-name';

export const BUILDPLEASE_ENVIRONMENT_VARIABLE = 'BUILDPLEASE_ENVIRONMENT';

export function readSelectedEnvironmentName(): string {
  const environment = process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE];

  if (environment === undefined) throw new Error('Environment is not selected.');

  return validateEnvironmentName(environment);
}
