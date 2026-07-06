import { ConsoleOutput } from '@internal/console';

import { type ApiKitPipelineOptions, ApiKitPipelineContext } from './apikit-pipeline-context';

export interface ApiKitPipelineStep {
  readonly name: string;
  run(context: ApiKitPipelineContext): Promise<void>;
}

export class ApiKitPipeline {
  private readonly steps: ApiKitPipelineStep[] = [];

  private constructor(private readonly name: string) {}

  public static make(name: string): ApiKitPipeline {
    return new ApiKitPipeline(name);
  }

  public use(step: ApiKitPipelineStep): this {
    this.steps.push(step);
    return this;
  }

  public async run(options: ApiKitPipelineOptions): Promise<void> {
    const startedAt = Date.now();
    const context = new ApiKitPipelineContext(options);
    const generatorConfig = await context.getGeneratorConfig();

    ConsoleOutput.title('ApiKit', this.name, [
      { label: 'config', value: await context.getConfigFilePath() },
      { label: 'output', value: generatorConfig.build.outDir },
    ]);

    for (const step of this.steps) {
      await step.run(context);
    }

    ConsoleOutput.success(ConsoleOutput.step('done', `Completed in ${ConsoleOutput.duration(Date.now() - startedAt)}`));
    ConsoleOutput.emptyLine();
  }
}
