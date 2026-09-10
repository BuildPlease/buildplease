import type { Build, Environment } from '@buildplease/core';
import {
  type ConfigDefinition,
  type InferConfig,
  CoreApplication,
  loadBuild,
  loadSelectedEnvironmentConfig,
  resolveConfig,
} from '@buildplease/core/node';
import { createWebKitRuntime } from '@internal/neutral/runtime';
import type { WebKitApplicationOptions, WebKitRuntime } from '@neutral/application';

export * from '@node/index';

/** Node WebKit application entry point. */
export class WebKitApplication {
  /**
   * Resolves the selected application's `environment.config.ts`.
   *
   * Build metadata, selected-environment preparation and dotenv initialization
   * are shared with {@link WebKitApplication.run} and initialized once per process.
   *
   * @returns Fully resolved application configuration.
   */
  public static async resolveConfiguration<Config extends ConfigDefinition<any>>(): Promise<InferConfig<Config>> {
    const application = await initializeApplication();

    return await resolveConfig(application.config as Config, {
      build: application.build,
      environment: application.environment,
    });
  }

  /**
   * Runs application startup.
   *
   * @param options - Startup options.
   * @returns Application runtime.
   */
  public static async run(options: WebKitApplicationOptions = {}): Promise<WebKitRuntime> {
    return await CoreApplication.run(async () => {
      await initializeApplication();
      return await createWebKitRuntime(options);
    });
  }
}

// MARK: - Private

interface ApplicationInitialization {
  readonly build: Build;
  readonly config: ConfigDefinition;
  readonly environment: Environment;
}

let applicationInitialization: Promise<ApplicationInitialization> | undefined;

function initializeApplication(): Promise<ApplicationInitialization> {
  applicationInitialization ??= loadApplication();
  return applicationInitialization;
}

async function loadApplication(): Promise<ApplicationInitialization> {
  const build = await loadBuild();
  const loaded = await loadSelectedEnvironmentConfig();

  return {
    build: build,
    config: loaded.config,
    environment: loaded.environment,
  };
}
