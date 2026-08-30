import { Console, loadEnvironmentConfig } from '@buildplease/core/node';
import { generateApp } from '@src-internal/generator';
import { resolveAppGeneratorConfig } from '@src-internal/generator/configuration/app-generator-config';
import { defineCommand } from 'citty';

import type { ApiKitConfig } from '@/configuration';

import type { CliRuntime } from '../../runtime';
import { type CommandOptions, commandArgs, fail, runInDirectory } from '../shared';

const cli = new Console();

export function createBuildAppCommand(runtime: CliRuntime) {
  return defineCommand({
    meta: {
      name: 'build:app',
      description: [
        'Generate ApiKit app output',
        '',
        'Usage:',
        '  apikit build:app [--dir <directory>]',
        '',
        'Examples:',
        '  apikit build:app',
        '  apikit build:app --dir ./apps/main-api',
      ].join('\n'),
    },
    args: commandArgs,
    run: async ({ args }) => runApp(args as CommandOptions, runtime),
  });
}

async function runApp(args: CommandOptions, runtime: CliRuntime): Promise<void> {
  try {
    const loaded = await loadEnvironmentConfig<ApiKitConfig>({ dir: args.dir });
    const generatorConfig = await resolveAppGeneratorConfig(loaded.config);

    cli.title('ApiKit', 'app', [{ label: 'output', value: generatorConfig.build.outDir }]);

    await runInDirectory(loaded.rootDir, () =>
      generateApp({
        config: loaded.config,
        generatorConfig: generatorConfig,
      }),
    );

    cli.success(cli.step('app', `Generated ${generatorConfig.build.outDir}`));
    cli.success(cli.step('done', `Completed in ${cli.duration(Date.now() - runtime.startTime)}`));
    cli.emptyLine();
  } catch (error) {
    fail('ApiKit app build failed', error);
  }
}
