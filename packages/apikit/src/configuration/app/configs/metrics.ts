import { ApiKitAppDefaults } from '@internal/configuration/app';
import type { RouteOptions } from 'fastify';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export type MetricsEndpoint = string | null | RouteOptions;

export interface MetricsDefaultConfig {
  readonly enabled: boolean;
}

export interface MetricsRouteConfig {
  readonly enabled?:
    | boolean
    | {
        readonly histogram?: boolean;
        readonly summary?: boolean;
      };

  readonly registeredRoutesOnly?: boolean;
  readonly groupStatusCodes?: boolean;
  readonly routeBlacklist?: readonly (string | RegExp)[];
  readonly methodBlacklist?: readonly string[];
  readonly invalidRouteGroup?: string;
}

export const MetricsConfiguration = defineConfiguration('apikit.metrics', {
  enabled: field.boolean().default(ApiKitAppDefaults.metrics.enabled),
  endpoint: field.custom<MetricsEndpoint>().default(ApiKitAppDefaults.metrics.endpoint),
  name: field.string().default(ApiKitAppDefaults.metrics.name),
  defaultMetrics: field.custom<MetricsDefaultConfig>().default(ApiKitAppDefaults.metrics.defaultMetrics),
  routeMetrics: field.custom<MetricsRouteConfig>().default(ApiKitAppDefaults.metrics.routeMetrics),
  clearRegisterOnInit: field.boolean().default(ApiKitAppDefaults.metrics.clearRegisterOnInit),
});

export type MetricsConfig = InferConfiguration<typeof MetricsConfiguration>;
