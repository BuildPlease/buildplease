import { ApiKitDefaults } from '@internal/configuration/apikit-defaults';

import type { ApiKitConfig } from '@/configuration';

import { isConfigurationSource } from './source';

// MARK: - Internal

export function getBuildOutDir(config: ApiKitConfig): string {
  const build = config.build;

  if (!build || typeof build !== 'object' || Array.isArray(build) || isConfigurationSource(build)) {
    return ApiKitDefaults.build.outDir;
  }

  const outDir = (build as { readonly outDir?: unknown }).outDir;

  if (typeof outDir === 'string' && outDir.trim()) return outDir.trim();

  return ApiKitDefaults.build.outDir;
}
