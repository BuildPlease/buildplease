import { loadI18nConfig } from '@internal/configuration';
import { generateI18n } from '@internal/generator';
import { resolveI18nGeneratorConfig } from '@internal/generator/configuration/i18n-generator-config';
import { Console } from '@meawkit/core/node';
import { defineCommand } from 'citty';

import type { CliRuntime } from '../../runtime';
import { type CommandOptions, commandArgs, fail, formatPath, runInDirectory } from '../shared';

const cli = new Console();

export function createBuildI18nCommand(runtime: CliRuntime) {
  return defineCommand({
    meta: {
      name: 'build:i18n',
      description: [
        'Generate ApiKit i18n output',
        '',
        'Usage:',
        '  apikit build:i18n [--dir <directory>] [--config <config-name>]',
        '',
        'Config lookup:',
        '  apikit.i18n.config.*',
        '',
        'Examples:',
        '  apikit build:i18n',
        '  apikit build:i18n --dir ./packages/backend',
        '  apikit build:i18n -c custom.i18n.config',
      ].join('\n'),
    },
    args: commandArgs,
    run: async ({ args }) => runI18n(args as CommandOptions, runtime),
  });
}

async function runI18n(args: CommandOptions, runtime: CliRuntime): Promise<void> {
  try {
    const loaded = await loadI18nConfig({ dir: args.dir, config: args.config });
    const generatorConfig = resolveI18nGeneratorConfig(loaded.config);

    cli.title('ApiKit', 'i18n', [
      { label: 'config', value: formatPath(loaded.configFilePath) },
      { label: 'output', value: generatorConfig.build.outDir },
    ]);

    await runInDirectory(loaded.rootDir, () => generateI18n({ generatorConfig: generatorConfig }));

    cli.success(cli.step('i18n', `Generated ${generatorConfig.build.outDir}`));
    cli.success(cli.step('done', `Completed in ${cli.duration(Date.now() - runtime.startTime)}`));
    cli.emptyLine();
  } catch (error) {
    fail('ApiKit i18n generation failed', error);
  }
}
