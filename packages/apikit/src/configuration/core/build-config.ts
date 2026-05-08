import { ApiKitDefaults } from '@internal/configuration/apikit-defaults';

import type { ApiKitConfig } from '@/configuration';

import { isConfigurationSource } from './source';

// MARK: - Internal

export function getBuildOutDir(config: ApiKitConfig): string {
  const runtime = config.runtime;

  if (!runtime || typeof runtime !== 'object' || Array.isArray(runtime) || isConfigurationSource(runtime)) {
    return ApiKitDefaults.runtime.outDir;
  }

  const outDir = (runtime as { readonly outDir?: unknown }).outDir;

  if (typeof outDir === 'string' && outDir.trim()) return outDir.trim();

  return ApiKitDefaults.runtime.outDir;
}
