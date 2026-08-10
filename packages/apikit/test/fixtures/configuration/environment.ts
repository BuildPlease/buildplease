import { type EnvironmentName, defineEnvironments, resolveEnvironment } from '@/configuration/core/environments';

export const testEnvironments = defineEnvironments({
  development: { file: '.env.development' },
  production: { file: '.env.production' },
});

export function testEnvironment(name: EnvironmentName<typeof testEnvironments> = 'development') {
  return resolveEnvironment(testEnvironments, name);
}
