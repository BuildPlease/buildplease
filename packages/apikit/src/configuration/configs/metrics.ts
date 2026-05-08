import { ApiKitDefaults } from '@internal/configuration/apikit-defaults';
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

export const MetricsConfiguration = defineConfiguration({
  enabled: field.boolean().default(ApiKitDefaults.metrics.enabled),
  endpoint: field.custom<MetricsEndpoint>().default(ApiKitDefaults.metrics.endpoint),
  name: field.string().default(ApiKitDefaults.metrics.name),
  defaultMetrics: field.custom<MetricsDefaultConfig>().default(ApiKitDefaults.metrics.defaultMetrics),
  routeMetrics: field.custom<MetricsRouteConfig>().default(ApiKitDefaults.metrics.routeMetrics),
  clearRegisterOnInit: field.boolean().default(ApiKitDefaults.metrics.clearRegisterOnInit),
});

export type MetricsConfig = InferConfiguration<typeof MetricsConfiguration>;
