import { loadConfig as loadApiKitConfig } from '@internal/configuration';

import type { ApiKitConfig } from '@/configuration';

// MARK: - Internal

export async function loadConfig(dir?: string, configName?: string): Promise<ApiKitConfig> {
  return loadApiKitConfig(dir, configName);
}
