import { ApiKitDefaults } from '@internal/configuration/apikit-defaults';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export const HealthConfiguration = defineConfiguration('apikit.health', {
  enabled: field.boolean().default(ApiKitDefaults.health.enabled),
  url: field.string().default(ApiKitDefaults.health.url),
  pressure: {
    maxEventLoopDelay: field.number().default(ApiKitDefaults.health.pressure.maxEventLoopDelay),
    maxHeapUsedBytes: field.number().default(ApiKitDefaults.health.pressure.maxHeapUsedBytes),
    maxRssBytes: field.number().default(ApiKitDefaults.health.pressure.maxRssBytes),
    maxEventLoopUtilization: field.number().default(ApiKitDefaults.health.pressure.maxEventLoopUtilization),
  },
});

export type HealthConfig = InferConfiguration<typeof HealthConfiguration>;
