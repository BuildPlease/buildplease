import type { ServerPluginOptions } from '@/server';

export function resolveRequestLoggerIgnoredPaths(options: ServerPluginOptions): readonly string[] {
  const apikit = options.apikitController;
  const loggerConfig = apikit.logger;

  if (!loggerConfig.enabled) {
    return [];
  }

  return uniqueRequestLoggerPaths([
    apikit.health.enabled ? apikit.health.url : undefined,
    apikit.metrics.enabled ? resolveMetricsEndpointPath(apikit.metrics.endpoint) : undefined,
    ...(loggerConfig.request?.ignoredPaths ?? []),
  ]);
}

export function shouldSkipRequestLog(requestUrl: string, ignoredPaths: readonly string[]): boolean {
  const requestPath = normalizeRequestLoggerPath(getRequestPath(requestUrl));

  return ignoredPaths.some((ignoredPath) => {
    const normalizedIgnoredPath = normalizeRequestLoggerPath(ignoredPath);

    return requestPath === normalizedIgnoredPath || requestPath.startsWith(`${normalizedIgnoredPath}/`);
  });
}

function resolveMetricsEndpointPath(endpoint: unknown): string | undefined {
  if (typeof endpoint === 'string') return endpoint;

  if (endpoint && typeof endpoint === 'object' && 'url' in endpoint) {
    const url = (endpoint as { readonly url?: unknown }).url;

    return typeof url === 'string' ? url : undefined;
  }

  return undefined;
}

function getRequestPath(requestUrl: string): string {
  return requestUrl.split(/[?#]/, 1)[0] || '/';
}

function normalizeRequestLoggerPath(path: string): string {
  const trimmedPath = path.trim();
  const pathWithLeadingSlash = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;

  return pathWithLeadingSlash.length > 1 ? pathWithLeadingSlash.replace(/\/+$/, '') : pathWithLeadingSlash;
}

function uniqueRequestLoggerPaths(paths: readonly (string | undefined)[]): readonly string[] {
  return [
    ...new Set(
      paths
        .filter((path): path is string => Boolean(path?.trim()))
        .map(normalizeRequestLoggerPath)
        .filter((path) => path !== '/'),
    ),
  ];
}
