import { i18nConfigTask, loadConfigForTask } from '@internal/configuration';
import { ConsoleOutput } from '@internal/console';
import { generateApiKitI18n } from '@internal/generator';
import { resolveApiKitI18nGeneratorConfig } from '@internal/generator/configuration/i18n-generator-config';
import { defineCommand } from 'citty';

import { type CommandOptions, commandArgs, fail, formatPath, runInDirectory } from '../shared';

export const buildI18nCommand = defineCommand({
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
  run: async ({ args }) => runI18n(args as CommandOptions),
});

async function runI18n(args: CommandOptions): Promise<void> {
  try {
    const loaded = await loadConfigForTask(i18nConfigTask, { dir: args.dir, config: args.config });
    const generatorConfig = resolveApiKitI18nGeneratorConfig(loaded.config);
    const startedAt = Date.now();

    ConsoleOutput.title('ApiKit', 'i18n', [
      { label: 'config', value: formatPath(loaded.configFilePath) },
      { label: 'output', value: generatorConfig.build.outDir },
    ]);

    await runInDirectory(loaded.rootDir, () => generateApiKitI18n({ generatorConfig: generatorConfig }));

    ConsoleOutput.success(ConsoleOutput.step('i18n', `Generated ${generatorConfig.build.outDir}`));
    ConsoleOutput.success(ConsoleOutput.step('done', `Completed in ${ConsoleOutput.duration(Date.now() - startedAt)}`));
    ConsoleOutput.emptyLine();
  } catch (error) {
    fail('ApiKit i18n generation failed', error);
  }
}
