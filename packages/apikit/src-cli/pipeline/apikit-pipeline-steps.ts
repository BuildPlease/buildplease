import { Consola } from '@internal/consola';
import { generate } from '@internal/generator';

import { getBuildOutDir } from '@/configuration/core/build-config';

import type { ApiKitPipelineStep } from './apikit-pipeline';

export function loadConfigStep(): ApiKitPipelineStep {
  return {
    name: 'config',
    async run(context): Promise<void> {
      await context.getConfig();
      context.success('config', 'Loaded configuration');
    },
  };
}

export function environmentStep(): ApiKitPipelineStep {
  return {
    name: 'env',
    async run(context): Promise<void> {
      const config = await context.getConfig();
      const environments = Object.entries(config.environments);
      const noun = environments.length === 1 ? 'environment' : 'environments';

      context.success('env', `Registered ${environments.length} ${noun}.`);

      for (const [name, environment] of environments) {
        const file = environment.fileDir ? `${environment.fileDir}/${environment.file}` : environment.file;
        context.info('env', `${Consola.color.blue(name)}: ${Consola.color.dim(file)}`);
      }
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
