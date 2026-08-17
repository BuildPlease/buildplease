import { Console } from '@meawkit/core/node';
import { APIKIT_CONFIG_NAME, loadApiKitConfig } from '@src-internal/configuration';
import { generateApp } from '@src-internal/generator';
import { resolveAppGeneratorConfig } from '@src-internal/generator/configuration/app-generator-config';
import { defineCommand } from 'citty';

import type { CliRuntime } from '../../runtime';
import { type CommandOptions, commandArgs, fail, formatPath, runInDirectory } from '../shared';

const cli = new Console();

export function createBuildAppCommand(runtime: CliRuntime) {
  return defineCommand({
    meta: {
      name: 'build:app',
      description: [
        'Generate ApiKit app output',
        '',
        'Usage:',
        '  apikit build:app [--dir <directory>] [--config <config-name>]',
        '',
        'Config lookup:',
        `  ${APIKIT_CONFIG_NAME}.*`,
        '',
        'Examples:',
        '  apikit build:app',
        '  apikit build:app --dir ./apps/main-api',
        '  apikit build:app -c custom.config',
      ].join('\n'),
    },
    args: commandArgs,
    run: async ({ args }) => runApp(args as CommandOptions, runtime),
  });
}

async function runApp(args: CommandOptions, runtime: CliRuntime): Promise<void> {
  try {
    const loaded = await loadApiKitConfig({ dir: args.dir, config: args.config });
    const generatorConfig = await resolveAppGeneratorConfig(loaded.config);

    cli.title('ApiKit', 'app', [
      { label: 'config', value: formatPath(loaded.configFilePath) },
      { label: 'output', value: generatorConfig.build.outDir },
    ]);

    const environments = Object.entries(loaded.config.environments);

    cli.panel(
      'environments',
      environments.map(([name, environment]) => ({
        label: name,
        value: environment.fileDir ? `${environment.fileDir}/${environment.file}` : environment.file,
      })),
      environments.length,
    );

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
