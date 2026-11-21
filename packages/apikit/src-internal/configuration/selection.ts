import { validateEnvironmentName } from '@buildplease/core/node';

export const APIKIT_ENVIRONMENT_VARIABLE = 'APIKIT_ENVIRONMENT';

export function readSelectedEnvironmentName(): string {
  const environment = process.env[APIKIT_ENVIRONMENT_VARIABLE];

  if (environment === undefined) throw new Error('Environment is not selected.');

  return validateEnvironmentName(environment);
}
