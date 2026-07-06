import path from 'node:path';

import { type ApiKitConfigurationLoadResult, loadApiKitConfiguration } from '@internal/configuration';
import { ConsoleOutput } from '@internal/console';
import {
  type ApiKitGeneratorConfig,
  resolveApiKitGeneratorConfig,
} from '@internal/generator/configuration/generator-config';

import type { ApiKitConfig } from '@/configuration';

export type ApiKitPipelineOptions = {
  readonly dir?: string;
  readonly config?: string;
};

export class ApiKitPipelineContext {
  private configuration?: ApiKitConfigurationLoadResult;
  private generatorConfig?: ApiKitGeneratorConfig;

  public constructor(public readonly options: ApiKitPipelineOptions) {}

  public async getConfiguration(): Promise<ApiKitConfigurationLoadResult> {
    this.configuration ??= await loadApiKitConfiguration(this.options.dir, this.options.config);
    return this.configuration;
  }

  public async getConfig(): Promise<ApiKitConfig> {
    return (await this.getConfiguration()).config;
  }

  public async getGeneratorConfig(): Promise<ApiKitGeneratorConfig> {
    this.generatorConfig ??= await resolveApiKitGeneratorConfig(await this.getConfig());
    return this.generatorConfig;
  }

  public async getConfigFilePath(): Promise<string> {
    return formatPath((await this.getConfiguration()).configFilePath);
  }

  public success(label: string, message: string): void {
    ConsoleOutput.success(ConsoleOutput.step(label, message));
  }

  public info(label: string, message: string): void {
    ConsoleOutput.info(ConsoleOutput.step(label, message));
  }
}

function formatPath(filePath: string): string {
  const relativePath = path.relative(process.cwd(), filePath);

  if (!relativePath || relativePath.startsWith('..')) return filePath;

  return relativePath;
}
