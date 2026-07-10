import { appConfigTask, loadConfigForTask } from '@internal/configuration';

import type { ApiKitConfig } from './app-config';

export async function loadAppConfig(dir?: string, configName?: string): Promise<ApiKitConfig> {
  return (await loadConfigForTask(appConfigTask, { dir: dir, config: configName })).config;
}
