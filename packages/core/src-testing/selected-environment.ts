import { BUILDPLEASE_ENVIRONMENT_VARIABLE } from '@internal/node/environment-configuration/selection';
import { validateEnvironmentName } from '@internal/node/environment-configuration/validate-environment-name';

export function withSelectedEnvironment<T>(environment: string, run: () => Promise<T>): Promise<T>;
export function withSelectedEnvironment<T>(environment: string, run: () => T): T;
export function withSelectedEnvironment<T>(environment: string, run: () => T | Promise<T>): T | Promise<T> {
  validateEnvironmentName(environment);
  const previous = process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE];
  process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = environment;

  const restore = (): void => {
    if (previous === undefined) delete process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE];
    else process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = previous;
  };

  try {
    const result = run();

    if (result instanceof Promise) return result.finally(restore);

    restore();
    return result;
  } catch (error) {
    restore();
    throw error;
  }
}
