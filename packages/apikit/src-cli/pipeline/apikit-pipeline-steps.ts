import { ConsoleOutput } from '@internal/console';
import { generate } from '@internal/generator';

import { getBuildOutDir } from '@/configuration/core/build-config';

import type { ApiKitPipelineStep } from './apikit-pipeline';

export function loadConfigStep(): ApiKitPipelineStep {
  return {
    name: 'config',
    async run(context): Promise<void> {
      await context.getConfig();
    },
  };
}

export function environmentStep(): ApiKitPipelineStep {
  return {
    name: 'env',
    async run(context): Promise<void> {
      const config = await context.getConfig();
      const environments = Object.entries(config.environments);
      ConsoleOutput.panel(
        'environments',
        environments.map(([name, environment]) => ({
          label: name,
          value: environment.fileDir ? `${environment.fileDir}/${environment.file}` : environment.file,
        })),
        environments.length,
      );
    },
  };
}

export function generateStep(): ApiKitPipelineStep {
  return {
    name: 'build',
    async run(context): Promise<void> {
      const config = await context.getConfig();
      const outDir = getBuildOutDir(config);

      await generate(config);

      context.success('build', `Generated ${outDir}`);
    },
  };
}
