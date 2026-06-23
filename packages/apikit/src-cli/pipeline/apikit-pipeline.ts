import { Consola } from '@internal/consola';

import { type ApiKitPipelineOptions, ApiKitPipelineContext } from './apikit-pipeline-context';

export interface ApiKitPipelineStep {
  readonly name: string;
  run(context: ApiKitPipelineContext): Promise<void>;
}

export class ApiKitPipeline {
  private readonly steps: ApiKitPipelineStep[] = [];

  private constructor(private readonly name: string) {}

  public static build(name: string): ApiKitPipeline {
    return new ApiKitPipeline(name);
  }

  public use(step: ApiKitPipelineStep): this {
    this.steps.push(step);
    return this;
  }

  public async run(options: ApiKitPipelineOptions): Promise<void> {
    const startedAt = Date.now();
    const context = new ApiKitPipelineContext(options);

    Consola.info(`ApiKit ${this.name}`);
    Consola.log('');

    for (const step of this.steps) {
      await step.run(context);
    }

    Consola.log('');
    Consola.success(`Done in ${Date.now() - startedAt}ms`);
  }
}
