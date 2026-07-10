import { ApiKitAppDefaults } from '@internal/configuration/app';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export const HealthConfiguration = defineConfiguration('apikit.health', {
  enabled: field.boolean().default(ApiKitAppDefaults.health.enabled),
  url: field.string().default(ApiKitAppDefaults.health.url).map(validateHealthUrl),
  pressure: {
    maxEventLoopDelay: field.number().default(ApiKitAppDefaults.health.pressure.maxEventLoopDelay),
    maxHeapUsedBytes: field.number().default(ApiKitAppDefaults.health.pressure.maxHeapUsedBytes),
    maxRssBytes: field.number().default(ApiKitAppDefaults.health.pressure.maxRssBytes),
    maxEventLoopUtilization: field.number().default(ApiKitAppDefaults.health.pressure.maxEventLoopUtilization),
  },
});

export type HealthConfig = InferConfiguration<typeof HealthConfiguration>;

function validateHealthUrl(url: string): string {
  if (!url.startsWith('/')) {
    throw new Error('apikit.health.url must start with slash.');
  }

  if (url === '/') {
    throw new Error('apikit.health.url must not be root path.');
  }

  if (url.includes('?') || url.includes('#')) {
    throw new Error('apikit.health.url must not contain query string or fragment.');
  }

  return url.length > 1 ? url.replace(/\/+$/, '') : url;
}
