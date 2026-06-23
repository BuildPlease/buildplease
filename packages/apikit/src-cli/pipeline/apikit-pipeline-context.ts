import { loadConfig } from '@internal/configuration';
import { Consola } from '@internal/consola';

import type { ApiKitConfig } from '@/configuration';

export type ApiKitPipelineOptions = {
  readonly dir?: string;
  readonly config?: string;
};

const PIPELINE_LABEL_WIDTH = 10;

export class ApiKitPipelineContext {
  private config?: ApiKitConfig;

  public constructor(public readonly options: ApiKitPipelineOptions) {}

  // MARK: - Public

  public async getConfig(): Promise<ApiKitConfig> {
    this.config ??= await loadConfig(this.options.dir, this.options.config);
    return this.config;
  }

  public success(label: string, message: string): void {
    Consola.success(this.formatMessage(label, message));
  }

  public info(label: string, message: string): void {
    Consola.info(this.formatMessage(label, message));
  }

  // MARK: - Private

  private formatMessage(label: string, message: string): string {
    return `${label.padEnd(PIPELINE_LABEL_WIDTH)}${message}`;
  }
}
