import { loadAppConfig } from '@internal/configuration';
import { ConsoleOutput } from '@internal/console';
import { generateApp } from '@internal/generator';
import { resolveAppGeneratorConfig } from '@internal/generator/configuration/app-generator-config';
import { defineCommand } from 'citty';

import { type CommandOptions, commandArgs, fail, formatPath, runInDirectory } from '../shared';

export const buildAppCommand = defineCommand({
  meta: {
    name: 'build:app',
    description: [
      'Generate ApiKit app output',
      '',
      'Usage:',
      '  apikit build:app [--dir <directory>] [--config <config-name>]',
      '',
      'Config lookup:',
      '  apikit.app.config.*',
      '',
      'Examples:',
      '  apikit build:app',
      '  apikit build:app --dir ./apps/main-api',
      '  apikit build:app -c custom.app.config',
    ].join('\n'),
  },
  args: commandArgs,
  run: async ({ args }) => runApp(args as CommandOptions),
});

async function runApp(args: CommandOptions): Promise<void> {
  try {
    const loaded = await loadAppConfig({ dir: args.dir, config: args.config });
    const generatorConfig = await resolveAppGeneratorConfig(loaded.config);
    const startedAt = Date.now();

    ConsoleOutput.title('ApiKit', 'app', [
      { label: 'config', value: formatPath(loaded.configFilePath) },
      { label: 'output', value: generatorConfig.build.outDir },
    ]);

    const environments = Object.entries(loaded.config.environments);

    ConsoleOutput.panel(
      'environments',
      environments.map(([name, environment]) => ({
        label: name,
        value: environment.fileDir ? `${environment.fileDir}/${environment.file}` : environment.file,
      })),
      environments.length,
    );

    await runInDirectory(loaded.rootDir, () =>
      generateApp({ config: loaded.config, generatorConfig: generatorConfig }),
    );

    ConsoleOutput.success(ConsoleOutput.step('app', `Generated ${generatorConfig.build.outDir}`));
    ConsoleOutput.success(ConsoleOutput.step('done', `Completed in ${ConsoleOutput.duration(Date.now() - startedAt)}`));
    ConsoleOutput.emptyLine();
  } catch (error) {
    fail('ApiKit app build failed', error);
  }
}
